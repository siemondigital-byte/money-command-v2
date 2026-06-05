"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type MonthlyActionResult = {
  error?: string;
  ok?: boolean;
  exists?: boolean;
};

const numericString = z
  .string()
  .trim()
  .transform((v) => (v === "" ? 0 : Number(v.replace(",", "."))))
  .refine((v) => Number.isFinite(v) && v >= 0, "Debe ser un número >= 0");

const schema = z.object({
  year: z
    .string()
    .trim()
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v >= 2000 && v <= 2100, "Año inválido"),
  month: z
    .string()
    .trim()
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v >= 1 && v <= 12, "Mes inválido"),
  overwrite: z.string().optional(),

  incomeActive: numericString,
  incomePassive: numericString,
  incomeSecondary: numericString,

  expenseNeeds: numericString,
  expenseWants: numericString,
  expenseInvestments: numericString,

  liabilityCard: numericString,
  liabilityPersonal: numericString,
  liabilityMortgage: numericString,
  liabilityOther: numericString,

  assetCash: numericString,
  assetInvestments: numericString,
  assetRealEstate: numericString,
  assetOther: numericString,

  weightedReturn: numericString,
});

function getStr(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

function dec(n: number): Prisma.Decimal {
  return new Prisma.Decimal(Math.round(n * 100) / 100);
}

export async function saveMonthlyAction(
  _prev: MonthlyActionResult,
  formData: FormData,
): Promise<MonthlyActionResult> {
  const tag = `[saveMonthly ${Date.now().toString(36)}]`;
  console.log(tag, "invoked");

  const { user } = await requireUser();
  console.log(tag, "userId:", user.id);

  const rawInput = {
    year: getStr(formData, "year"),
    month: getStr(formData, "month"),
    overwrite: getStr(formData, "overwrite"),

    incomeActive: getStr(formData, "incomeActive"),
    incomePassive: getStr(formData, "incomePassive"),
    incomeSecondary: getStr(formData, "incomeSecondary"),

    expenseNeeds: getStr(formData, "expenseNeeds"),
    expenseWants: getStr(formData, "expenseWants"),
    expenseInvestments: getStr(formData, "expenseInvestments"),

    liabilityCard: getStr(formData, "liabilityCard"),
    liabilityPersonal: getStr(formData, "liabilityPersonal"),
    liabilityMortgage: getStr(formData, "liabilityMortgage"),
    liabilityOther: getStr(formData, "liabilityOther"),

    assetCash: getStr(formData, "assetCash"),
    assetInvestments: getStr(formData, "assetInvestments"),
    assetRealEstate: getStr(formData, "assetRealEstate"),
    assetOther: getStr(formData, "assetOther"),

    weightedReturn: getStr(formData, "weightedReturn"),
  };
  console.log(tag, "raw form:", rawInput);

  const parsed = schema.safeParse(rawInput);

  if (!parsed.success) {
    console.warn(tag, "zod validation failed:", parsed.error.flatten());
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const d = parsed.data;
  console.log(tag, "parsed:", d);

  const incomeTotal = d.incomeActive + d.incomePassive + d.incomeSecondary;
  const expenseTotal = d.expenseNeeds + d.expenseWants + d.expenseInvestments;
  const liabilityTotal =
    d.liabilityCard + d.liabilityPersonal + d.liabilityMortgage + d.liabilityOther;
  const assetTotal =
    d.assetCash + d.assetInvestments + d.assetRealEstate + d.assetOther;
  const netWorth = assetTotal - liabilityTotal;
  const savingsRate =
    incomeTotal > 0
      ? Math.round(((incomeTotal - expenseTotal) / incomeTotal) * 10000) / 100
      : 0;

  let existing;
  try {
    existing = await prisma.monthlyRecord.findUnique({
      where: {
        userId_year_month: { userId: user.id, year: d.year, month: d.month },
      },
    });
  } catch (err) {
    console.error(tag, "findUnique failed:", err);
    return {
      error: `No se pudo consultar la DB: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }
  console.log(tag, "existing record:", existing ? existing.id : "none");

  if (existing && d.overwrite !== "true") {
    console.log(tag, "exists and overwrite!=true → returning exists:true");
    return { exists: true };
  }

  const payload = {
    incomeActive: dec(d.incomeActive),
    incomePassive: dec(d.incomePassive),
    incomeSecondary: dec(d.incomeSecondary),
    incomeTotal: dec(incomeTotal),
    expenseNeeds: dec(d.expenseNeeds),
    expenseWants: dec(d.expenseWants),
    expenseInvestments: dec(d.expenseInvestments),
    expenseTotal: dec(expenseTotal),
    liabilityCard: dec(d.liabilityCard),
    liabilityPersonal: dec(d.liabilityPersonal),
    liabilityMortgage: dec(d.liabilityMortgage),
    liabilityOther: dec(d.liabilityOther),
    liabilityTotal: dec(liabilityTotal),
    assetCash: dec(d.assetCash),
    assetInvestments: dec(d.assetInvestments),
    assetRealEstate: dec(d.assetRealEstate),
    assetOther: dec(d.assetOther),
    assetTotal: dec(assetTotal),
    netWorth: dec(netWorth),
    savingsRate: dec(savingsRate),
    weightedReturn: dec(d.weightedReturn || 8),
  };

  try {
    if (existing) {
      const updated = await prisma.monthlyRecord.update({
        where: { id: existing.id },
        data: payload,
      });
      console.log(tag, "updated record:", updated.id);
    } else {
      const created = await prisma.monthlyRecord.create({
        data: {
          userId: user.id,
          year: d.year,
          month: d.month,
          ...payload,
        },
      });
      console.log(tag, "created record:", created.id);
    }
  } catch (err) {
    console.error(tag, "write failed:", err);
    return {
      error: `Error al guardar: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }

  revalidatePath("/monthly");
  revalidatePath("/dashboard");
  console.log(tag, "ok");
  return { ok: true };
}
