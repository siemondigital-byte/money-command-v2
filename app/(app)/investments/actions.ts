"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { INVESTMENT_CATEGORIES } from "@/lib/formulas";
import {
  activePeriod,
  consolidatePeriodFromLiveEntities,
} from "@/lib/monthly";

/**
 * Tras mutar una posición, consolida el MonthlyRecord del período activo:
 * recomputa Plan B (yields), portfolioValue (snapshot) y los escribe al
 * record del período. Si algo falla, loggeamos pero no rompemos.
 */
async function reconsolidateActivePeriod(userId: string): Promise<void> {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { activeYear: true, activeMonth: true },
    });
    if (!profile) return;
    const period = activePeriod(profile);
    await consolidatePeriodFromLiveEntities(userId, period);
  } catch (err) {
    console.error("[investments] reconsolidate failed:", err);
  }
}

export type InvestmentsActionResult = { error?: string; ok?: boolean };

const numericString = z
  .string()
  .trim()
  .transform((v) => (v === "" ? 0 : Number(v.replace(",", "."))))
  .refine((v) => Number.isFinite(v) && v >= 0, "Debe ser un número >= 0");

const positionSchema = z.object({
  category: z.enum(INVESTMENT_CATEGORIES),
  label: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  capital: numericString,
  passiveYieldPct: numericString.refine(
    (v) => v <= 100,
    "El yield no puede ser mayor a 100%",
  ),
});

function getStr(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

function dec(n: number): Prisma.Decimal {
  return new Prisma.Decimal(Math.round(n * 100) / 100);
}

/**
 * passiveYield se guarda como decimal (0.04 = 4%), pero la UI lo expone como
 * porcentaje legible (4). Conversión: pct / 100.
 */
function yieldDec(pct: number): Prisma.Decimal {
  return new Prisma.Decimal(Math.round((pct / 100) * 10_000) / 10_000);
}

// ============================================================================
// Create
// ============================================================================
export async function createInvestmentAction(
  _prev: InvestmentsActionResult,
  formData: FormData,
): Promise<InvestmentsActionResult> {
  const { user } = await requireUser();

  const parsed = positionSchema.safeParse({
    category: getStr(formData, "category"),
    label: getStr(formData, "label"),
    capital: getStr(formData, "capital"),
    passiveYieldPct: getStr(formData, "passiveYieldPct"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    await prisma.investment.create({
      data: {
        userId: user.id,
        category: parsed.data.category,
        label: parsed.data.label,
        capital: dec(parsed.data.capital),
        passiveYield: yieldDec(parsed.data.passiveYieldPct),
      },
    });
  } catch (err) {
    console.error("[createInvestment] failed:", err);
    return {
      error: `Error al crear: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }

  await reconsolidateActivePeriod(user.id);
  revalidatePath("/investments");
  revalidatePath("/income");
  revalidatePath("/dashboard");
  revalidatePath("/history");
  return { ok: true };
}

// ============================================================================
// Update
// ============================================================================
export async function updateInvestmentAction(
  _prev: InvestmentsActionResult,
  formData: FormData,
): Promise<InvestmentsActionResult> {
  const { user } = await requireUser();

  const id = getStr(formData, "id");
  if (!id) return { error: "Falta el id de la posición" };

  const parsed = positionSchema.safeParse({
    category: getStr(formData, "category"),
    label: getStr(formData, "label"),
    capital: getStr(formData, "capital"),
    passiveYieldPct: getStr(formData, "passiveYieldPct"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    const result = await prisma.investment.updateMany({
      where: { id, userId: user.id },
      data: {
        category: parsed.data.category,
        label: parsed.data.label,
        capital: dec(parsed.data.capital),
        passiveYield: yieldDec(parsed.data.passiveYieldPct),
      },
    });
    if (result.count === 0) {
      return { error: "Posición no encontrada o sin permiso" };
    }
  } catch (err) {
    console.error("[updateInvestment] failed:", err);
    return {
      error: `Error al actualizar: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }

  await reconsolidateActivePeriod(user.id);
  revalidatePath("/investments");
  revalidatePath("/income");
  revalidatePath("/dashboard");
  revalidatePath("/history");
  return { ok: true };
}

// ============================================================================
// Delete
// ============================================================================
export async function deleteInvestmentAction(formData: FormData) {
  const { user } = await requireUser();
  const id = getStr(formData, "id");
  if (!id) return;

  await prisma.investment.deleteMany({
    where: { id, userId: user.id },
  });

  await reconsolidateActivePeriod(user.id);
  revalidatePath("/investments");
  revalidatePath("/income");
  revalidatePath("/dashboard");
  revalidatePath("/history");
}
