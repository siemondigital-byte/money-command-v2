"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type SettingsActionResult = { error?: string; ok?: boolean };

const PREFERRED_METHODS = ["50/30/20", "50/25/25", "50/20/30", "40/20/40"] as const;
const CURRENCIES = ["USD", "EUR", "ARS", "MXN", "COP", "CLP", "PEN", "BRL"] as const;
const LOCALES = ["es", "en"] as const;

const numericString = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : Number(v.replace(",", "."))))
  .refine(
    (v) => v === null || (Number.isFinite(v) && v >= 0),
    "Debe ser un número positivo",
  );

const intString = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : Number(v)))
  .refine(
    (v) => v === null || (Number.isInteger(v) && v >= 0),
    "Debe ser un entero positivo",
  );

const schema = z.object({
  name: z.string().trim().max(80).optional().nullable(),
  ageCurrent: intString,
  ageFreedomTarget: intString,
  country: z
    .string()
    .trim()
    .max(2)
    .optional()
    .nullable()
    .transform((v) => (v ? v.toUpperCase() : null)),

  compassWhat: z.string().trim().max(80).optional().nullable(),
  compassYear: intString,
  compassContribution: z.string().trim().max(80).optional().nullable(),

  thermostatTarget: numericString,
  inflationRate: numericString,
  freedomMonthlySpend: numericString,
  salaryGrowthRate: numericString,

  preferredMethod: z.enum(PREFERRED_METHODS),
  currency: z.enum(CURRENCIES),
  locale: z.enum(LOCALES),
});

function getStr(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

export async function updateSettingsAction(
  _prev: SettingsActionResult,
  formData: FormData,
): Promise<SettingsActionResult> {
  const { user } = await requireUser();

  const parsed = schema.safeParse({
    name: getStr(formData, "name") || null,
    ageCurrent: getStr(formData, "ageCurrent"),
    ageFreedomTarget: getStr(formData, "ageFreedomTarget"),
    country: getStr(formData, "country") || null,
    compassWhat: getStr(formData, "compassWhat") || null,
    compassYear: getStr(formData, "compassYear"),
    compassContribution: getStr(formData, "compassContribution") || null,
    thermostatTarget: getStr(formData, "thermostatTarget"),
    inflationRate: getStr(formData, "inflationRate"),
    freedomMonthlySpend: getStr(formData, "freedomMonthlySpend"),
    salaryGrowthRate: getStr(formData, "salaryGrowthRate"),
    preferredMethod: getStr(formData, "preferredMethod"),
    currency: getStr(formData, "currency"),
    locale: getStr(formData, "locale"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const data = parsed.data;

  await prisma.profile.update({
    where: { userId: user.id },
    data: {
      name: data.name,
      ageCurrent: data.ageCurrent,
      ageFreedomTarget: data.ageFreedomTarget,
      country: data.country,
      compassWhat: data.compassWhat,
      compassYear: data.compassYear,
      compassContribution: data.compassContribution,
      thermostatTarget: data.thermostatTarget ?? null,
      inflationRate: data.inflationRate ?? 3.0,
      freedomMonthlySpend: data.freedomMonthlySpend ?? null,
      salaryGrowthRate: data.salaryGrowthRate ?? 2.5,
      preferredMethod: data.preferredMethod,
      currency: data.currency,
      locale: data.locale,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/", "layout");
  return { ok: true };
}
