"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Edición y borrado manual de meses en History.
 *
 * History permite corregir a mano un mes registrado (ARQUITECTURA.md §3:
 * los snapshots de meses pasados son editables a mano). El edit toca las
 * cifras de cabecera que la tabla muestra — Ingresos, Gastos, Patrimonio —
 * y la FECHA (mes/año). NO re-consolida desde entidades vivas: lo que el
 * usuario escribe acá persiste tal cual. La tasa de ahorro se recomputa a
 * partir de Ingresos y Gastos para que cuadre con lo mostrado.
 */

export type HistoryActionResult = { error?: string; ok?: boolean };

const numericString = z
  .string()
  .trim()
  .transform((v) => (v === "" ? 0 : Number(v.replace(",", "."))))
  .refine((v) => Number.isFinite(v) && v >= 0, "Debe ser un número >= 0");

const editSchema = z.object({
  id: z.string().trim().min(1, "Falta el id"),
  year: z
    .string()
    .trim()
    .transform((v) => Number(v))
    .refine(
      (v) => Number.isInteger(v) && v >= 2000 && v <= 2100,
      "Año inválido",
    ),
  month: z
    .string()
    .trim()
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v >= 1 && v <= 12, "Mes inválido"),
  incomeTotal: numericString,
  expenseTotal: numericString,
  netWorth: numericString,
});

function getStr(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function dec(n: number): Prisma.Decimal {
  return new Prisma.Decimal(round2(n));
}

export async function updateMonthlyRecordAction(
  _prev: HistoryActionResult,
  formData: FormData,
): Promise<HistoryActionResult> {
  const { user } = await requireUser();

  const parsed = editSchema.safeParse({
    id: getStr(formData, "id"),
    year: getStr(formData, "year"),
    month: getStr(formData, "month"),
    incomeTotal: getStr(formData, "incomeTotal"),
    expenseTotal: getStr(formData, "expenseTotal"),
    netWorth: getStr(formData, "netWorth"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { id, year, month, incomeTotal, expenseTotal, netWorth } = parsed.data;

  // Verificar pertenencia antes de tocar la fila
  const existing = await prisma.monthlyRecord.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!existing) {
    return { error: "Registro no encontrado o sin permiso" };
  }

  const savingsRate =
    incomeTotal > 0 ? round2(((incomeTotal - expenseTotal) / incomeTotal) * 100) : 0;

  try {
    await prisma.monthlyRecord.update({
      where: { id },
      data: {
        year,
        month,
        incomeTotal: dec(incomeTotal),
        expenseTotal: dec(expenseTotal),
        netWorth: dec(netWorth),
        savingsRate: dec(savingsRate),
      },
    });
  } catch (err) {
    // P2002 = unique (userId, year, month): ya hay un registro en ese mes
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { error: "Ya existe un registro para ese mes/año." };
    }
    console.error("[updateMonthlyRecord] failed:", err);
    return {
      error: `Error al guardar: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }

  revalidatePath("/history");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteMonthlyRecordAction(formData: FormData) {
  const { user } = await requireUser();
  const id = getStr(formData, "id");
  if (!id) return;

  await prisma.monthlyRecord.deleteMany({
    where: { id, userId: user.id },
  });
  revalidatePath("/history");
  revalidatePath("/dashboard");
}
