"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  activePeriod,
  consolidatePeriodFromLiveEntities,
  type Period,
} from "@/lib/monthly";
import { advanceBalance, monthsElapsed, DEBT_TYPES, DEBT_PURPOSES } from "@/lib/debts";

/**
 * Server Actions del módulo Debts (capa 1).
 *
 * Debts es estado actual: una fila por deuda, con su saldo y la fecha de
 * corte (balanceAsOf). Al crear/editar se fija el as-of al período activo.
 * La confirmación mensual avanza el saldo (confirmar-para-avanzar). Tras
 * cada mutación se re-consolida debtTotal al MonthlyRecord del período.
 */

export type DebtActionResult = { error?: string; ok?: boolean };

async function getActivePeriod(userId: string): Promise<Period | null> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { activeYear: true, activeMonth: true },
  });
  if (!profile) return null;
  return activePeriod(profile);
}

async function reconsolidateActivePeriod(userId: string): Promise<void> {
  try {
    const period = await getActivePeriod(userId);
    if (!period) return;
    await consolidatePeriodFromLiveEntities(userId, period);
  } catch (err) {
    console.error("[debts] reconsolidate failed:", err);
  }
}

const numericString = z
  .string()
  .trim()
  .transform((v) => (v === "" ? 0 : Number(v.replace(",", "."))))
  .refine((v) => Number.isFinite(v) && v >= 0, "Debe ser un número >= 0");

const aprString = z
  .string()
  .trim()
  .transform((v) => (v === "" ? 0 : Number(v.replace(",", "."))))
  .refine((v) => Number.isFinite(v) && v >= 0 && v <= 200, "APR inválido");

const optionalIntString = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : Number(v)))
  .refine(
    (v) => v === null || (Number.isInteger(v) && v > 0 && v <= 600),
    "Cuotas inválidas",
  );

const debtSchema = z.object({
  name: z.string().trim().min(1, "Ingresá un nombre").max(80),
  type: z.enum(DEBT_TYPES as [string, ...string[]]),
  purpose: z.enum(DEBT_PURPOSES as [string, ...string[]]),
  balance: numericString,
  apr: aprString,
  minPayment: numericString,
  currentPayment: numericString,
  termMonths: optionalIntString,
});

function getStr(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

function dec(n: number): Prisma.Decimal {
  return new Prisma.Decimal(Math.round(n * 100) / 100);
}

function revalidateAll() {
  revalidatePath("/debts");
  revalidatePath("/dashboard");
  revalidatePath("/history");
}

function parse(formData: FormData) {
  return debtSchema.safeParse({
    name: getStr(formData, "name"),
    type: getStr(formData, "type"),
    purpose: getStr(formData, "purpose"),
    balance: getStr(formData, "balance"),
    apr: getStr(formData, "apr"),
    minPayment: getStr(formData, "minPayment"),
    currentPayment: getStr(formData, "currentPayment"),
    termMonths: getStr(formData, "termMonths"),
  });
}

// ============================================================================
// Create / Update / Delete
// ============================================================================
export async function createDebtAction(
  _prev: DebtActionResult,
  formData: FormData,
): Promise<DebtActionResult> {
  const { user } = await requireUser();

  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const period = await getActivePeriod(user.id);
  if (!period) return { error: "No se encontró el perfil del usuario" };

  try {
    await prisma.debt.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        type: parsed.data.type,
        purpose: parsed.data.purpose,
        balance: dec(parsed.data.balance),
        apr: dec(parsed.data.apr),
        minPayment: dec(parsed.data.minPayment),
        currentPayment: dec(parsed.data.currentPayment),
        termMonths: parsed.data.termMonths,
        // Fecha de corte del saldo = período activo (recién registrado).
        balanceAsOfYear: period.year,
        balanceAsOfMonth: period.month,
      },
    });
  } catch (err) {
    console.error("[createDebt] failed:", err);
    return {
      error: `Error al crear: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  await reconsolidateActivePeriod(user.id);
  revalidateAll();
  return { ok: true };
}

export async function updateDebtAction(
  _prev: DebtActionResult,
  formData: FormData,
): Promise<DebtActionResult> {
  const { user } = await requireUser();

  const id = getStr(formData, "id");
  if (!id) return { error: "Falta el id" };

  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const period = await getActivePeriod(user.id);
  if (!period) return { error: "No se encontró el perfil del usuario" };

  try {
    // Editar fija el saldo nuevo como verdad y mueve el as-of al período
    // activo (recalcula desde este punto).
    const r = await prisma.debt.updateMany({
      where: { id, userId: user.id },
      data: {
        name: parsed.data.name,
        type: parsed.data.type,
        purpose: parsed.data.purpose,
        balance: dec(parsed.data.balance),
        apr: dec(parsed.data.apr),
        minPayment: dec(parsed.data.minPayment),
        currentPayment: dec(parsed.data.currentPayment),
        termMonths: parsed.data.termMonths,
        balanceAsOfYear: period.year,
        balanceAsOfMonth: period.month,
      },
    });
    if (r.count === 0) return { error: "Deuda no encontrada o sin permiso" };
  } catch (err) {
    console.error("[updateDebt] failed:", err);
    return {
      error: `Error al actualizar: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  await reconsolidateActivePeriod(user.id);
  revalidateAll();
  return { ok: true };
}

export async function deleteDebtAction(formData: FormData) {
  const { user } = await requireUser();
  const id = getStr(formData, "id");
  if (!id) return;

  await prisma.debt.deleteMany({ where: { id, userId: user.id } });
  await reconsolidateActivePeriod(user.id);
  revalidateAll();
}

// ============================================================================
// Confirmación de pago del mes (confirmar-para-avanzar)
// ============================================================================
/**
 * La persona confirma que pagó lo registrado este mes. Para cada deuda con
 * as-of anterior al período activo, avanza el saldo amortizando los meses
 * transcurridos con su pago real y APR, y mueve el as-of al período activo.
 */
export async function confirmDebtPaymentsAction(_formData: FormData) {
  const { user } = await requireUser();
  const period = await getActivePeriod(user.id);
  if (!period) return;

  const debts = await prisma.debt.findMany({
    where: { userId: user.id, isActive: true },
    select: {
      id: true,
      balance: true,
      apr: true,
      currentPayment: true,
      balanceAsOfYear: true,
      balanceAsOfMonth: true,
    },
  });

  for (const d of debts) {
    const asOf = { year: d.balanceAsOfYear, month: d.balanceAsOfMonth };
    const months = monthsElapsed(asOf, period);
    if (months <= 0) continue;
    const newBalance = advanceBalance(
      Number(d.balance),
      Number(d.apr),
      Number(d.currentPayment),
      months,
    );
    await prisma.debt.update({
      where: { id: d.id },
      data: {
        balance: dec(newBalance),
        balanceAsOfYear: period.year,
        balanceAsOfMonth: period.month,
      },
    });
  }

  await reconsolidateActivePeriod(user.id);
  revalidateAll();
}
