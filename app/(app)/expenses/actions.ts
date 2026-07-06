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
import { classificationFromBasket, type Basket } from "@/lib/expenses";

/**
 * Server Actions del módulo Expenses.
 *
 * Expenses es flujo del mes (ARQUITECTURA §3): cada gasto se estampa con el
 * período activo (igual que Income) y, tras cada mutación, se re-consolida el
 * MonthlyRecord del período (expensesTotal + canastas + savingsRate). La
 * consolidación vive en consolidatePeriodFromLiveEntities (fuente única).
 */

export type ExpenseActionResult = { error?: string; ok?: boolean };

async function reconsolidateActivePeriod(userId: string): Promise<void> {
  try {
    const period = await getActivePeriod(userId);
    if (!period) return;
    await consolidatePeriodFromLiveEntities(userId, period);
  } catch (err) {
    console.error("[expenses] reconsolidate failed:", err);
  }
}

async function getActivePeriod(userId: string): Promise<Period | null> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { activeYear: true, activeMonth: true },
  });
  if (!profile) return null;
  return activePeriod(profile);
}

const numericString = z
  .string()
  .trim()
  .transform((v) => (v === "" ? 0 : Number(v.replace(",", "."))))
  .refine((v) => Number.isFinite(v) && v >= 0, "Debe ser un número >= 0");

const expenseSchema = z.object({
  name: z.string().trim().min(1, "Ingresá un nombre").max(80),
  category: z.string().trim().min(1, "Elegí una categoría").max(40),
  type: z.enum(["fixed", "variable"]),
  basket: z.enum(["essentials", "style", "freedom"]),
  budget: numericString,
  amount: numericString,
});

const subscriptionSchema = z.object({
  name: z.string().trim().min(1, "Ingresá un nombre").max(80),
  category: z.string().trim().max(40),
  amount: numericString,
});

function getStr(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

function dec(n: number): Prisma.Decimal {
  return new Prisma.Decimal(Math.round(n * 100) / 100);
}

function revalidateAll() {
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/history");
}

// ============================================================================
// Gasto fijo / variable
// ============================================================================
export async function createExpenseAction(
  _prev: ExpenseActionResult,
  formData: FormData,
): Promise<ExpenseActionResult> {
  const { user } = await requireUser();

  const parsed = expenseSchema.safeParse({
    name: getStr(formData, "name"),
    category: getStr(formData, "category"),
    type: getStr(formData, "type"),
    basket: getStr(formData, "basket"),
    budget: getStr(formData, "budget"),
    amount: getStr(formData, "amount"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const period = await getActivePeriod(user.id);
  if (!period) return { error: "No se encontró el perfil del usuario" };

  try {
    await prisma.expense.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        category: parsed.data.category,
        type: parsed.data.type,
        basket: parsed.data.basket,
        // columna legacy NOT NULL: derivada del basket (ver CONTEXT.md)
        classification: classificationFromBasket(parsed.data.basket as Basket),
        periodicity: "monthly",
        budget: dec(parsed.data.budget),
        amount: dec(parsed.data.amount),
        year: period.year,
        month: period.month,
      },
    });
  } catch (err) {
    console.error("[createExpense] failed:", err);
    return {
      error: `Error al crear: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  await reconsolidateActivePeriod(user.id);
  revalidateAll();
  return { ok: true };
}

export async function updateExpenseAction(
  _prev: ExpenseActionResult,
  formData: FormData,
): Promise<ExpenseActionResult> {
  const { user } = await requireUser();

  const id = getStr(formData, "id");
  if (!id) return { error: "Falta el id" };

  const parsed = expenseSchema.safeParse({
    name: getStr(formData, "name"),
    category: getStr(formData, "category"),
    type: getStr(formData, "type"),
    basket: getStr(formData, "basket"),
    budget: getStr(formData, "budget"),
    amount: getStr(formData, "amount"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    // No tocamos year/month: el período de la fila lo define el selector.
    const r = await prisma.expense.updateMany({
      where: { id, userId: user.id },
      data: {
        name: parsed.data.name,
        category: parsed.data.category,
        type: parsed.data.type,
        basket: parsed.data.basket,
        classification: classificationFromBasket(parsed.data.basket as Basket),
        budget: dec(parsed.data.budget),
        amount: dec(parsed.data.amount),
      },
    });
    if (r.count === 0) return { error: "Egreso no encontrado o sin permiso" };
  } catch (err) {
    console.error("[updateExpense] failed:", err);
    return {
      error: `Error al actualizar: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  await reconsolidateActivePeriod(user.id);
  revalidateAll();
  return { ok: true };
}

export async function deleteExpenseAction(formData: FormData) {
  const { user } = await requireUser();
  const id = getStr(formData, "id");
  if (!id) return;

  await prisma.expense.deleteMany({ where: { id, userId: user.id } });
  await reconsolidateActivePeriod(user.id);
  revalidateAll();
}

// ============================================================================
// Suscripción (absorbida en Estilo, flag dedicado isSubscription)
// ============================================================================
export async function createSubscriptionAction(
  _prev: ExpenseActionResult,
  formData: FormData,
): Promise<ExpenseActionResult> {
  const { user } = await requireUser();

  const parsed = subscriptionSchema.safeParse({
    name: getStr(formData, "name"),
    category: getStr(formData, "category") || "suscripciones",
    amount: getStr(formData, "amount"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const period = await getActivePeriod(user.id);
  if (!period) return { error: "No se encontró el perfil del usuario" };

  try {
    await prisma.expense.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        category: parsed.data.category,
        type: "fixed",
        basket: "style", // las suscripciones viven en Estilo (ANEXO §2/§3)
        classification: classificationFromBasket("style"),
        periodicity: "monthly",
        budget: dec(parsed.data.amount), // presupuesto = costo/mes
        amount: dec(parsed.data.amount),
        isSubscription: true,
        isAntExpense: true,
        year: period.year,
        month: period.month,
      },
    });
  } catch (err) {
    console.error("[createSubscription] failed:", err);
    return {
      error: `Error al crear: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  await reconsolidateActivePeriod(user.id);
  revalidateAll();
  return { ok: true };
}
