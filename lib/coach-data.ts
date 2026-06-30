/**
 * Reúne el contexto financiero REAL del usuario para el Coach.
 *
 * Extrae, sin cambiarla, la lógica que antes vivía inline en coach/page.tsx para
 * armar el `CoachInputs` (la misma que alimenta el scorecard). Ahora la comparten
 * la página (scorecard) y la Server Action del Coach (contexto para la IA).
 *
 * Solo LECTURA: no escribe, no consolida, no recalcula nada. Reusa los mismos
 * helpers/valores que el Dashboard, para no contradecir lo que el usuario ve.
 */

import { prisma } from "./prisma";
import { activePeriod } from "./monthly";
import { portfolioTotal, weightedYield } from "./investments";
import { DEFAULT_PORTFOLIO_RETURN } from "./formulas";
import { freedomNumber } from "./dashboard";
import type { CoachInputs } from "./coach";

/**
 * Datos del Coach: el `inputs` exacto que consume buildScorecard (igual que
 * antes), más extras reales para el contexto de IA (canastas, tasa de ahorro,
 * tasa de retorno usada para el NLF).
 */
export interface CoachData {
  inputs: CoachInputs;
  /** Canastas de gasto del mes activo (reales). */
  essentials: number;
  style: number;
  freedom: number;
  /** Tasa de ahorro del mes activo en % ((ingreso - gasto) / ingreso × 100). */
  savingsRatePct: number;
  /** Tasa de retorno usada para el NLF (yield ponderado del portafolio, o 8%). */
  freedomRate: number;
}

export async function gatherCoachData(params: {
  userId: string;
  activeYear: number | null;
  activeMonth: number | null;
}): Promise<CoachData> {
  const { userId } = params;
  const period = activePeriod({
    activeYear: params.activeYear,
    activeMonth: params.activeMonth,
  });

  const [record, records, debts, goals, investments] = await Promise.all([
    prisma.monthlyRecord.findUnique({
      where: {
        userId_year_month: {
          userId,
          year: period.year,
          month: period.month,
        },
      },
    }),
    prisma.monthlyRecord.findMany({ where: { userId } }),
    prisma.debt.findMany({ where: { userId, isActive: true } }),
    prisma.goal.findMany({ where: { userId, isActive: true } }),
    prisma.investment.findMany({ where: { userId, isActive: true } }),
  ]);

  const incomeMonth = Number(record?.incomeTotal ?? 0);
  const expenseMonth = Number(record?.expenseTotal ?? 0);
  const essentials = Number(record?.essentials ?? 0);
  const style = Number(record?.style ?? 0);
  const freedom = Number(record?.freedom ?? 0);

  const expenseMonths = records
    .map((r) => Number(r.expenseTotal))
    .filter((n) => n > 0);
  const avgMonthlyExpense =
    expenseMonths.length > 0
      ? expenseMonths.reduce((s, n) => s + n, 0) / expenseMonths.length
      : 0;

  const netWorth = Number(record?.netWorth ?? 0);
  const projPositions = investments.map((p) => ({
    capital: Number(p.capital),
    monthlyContribution: Number(p.monthlyContribution),
    passiveYield: Number(p.passiveYield),
  }));
  const portfolio = portfolioTotal(projPositions);
  const wYield = weightedYield(projPositions);
  const freedomRate =
    portfolio > 0 && wYield > 0 ? wYield : DEFAULT_PORTFOLIO_RETURN;
  const monthlyExpense = expenseMonth > 0 ? expenseMonth : avgMonthlyExpense;
  const nlf = freedomNumber(monthlyExpense, freedomRate);

  const savingsRatePct =
    incomeMonth > 0 ? ((incomeMonth - expenseMonth) / incomeMonth) * 100 : 0;

  const inputs: CoachInputs = {
    incomeMonth,
    expenseMonth,
    avgMonthlyExpense,
    netWorth,
    nlf,
    debts: debts.map((d) => ({
      name: d.name ?? "Deuda",
      apr: Number(d.apr),
      currentPayment: Number(d.currentPayment),
    })),
    goals: goals.map((g) => ({
      name: g.name,
      basket: g.basket,
      currentAmount: Number(g.currentAmount),
    })),
    investments: investments.map((p) => ({
      capital: Number(p.capital),
      category: p.category,
    })),
  };

  return { inputs, essentials, style, freedom, savingsRatePct, freedomRate };
}
