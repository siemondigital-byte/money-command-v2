import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { activePeriod } from "@/lib/monthly";
import { buildScorecard, type CoachInputs } from "@/lib/coach";
import { Scorecard } from "./Scorecard";

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

  const input: CoachInputs = {
    incomeMonth,
    expenseMonth,
    avgMonthlyExpense,
    debts: debts.map((d) => ({
      name: d.name ?? "Deuda",
      balance: Number(d.balance),
      apr: Number(d.apr),
    })),
    goals: goals.map((g) => ({
      name: g.name,
      basket: g.basket,
      currentAmount: Number(g.currentAmount),
    })),
    investments: investments.map((p) => ({
      capital: Number(p.capital),
      monthlyContribution: Number(p.monthlyContribution),
      category: p.category,
    })),
  };

  const scorecard = buildScorecard(input);

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

      <Scorecard scorecard={scorecard} />
    </div>
  );
}
