/**
 * Adaptadores para pasar modelos Prisma a Client Components.
 *
 * Next.js no serializa Prisma.Decimal automáticamente al cruzar el límite
 * Server → Client. Tampoco se garantiza serialización limpia de Date.
 * Estas funciones convierten:
 *   - Decimal     → number  (round a 2 decimales para amounts, raw para tasas)
 *   - Decimal?    → number | null
 *   - Date        → string ISO
 *   - Date?       → string | null
 *
 * Convención: usar el tipo Serialized<Model> en cualquier prop de un Client
 * Component que represente un modelo Prisma. Los Server Components y Server
 * Actions siguen usando los tipos crudos de Prisma.
 */

import type {
  Achievement,
  Debt,
  Expense,
  Goal,
  Income,
  Investment,
  MonthlyRecord,
  Profile,
  SavedScenario,
} from "@prisma/client";

// ============================================================================
// Helpers internos
// ============================================================================

function dec(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "object" && v !== null && "toNumber" in v) {
    return (v as { toNumber: () => number }).toNumber();
  }
  return Number(v);
}

function decN(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  return dec(v);
}

function isoReq(v: Date): string {
  return v.toISOString();
}

function isoOpt(v: Date | null | undefined): string | null {
  return v ? v.toISOString() : null;
}

// ============================================================================
// Profile
// ============================================================================

export type SerializedProfile = Omit<
  Profile,
  | "thermostatTarget"
  | "inflationRate"
  | "freedomMonthlySpend"
  | "salaryGrowthRate"
  | "createdAt"
  | "updatedAt"
> & {
  thermostatTarget: number | null;
  inflationRate: number;
  freedomMonthlySpend: number | null;
  salaryGrowthRate: number;
  createdAt: string;
  updatedAt: string;
};

export function serializeProfile(p: Profile): SerializedProfile {
  return {
    ...p,
    thermostatTarget: decN(p.thermostatTarget),
    inflationRate: dec(p.inflationRate),
    freedomMonthlySpend: decN(p.freedomMonthlySpend),
    salaryGrowthRate: dec(p.salaryGrowthRate),
    createdAt: isoReq(p.createdAt),
    updatedAt: isoReq(p.updatedAt),
  };
}

// ============================================================================
// MonthlyRecord
// ============================================================================

type MonthlyDecimalKeys =
  | "incomeActive"
  | "incomePassive"
  | "incomeSecondary"
  | "incomeTotal"
  | "expenseNeeds"
  | "expenseWants"
  | "expenseInvestments"
  | "expenseTotal"
  | "liabilityCard"
  | "liabilityPersonal"
  | "liabilityMortgage"
  | "liabilityOther"
  | "liabilityTotal"
  | "assetCash"
  | "assetInvestments"
  | "assetRealEstate"
  | "assetOther"
  | "assetTotal"
  | "netWorth"
  | "savingsRate"
  | "weightedReturn"
  | "potentialSavingsMissed";

export type SerializedMonthlyRecord = Omit<
  MonthlyRecord,
  MonthlyDecimalKeys | "recordedAt" | "createdAt" | "updatedAt"
> &
  Record<MonthlyDecimalKeys, number> & {
    recordedAt: string;
    createdAt: string;
    updatedAt: string;
  };

export function serializeMonthlyRecord(
  r: MonthlyRecord,
): SerializedMonthlyRecord {
  return {
    ...r,
    incomeActive: dec(r.incomeActive),
    incomePassive: dec(r.incomePassive),
    incomeSecondary: dec(r.incomeSecondary),
    incomeTotal: dec(r.incomeTotal),
    expenseNeeds: dec(r.expenseNeeds),
    expenseWants: dec(r.expenseWants),
    expenseInvestments: dec(r.expenseInvestments),
    expenseTotal: dec(r.expenseTotal),
    liabilityCard: dec(r.liabilityCard),
    liabilityPersonal: dec(r.liabilityPersonal),
    liabilityMortgage: dec(r.liabilityMortgage),
    liabilityOther: dec(r.liabilityOther),
    liabilityTotal: dec(r.liabilityTotal),
    assetCash: dec(r.assetCash),
    assetInvestments: dec(r.assetInvestments),
    assetRealEstate: dec(r.assetRealEstate),
    assetOther: dec(r.assetOther),
    assetTotal: dec(r.assetTotal),
    netWorth: dec(r.netWorth),
    savingsRate: dec(r.savingsRate),
    weightedReturn: dec(r.weightedReturn),
    potentialSavingsMissed: dec(r.potentialSavingsMissed),
    recordedAt: isoReq(r.recordedAt),
    createdAt: isoReq(r.createdAt),
    updatedAt: isoReq(r.updatedAt),
  };
}

// ============================================================================
// Income
// ============================================================================

