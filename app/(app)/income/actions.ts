"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  try {
    await prisma.income.create({
      data: {
        userId: user.id,
        plan: parsed.data.plan,
        name: parsed.data.name,
        amount: dec(parsed.data.amount),
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

  revalidatePath("/income");
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

  revalidatePath("/income");
  return { ok: true };
}

export async function deleteIncomeAction(formData: FormData) {
  const { user } = await requireUser();
  const id = getStr(formData, "id");
  if (!id) return;

  await prisma.income.deleteMany({
    where: { id, userId: user.id },
  });
  revalidatePath("/income");
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

  revalidatePath("/income");
  revalidatePath("/investments");
  return { ok: true };
}
