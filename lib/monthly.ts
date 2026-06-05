/**
 * MonthlyRecord — fuente única de verdad por usuario/mes.
 *
 * Acceso al MonthlyRecord del período activo. Las páginas de módulo escriben
 * acá; Dashboard, History y Coach leen exclusivamente de acá.
 *
 * Estructura del módulo:
 *
 *   Funciones puras (sin DB, sin "use server"):
 *     - activePeriod(profile, now?)
 *     - computeDerived(input)
 *     - periodToString(period)
 *
 *   Funciones que tocan DB (importar SOLO desde Server Components / Actions):
 *     - getMonthlyRecord(userId, period)
 *     - getOrCreateMonthlyRecord(userId, period)
 *     - setActivePeriod(userId, period)
 *
 * Las funciones puras viven separadas para poder testearlas sin mockear Prisma
 * y poder importarlas desde cualquier capa.
 */

import { Prisma, type MonthlyRecord } from "@prisma/client";
import { prisma } from "./prisma";
import { monthlyPlanB } from "./formulas";
import { effectivePlanB } from "./income";

// ============================================================================
// Tipos
// ============================================================================

export type Period = {
  /** Año (ej. 2026) */
  year: number;
  /** Mes 1-12 */
  month: number;
};

export interface MonthlyInputs {
  // Flujo del mes
  planA: number;
  planB: number;
  planC: number;
  essentials: number;
  style: number;
  freedom: number;

  // Snapshots opcionales (estado actual)
  portfolioValue?: number;
  debtTotal?: number;
  investedThisMonth?: number;
  notRealized?: number;
}

export interface MonthlyDerived {
  incomeTotal: number;
  expensesTotal: number;
  /** % entero con 2 decimales: 0..100 */
  savingsRate: number;
  netWorth: number;
}

// ============================================================================
// Funciones puras
// ============================================================================

/**
 * Período activo del usuario.
 *
 * Si el Profile tiene `activeYear` y `activeMonth` seteados, los devuelve.
 * Si no, devuelve el mes calendario actual.
 *
 * `now` se inyecta para tests determinísticos.
 */