export type SerializedIncome = Omit<
  Income,
  "amount" | "createdAt" | "updatedAt"
> & {
  amount: number;
  createdAt: string;
  updatedAt: string;
};

export function serializeIncome(i: Income): SerializedIncome {
  return {
    ...i,
    amount: dec(i.amount),
    createdAt: isoReq(i.createdAt),
    updatedAt: isoReq(i.updatedAt),
  };
}

// ============================================================================
// Expense
// ============================================================================

export type SerializedExpense = Omit<
  Expense,
  "amount" | "unitAmount" | "createdAt" | "updatedAt"
> & {
  amount: number;
  unitAmount: number | null;
  createdAt: string;
  updatedAt: string;
};

export function serializeExpense(e: Expense): SerializedExpense {
  return {
    ...e,
    amount: dec(e.amount),
    unitAmount: decN(e.unitAmount),
    createdAt: isoReq(e.createdAt),
    updatedAt: isoReq(e.updatedAt),
  };
}

// ============================================================================
// Debt
// ============================================================================

export type SerializedDebt = Omit<
  Debt,
  | "balance"
  | "apr"
  | "minPayment"
  | "currentPayment"
  | "originalAmount"
  | "createdAt"
  | "updatedAt"
> & {
  balance: number;
  apr: number;
  minPayment: number;
  currentPayment: number;
  originalAmount: number | null;
  createdAt: string;
  updatedAt: string;
};

export function serializeDebt(d: Debt): SerializedDebt {
  return {
    ...d,
    balance: dec(d.balance),
    apr: dec(d.apr),
    minPayment: dec(d.minPayment),
    currentPayment: dec(d.currentPayment),
    originalAmount: decN(d.originalAmount),
    createdAt: isoReq(d.createdAt),
    updatedAt: isoReq(d.updatedAt),
  };
}

// ============================================================================
// Investment
// ============================================================================

export type SerializedInvestment = Omit<
  Investment,
  "capital" | "passiveYield" | "createdAt" | "updatedAt"
> & {
  capital: number;
  passiveYield: number;
  createdAt: string;
  updatedAt: string;
};

export function serializeInvestment(i: Investment): SerializedInvestment {
  return {
    ...i,
    capital: dec(i.capital),
    passiveYield: dec(i.passiveYield),
    createdAt: isoReq(i.createdAt),
    updatedAt: isoReq(i.updatedAt),
  };
}

// ============================================================================
// Goal
// ============================================================================

export type SerializedGoal = Omit<
  Goal,
  | "targetAmount"
  | "currentAmount"
  | "monthlyContribution"
  | "targetDate"
  | "achievedAt"
  | "createdAt"
  | "updatedAt"
> & {
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  targetDate: string;
  achievedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function serializeGoal(g: Goal): SerializedGoal {
  return {
    ...g,
    targetAmount: dec(g.targetAmount),
    currentAmount: dec(g.currentAmount),
    monthlyContribution: dec(g.monthlyContribution),
    targetDate: isoReq(g.targetDate),
    achievedAt: isoOpt(g.achievedAt),
    createdAt: isoReq(g.createdAt),
    updatedAt: isoReq(g.updatedAt),
  };
}

// ============================================================================
// SavedScenario
// ============================================================================

type ScenarioDecimalKeys =
  | "monthlyContribution"
  | "weightedReturn"
  | "wantsReductionPct"
  | "incomeIncreasePct"
  | "extraCapital"
  | "yearsToFreedom"
  | "projectedNetWorth"
  | "passiveIncomeMonthly";

export type SerializedSavedScenario = Omit<
  SavedScenario,
  ScenarioDecimalKeys | "createdAt"
> &
  Record<ScenarioDecimalKeys, number> & {
    createdAt: string;
  };

export function serializeSavedScenario(
  s: SavedScenario,
): SerializedSavedScenario {
  return {
    ...s,
    monthlyContribution: dec(s.monthlyContribution),
    weightedReturn: dec(s.weightedReturn),
    wantsReductionPct: dec(s.wantsReductionPct),
    incomeIncreasePct: dec(s.incomeIncreasePct),
    extraCapital: dec(s.extraCapital),
    yearsToFreedom: dec(s.yearsToFreedom),
    projectedNetWorth: dec(s.projectedNetWorth),
    passiveIncomeMonthly: dec(s.passiveIncomeMonthly),
    createdAt: isoReq(s.createdAt),
  };
}

// ============================================================================
// Achievement (no tiene Decimal pero sí Date — incluido para uniformidad)
// ============================================================================

export type SerializedAchievement = Omit<Achievement, "unlockedAt"> & {
  unlockedAt: string;
};

export function serializeAchievement(a: Achievement): SerializedAchievement {
  return {
    ...a,
    unlockedAt: isoReq(a.unlockedAt),
  };
}
