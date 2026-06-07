"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BASKETS, type Basket } from "@/lib/expenses";

/**
 * Server Actions del módulo Metas (capa A).
 *
 * Metas es estado actual e INDEPENDIENTE: no toca la consolidación mensual ni
 * el flujo del mes. Cada meta lleva su canasta (basket); la columna legacy
 * `category` se deriva del basket para satisfacer su NOT NULL heredado
 * (limpieza futura, ver CONTEXT.md).
 */

export type GoalActionResult = { error?: string; ok?: boolean };

/** Deriva la columna legacy category (need|want|patrimony) desde el basket. */
function categoryFromBasket(basket: Basket): string {
  if (basket === "essentials") return "need";
  if (basket === "style") return "want";
  return "patrimony"; // freedom
}

const numericString = z
  .string()
  .trim()
  .transform((v) => (v === "" ? 0 : Number(v.replace(",", "."))))
  .refine((v) => Number.isFinite(v) && v >= 0, "Debe ser un número >= 0");

const goalSchema = z.object({
  name: z.string().trim().min(1, "Ingresá un nombre").max(80),
  basket: z.enum(BASKETS as [Basket, ...Basket[]]),
  targetAmount: numericString.refine((v) => v > 0, "El objetivo debe ser mayor a 0"),
  currentAmount: numericString,
  monthlyContribution: numericString,
  targetDate: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .refine(
      (v) => v === null || !Number.isNaN(new Date(v).getTime()),
      "Fecha inválida",
    ),
});

function getStr(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

function dec(n: number): Prisma.Decimal {
  return new Prisma.Decimal(Math.round(n * 100) / 100);
}

function parse(formData: FormData) {
  return goalSchema.safeParse({
    name: getStr(formData, "name"),
    basket: getStr(formData, "basket"),
    targetAmount: getStr(formData, "targetAmount"),
    currentAmount: getStr(formData, "currentAmount"),
    monthlyContribution: getStr(formData, "monthlyContribution"),
    targetDate: getStr(formData, "targetDate"),
  });
}

function dataFrom(parsed: z.infer<typeof goalSchema>) {
  return {
    name: parsed.name,
    basket: parsed.basket,
    category: categoryFromBasket(parsed.basket as Basket),
    targetAmount: dec(parsed.targetAmount),
    currentAmount: dec(parsed.currentAmount),
    monthlyContribution: dec(parsed.monthlyContribution),
    targetDate: parsed.targetDate ? new Date(parsed.targetDate) : null,
  };
}

// ============================================================================
// Create / Update / Delete
// ============================================================================
export async function createGoalAction(
  _prev: GoalActionResult,
  formData: FormData,
): Promise<GoalActionResult> {
  const { user } = await requireUser();

  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    await prisma.goal.create({
      data: { userId: user.id, ...dataFrom(parsed.data) },
    });
  } catch (err) {
    console.error("[createGoal] failed:", err);
    return {
      error: `Error al crear: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  revalidatePath("/goals");
  return { ok: true };
}

export async function updateGoalAction(
  _prev: GoalActionResult,
  formData: FormData,
): Promise<GoalActionResult> {
  const { user } = await requireUser();

  const id = getStr(formData, "id");
  if (!id) return { error: "Falta el id" };

  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    const r = await prisma.goal.updateMany({
      where: { id, userId: user.id },
      data: dataFrom(parsed.data),
    });
    if (r.count === 0) return { error: "Meta no encontrada o sin permiso" };
  } catch (err) {
    console.error("[updateGoal] failed:", err);
    return {
      error: `Error al actualizar: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  revalidatePath("/goals");
  return { ok: true };
}

export async function deleteGoalAction(formData: FormData) {
  const { user } = await requireUser();
  const id = getStr(formData, "id");
  if (!id) return;

  await prisma.goal.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/goals");
}
