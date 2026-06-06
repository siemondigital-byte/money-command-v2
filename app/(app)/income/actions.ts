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

/**
 * Tras mutar una entidad viva (Income o Plan B override), re-consolida el
 * MonthlyRecord del período activo del usuario para que Dashboard/History
 * lean siempre el estado vivo. Falla silenciosa: si el consolidate falla,
 * loggeamos pero no rompemos la acción del usuario.
 */
async function reconsolidateActivePeriod(userId: string): Promise<void> {
  try {
    const period = await getActivePeriod(userId);
    if (!period) return;
    await consolidatePeriodFromLiveEntities(userId, period);
  } catch (err) {
    console.error("[income] reconsolidate failed:", err);
  }
}

/**
 * Período activo del usuario (selector global). Income lo usa para estampar
 * las filas nuevas en el mes correcto. `null` si el Profile no existe.
 */
async function getActivePeriod(userId: string): Promise<Period | null> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { activeYear: true, activeMonth: true },
  });
  if (!profile) return null;
  return activePeriod(profile);
}

export type IncomeActionResult = { error?: string; ok?: boolean };

const numericString = z
  .string()
  .trim()
  .transform((v) => (v === "" ? 0 : Number(v.replace(",", "."))))
  .refine((v) => Number.isFinite(v) && v >= 0, "Debe ser un número >= 0");

const incomeRowSchema = z.object({
  plan: z.enum(["A", "C"]),
  name: z.string().trim().min(1, "Ingresá un nombre").max(80),
  amount: numericString,
});

function getStr(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

function dec(n: number): Prisma.Decimal {
  return new Prisma.Decimal(Math.round(n * 100) / 100);
}

// ============================================================================
// Create / Update / Delete fila Income (Plan A o C)
// ============================================================================
export async function createIncomeAction(
  _prev: IncomeActionResult,
  formData: FormData,
): Promise<IncomeActionResult> {
  const { user } = await requireUser();

  const parsed = incomeRowSchema.safeParse({
    plan: getStr(formData, "plan"),
    name: getStr(formData, "name"),
    amount: getStr(formData, "amount"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const period = await getActivePeriod(user.id);
  if (!period) return { error: "No se encontró el perfil del usuario" };

  try {
    await prisma.income.create({
      data: {
        userId: user.id,
        plan: parsed.data.plan,
        name: parsed.data.name,
        amount: dec(parsed.data.amount),
        // Income es flujo del mes: la fila pertenece al período activo.
        year: period.year,
        month: period.month,
      },
    });
  } catch (err) {
    console.error("[createIncome] failed:", err);
    return {
      error: `Error al crear: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }

  await reconsolidateActivePeriod(user.id);
  revalidatePath("/income");
  revalidatePath("/dashboard");
  revalidatePath("/history");
  return { ok: true };
}

export async function updateIncomeAction(
  _prev: IncomeActionResult,
  formData: FormData,
): Promise<IncomeActionResult> {
  const { user } = await requireUser();

  const id = getStr(formData, "id");
  if (!id) return { error: "Falta el id" };

  const parsed = incomeRowSchema.safeParse({
    plan: getStr(formData, "plan"),
    name: getStr(formData, "name"),
    amount: getStr(formData, "amount"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    const r = await prisma.income.updateMany({
      where: { id, userId: user.id },
      data: {
        plan: parsed.data.plan,
        name: parsed.data.name,
        amount: dec(parsed.data.amount),
      },
    });
    if (r.count === 0) return { error: "Fila no encontrada o sin permiso" };
  } catch (err) {
    console.error("[updateIncome] failed:", err);
    return {
      error: `Error al actualizar: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }

  await reconsolidateActivePeriod(user.id);
  revalidatePath("/income");
  revalidatePath("/dashboard");
  revalidatePath("/history");
  return { ok: true };
}

export async function deleteIncomeAction(formData: FormData) {
  const { user } = await requireUser();
  const id = getStr(formData, "id");
  if (!id) return;

  await prisma.income.deleteMany({
    where: { id, userId: user.id },
  });
  await reconsolidateActivePeriod(user.id);
  revalidatePath("/income");
  revalidatePath("/dashboard");
  revalidatePath("/history");
}

// ============================================================================
// Plan B override (toggle + monto)
// ============================================================================
const planBOverrideSchema = z.object({
  enable: z.string().optional(),
  amount: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v.replace(",", "."))))
    .refine(
      (v) => v === null || (Number.isFinite(v) && v >= 0),
      "Monto inválido",
    ),
});

export async function updatePlanBOverrideAction(
  _prev: IncomeActionResult,
  formData: FormData,
): Promise<IncomeActionResult> {
  const { user } = await requireUser();

  const parsed = planBOverrideSchema.safeParse({
    enable: getStr(formData, "enable"),
    amount: getStr(formData, "amount"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const enable = parsed.data.enable === "true";

  try {
    await prisma.profile.update({
      where: { userId: user.id },
      data: {
        planBManualOverride: enable,
        planBManualAmount:
          enable && parsed.data.amount !== null
            ? dec(parsed.data.amount)
            : null,
      },
    });
  } catch (err) {
    console.error("[updatePlanBOverride] failed:", err);
    return {
      error: `Error al guardar: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }

  await reconsolidateActivePeriod(user.id);
  revalidatePath("/income");
  revalidatePath("/investments");
  revalidatePath("/dashboard");
  revalidatePath("/history");
  return { ok: true };
}
