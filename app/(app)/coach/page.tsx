import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { activePeriod } from "@/lib/monthly";
import { portfolioTotal, weightedYield } from "@/lib/investments";
import { DEFAULT_PORTFOLIO_RETURN } from "@/lib/formulas";
import { freedomNumber } from "@/lib/dashboard";
import { buildScorecard, type CoachInputs } from "@/lib/coach";
import { conceptIndexForDate } from "@/lib/coach-content";
import { Scorecard } from "./Scorecard";
import { ConceptOfTheDay } from "./ConceptOfTheDay";

export const metadata = { title: "Coach · The Money Command" };

export default async function CoachPage() {
  const { user, profile } = await requireUser();
  const period = activePeriod({
    activeYear: profile.activeYear,
    activeMonth: profile.activeMonth,
  });

  // Solo LECTURA de datos que ya existen. No escribe, no consolida, no migra.
  const [record, records, debts, goals, investments] = await Promise.all([
    prisma.monthlyRecord.findUnique({
      where: {
        userId_year_month: {
          userId: user.id,
          year: period.year,
          month: period.month,
        },
      },
    }),
    prisma.monthlyRecord.findMany({ where: { userId: user.id } }),
    prisma.debt.findMany({ where: { userId: user.id, isActive: true } }),
    prisma.goal.findMany({ where: { userId: user.id, isActive: true } }),
    prisma.investment.findMany({ where: { userId: user.id, isActive: true } }),
  ]);

  // Ingreso/gasto del mes activo (consolidado).
  const incomeMonth = Number(record?.incomeTotal ?? 0);
  const expenseMonth = Number(record?.expenseTotal ?? 0);

  // Gasto mensual promedio (histórico) para el fondo de emergencia.
  const expenseMonths = records
    .map((r) => Number(r.expenseTotal))
    .filter((n) => n > 0);
  const avgMonthlyExpense =
    expenseMonths.length > 0
      ? expenseMonths.reduce((s, n) => s + n, 0) / expenseMonths.length
      : 0;

  // Patrimonio Neto y Número de Libertad: los MISMOS valores/helpers del
  // Dashboard (no se recalculan ni se toca su lógica).
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

  const input: CoachInputs = {
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

  const scorecard = buildScorecard(input);

  // Concepto del día: índice determinístico por fecha (mismo día → mismo
  // concepto). Se calcula en el server para evitar mismatch de hidratación.
  const conceptIndex = conceptIndexForDate(new Date());

  return (
    <div className="fade-up flex flex-col gap-6">
      <header>
        <div className="label mb-1">Coach</div>
        <h1>Tu salud financiera</h1>
        <p style={{ color: "var(--muted)", fontSize: "13px", marginTop: "8px" }}>
          Cinco métricas que el Coach lee de tus módulos (ingresos, gastos,
          deudas, inversiones y metas) para darte una foto de tu salud financiera
          y decirte qué priorizar. Es solo lectura: no cambia ninguno de tus
          datos.
        </p>
      </header>

      <ConceptOfTheDay initialIndex={conceptIndex} />

      <Scorecard scorecard={scorecard} />
    </div>
  );
}