export function activePeriod(
  profile: { activeYear: number | null; activeMonth: number | null },
  now: Date = new Date(),
): Period {
  if (
    profile.activeYear !== null &&
    profile.activeMonth !== null &&
    Number.isInteger(profile.activeYear) &&
    Number.isInteger(profile.activeMonth) &&
    profile.activeMonth >= 1 &&
    profile.activeMonth <= 12
  ) {
    return { year: profile.activeYear, month: profile.activeMonth };
  }
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/**
 * Computa las métricas derivadas a partir de las entradas brutas del mes.
 *
 * - `incomeTotal` = planA + planB + planC
 * - `expensesTotal` = essentials + style + freedom
 * - `savingsRate` = (incomeTotal - expensesTotal) / incomeTotal × 100
 *                   (0 si incomeTotal es 0, para evitar división por cero)
 * - `netWorth` = portfolioValue - debtTotal (si están presentes)
 *
 * Las cifras se redondean a 2 decimales para que coincidan con la
 * representación visual.
 */
export function computeDerived(input: MonthlyInputs): MonthlyDerived {
  const incomeTotal = round2(input.planA + input.planB + input.planC);
  const expensesTotal = round2(
    input.essentials + input.style + input.freedom,
  );
  const savingsRate =
    incomeTotal > 0
      ? round2(((incomeTotal - expensesTotal) / incomeTotal) * 100)
      : 0;
  const netWorth = round2(
    (input.portfolioValue ?? 0) - (input.debtTotal ?? 0),
  );
  return { incomeTotal, expensesTotal, savingsRate, netWorth };
}

/** Representación canónica del período como string ("2026-06"). */
export function periodToString(p: Period): string {
  return `${p.year}-${String(p.month).padStart(2, "0")}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function dec(n: number): Prisma.Decimal {
  return new Prisma.Decimal(round2(n));
}

// ============================================================================
// Funciones con acceso a DB
// (importar SOLO desde Server Components o Server Actions)
// ============================================================================

/**
 * Lee el MonthlyRecord del usuario para el período. `null` si no existe.
 */
export async function getMonthlyRecord(
  userId: string,
  period: Period,
): Promise<MonthlyRecord | null> {
  return prisma.monthlyRecord.findUnique({
    where: {
      userId_year_month: {
        userId,
        year: period.year,
        month: period.month,
      },
    },
  });
}

/**
 * Lee el MonthlyRecord del usuario para el período. Si no existe, lo crea
 * con todos los campos en 0.
 *
 * Idempotente bajo carrera: si dos procesos llaman a la vez, uno gana y el
 * otro recupera la fila ya creada.
 */
export async function getOrCreateMonthlyRecord(
  userId: string,
  period: Period,
): Promise<MonthlyRecord> {
  const existing = await getMonthlyRecord(userId, period);
  if (existing) return existing;

  try {
    return await prisma.monthlyRecord.create({
      data: {
        userId,
        year: period.year,
        month: period.month,
      },
    });
  } catch (err) {
    // P2002 = unique constraint (otro proceso lo acaba de crear)
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const existing = await getMonthlyRecord(userId, period);
      if (existing) return existing;
    }
    throw err;
  }
}

/**
 * Setea el período activo del usuario en el Profile.
 */
export async function setActivePeriod(
  userId: string,
  period: Period,
): Promise<void> {
  await prisma.profile.update({
    where: { userId },
    data: {
      activeYear: period.year,
      activeMonth: period.month,
    },
  });
}

/**
 * Escribe los inputs del mes en el MonthlyRecord y recomputa las derivadas.
 *
 * Esta es la API que usarán Income y Expenses para consolidar en FASE B.
 * Crea el record si no existe, actualiza si existe.
 *
 * Sólo modifica los campos cuyos valores se pasan; las claves que sean
 * `undefined` en `partial` se ignoran.
 */
export async function upsertMonthlyData(
  userId: string,
  period: Period,
  partial: Partial<MonthlyInputs>,
): Promise<MonthlyRecord> {
  const current = await getOrCreateMonthlyRecord(userId, period);

  const merged: MonthlyInputs = {
    planA: partial.planA ?? Number(current.incomeActive ?? 0),
    planB: partial.planB ?? Number(current.incomePassive ?? 0),
    planC: partial.planC ?? Number(current.incomeSecondary ?? 0),
    essentials: partial.essentials ?? Number(current.essentials ?? 0),
    style: partial.style ?? Number(current.style ?? 0),
    freedom: partial.freedom ?? Number(current.freedom ?? 0),
    portfolioValue:
      partial.portfolioValue ?? Number(current.portfolioValue ?? 0),
    debtTotal: partial.debtTotal ?? Number(current.debtTotal ?? 0),
    investedThisMonth:
      partial.investedThisMonth ?? Number(current.investedThisMonth ?? 0),
    notRealized: partial.notRealized ?? Number(current.notRealized ?? 0),
  };

  const derived = computeDerived(merged);

  return prisma.monthlyRecord.update({
    where: { id: current.id },
    data: {
      // Flujo del mes — escribimos en los campos canónicos
      incomeActive: dec(merged.planA),
      incomePassive: dec(merged.planB),
      incomeSecondary: dec(merged.planC),
      essentials: dec(merged.essentials),
      style: dec(merged.style),
      freedom: dec(merged.freedom),

      // Snapshots
      portfolioValue: dec(merged.portfolioValue ?? 0),
      debtTotal: dec(merged.debtTotal ?? 0),
      investedThisMonth: dec(merged.investedThisMonth ?? 0),
      notRealized: dec(merged.notRealized ?? 0),

      // Derivadas
      incomeTotal: dec(derived.incomeTotal),
      expenseTotal: dec(derived.expensesTotal), // legacy mirror
      savingsRate: dec(derived.savingsRate),
      netWorth: dec(derived.netWorth),
    },
  });
}

/**
 * Consolida el MonthlyRecord del período tomando los valores actuales de
 * las entidades vivas del usuario:
 *
 *   - Plan A = Σ Income filas activas con plan="A"
 *   - Plan B = monthlyPlanB(Investments activas) o el override del Profile
 *   - Plan C = Σ Income filas activas con plan="C"
 *   - portfolioValue = Σ capital de Investments activas
 *
 * Es la API que las Server Actions de Income e Investments deben llamar
 * al final de cada mutación. También la llama el Server Action que cambia
 * el período activo, para que el MonthlyRecord del nuevo período refleje
 * el estado vivo actual.
 *
 * No toca essentials/style/freedom (Expenses, FASE futura), debtTotal
 * (Debts, FASE futura), ni notRealized (lógica del Coach).
 */
export async function consolidatePeriodFromLiveEntities(
  userId: string,
  period: Period,
): Promise<MonthlyRecord> {
  const [profile, incomes, investments] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId },
      select: {
        planBManualOverride: true,
        planBManualAmount: true,
      },
    }),
    prisma.income.findMany({
      where: { userId, isActive: true },
      select: { plan: true, amount: true },
    }),
    prisma.investment.findMany({
      where: { userId, isActive: true },
      select: { capital: true, passiveYield: true },
    }),
  ]);

  const planA = incomes
    .filter((i) => i.plan === "A")
    .reduce((s, i) => s + Number(i.amount), 0);

  const planC = incomes
    .filter((i) => i.plan === "C")
    .reduce((s, i) => s + Number(i.amount), 0);

  const positions = investments.map((i) => ({
    capital: Number(i.capital),
    passiveYield: Number(i.passiveYield),
  }));

  // Plan B respeta el override del Profile (consistente con effectivePlanB)
  const planB = profile
    ? effectivePlanB({
        positions,
        manualOverride: profile.planBManualOverride,
        manualAmount:
          profile.planBManualAmount !== null
            ? Number(profile.planBManualAmount)
            : null,
      }).amount
    : monthlyPlanB(positions);

  const portfolioValue = positions.reduce((s, p) => s + p.capital, 0);

  return upsertMonthlyData(userId, period, {
    planA,
    planB,
    planC,
    portfolioValue,
  });
}
