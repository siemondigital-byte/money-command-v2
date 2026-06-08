import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { activePeriod } from "@/lib/monthly";
import { effectivePlanB } from "@/lib/income";
import { portfolioTotal, weightedYield, projectedValue } from "@/lib/investments";
import { DEFAULT_PORTFOLIO_RETURN } from "@/lib/formulas";
import {
  thermostat,
  realDistribution,
  type BasketDistribution,
} from "@/lib/dashboard";
import { AffirmationCard } from "./AffirmationCard";
import { MethodPanel } from "./MethodPanel";
import { Thermostat } from "./Thermostat";
import { FreedomBlock } from "./FreedomBlock";
import { PatrimonyBlock } from "./PatrimonyBlock";

export const metadata = { title: "Dashboard · The Money Command" };

/** Horizonte del gráfico de patrimonio (años, barra por año). */
const PATRIMONY_YEARS = 10;

/** Distribución preset desde el método preferido ("50/30/20"). */
function presetFromMethod(method: string): BasketDistribution {
  const parts = method.split("/").map((s) => Number(s.trim()));
  if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
    return { essentials: parts[0]!, style: parts[1]!, freedom: parts[2]! };
  }
  return { essentials: 50, style: 30, freedom: 20 };
}

export default async function DashboardPage() {
  const { user, profile } = await requireUser();
  const period = activePeriod({
    activeYear: profile.activeYear,
    activeMonth: profile.activeMonth,
  });

  const locale = profile.locale;
  const currency = profile.currency;

  // Datos consolidados / históricos (LECTURA, nunca escritura).
  const [record, records, investments] = await Promise.all([
    prisma.monthlyRecord.findUnique({
      where: {
        userId_year_month: { userId: user.id, year: period.year, month: period.month },
      },
    }),
    prisma.monthlyRecord.findMany({ where: { userId: user.id } }),
    prisma.investment.findMany({
      where: { userId: user.id, isActive: true },
      orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  // --- Período activo ---
  const incomeTotal = Number(record?.incomeTotal ?? 0);
  const essentials = Number(record?.essentials ?? 0);
  const style = Number(record?.style ?? 0);
  const freedom = Number(record?.freedom ?? 0);
  const expenseTotal = Number(record?.expenseTotal ?? 0);

  // --- Portafolio (estado actual) — reusa los cálculos de Investments ---
  const projPositions = investments.map((p) => ({
    capital: Number(p.capital),
    monthlyContribution: Number(p.monthlyContribution),
    passiveYield: Number(p.passiveYield),
  }));
  const portfolio = portfolioTotal(projPositions);
  const totalContribution = projPositions.reduce(
    (s, p) => s + p.monthlyContribution,
    0,
  );
  const wYield = weightedYield(projPositions);
  const defaultRatePct =
    portfolio > 0 && wYield > 0 ? wYield * 100 : DEFAULT_PORTFOLIO_RETURN * 100;
  const hasAssets = projPositions.length > 0 && portfolio > 0;

  // Renta pasiva = Plan B existente (respeta override). NO se recalcula.
  const passiveIncome = effectivePlanB({
    positions: projPositions.map((p) => ({
      capital: p.capital,
      passiveYield: p.passiveYield,
    })),
    manualOverride: profile.planBManualOverride,
    manualAmount:
      profile.planBManualAmount !== null ? Number(profile.planBManualAmount) : null,
  }).amount;

  // --- Termostato: promedio de ingresos del historial vs meta de Settings ---
  const incomeMonths = records.map((r) => Number(r.incomeTotal)).filter((n) => n > 0);
  const avgIncome =
    incomeMonths.length > 0
      ? incomeMonths.reduce((s, n) => s + n, 0) / incomeMonths.length
      : 0;
  const targetIncome =
    profile.thermostatTarget !== null ? Number(profile.thermostatTarget) : 0;
  const thermo = thermostat(avgIncome, targetIncome);

  // --- Distribución real por canastas (del período; degrada al preset) ---
  const realDist = realDistribution({ essentials, style, freedom });
  const hasRealDist = essentials + style + freedom > 0;
  const preset = presetFromMethod(profile.preferredMethod);
  const initialDist = hasRealDist ? realDist : preset;

  // --- Libertad: gasto mensual real (período; si 0, promedio del historial) ---
  const expenseMonths = records.map((r) => Number(r.expenseTotal)).filter((n) => n > 0);
  const avgExpense =
    expenseMonths.length > 0
      ? expenseMonths.reduce((s, n) => s + n, 0) / expenseMonths.length
      : 0;
  const monthlyExpense = expenseTotal > 0 ? expenseTotal : avgExpense;
  const defaultIncome = incomeTotal > 0 ? incomeTotal : avgIncome;
  const defaultSaving = totalContribution > 0 ? totalContribution : freedom;

  // --- Patrimonio: series año a año (Capital + Interés) con projectedValue ---
  let balance = 0;
  let capitalAported = 0;
  let interestGained = 0;
  const cols: { k: number; i: number }[] = [];
  const xLabels: string[] = [];
  if (hasAssets) {
    const series = Array.from({ length: PATRIMONY_YEARS }, (_, idx) => {
      const y = idx + 1;
      const value = projectedValue(projPositions, y);
      const principal = portfolio + totalContribution * 12 * y;
      const interest = Math.max(0, value - principal);
      return { y, value, principal, interest };
    });
    const maxValue = series[series.length - 1]!.value || 1;
    const last = series[series.length - 1]!;
    balance = last.value;
    capitalAported = last.principal;
    interestGained = last.interest;
    for (const s of series) {
      cols.push({
        k: (s.principal / maxValue) * 100,
        i: (s.interest / maxValue) * 100,
      });
      xLabels.push(s.y % 5 === 0 ? `${s.y}A` : "");
    }
  }

  const hasRecord = record !== null;

  return (
    <div className="dash fade-up">
      <header style={{ marginBottom: "2px" }}>
        <div className="d-section-label" style={{ marginBottom: "6px" }}>Dashboard</div>
        <h1>Tu situación financiera</h1>
        <p style={{ color: "var(--muted)", fontSize: "13px", marginTop: "8px" }}>
          Todo lo que cargás en los otros módulos, reflejado en una vista. Cambiá
          el período en el header para ver otro mes.
        </p>
      </header>

      {/* Afirmación del día (rota cada 10s) */}
      <AffirmationCard />

      {!hasRecord && (
        <p style={{ fontSize: "12px", color: "var(--hint)" }}>
          Este período todavía no tiene datos. Cargá{" "}
          <Link href="/income" style={{ color: "var(--accent-2)" }}>ingresos</Link> y{" "}
          <Link href="/expenses" style={{ color: "var(--accent-2)" }}>gastos</Link> para verlo
          completo.
        </p>
      )}

      {/* 1. Panel del método: KPIs + barras de distribución */}
      <MethodPanel
        income={incomeTotal}
        gastado={essentials + style}
        invertido={freedom}
        realDist={realDist}
        initialDist={initialDist}
        targetDist={preset}
        locale={locale}
        currency={currency}
      />

      {/* 2. Termostato (vertical) + Libertad financiera, lado a lado */}
      <div className="d-mid">
        <Thermostat
          current={thermo.current}
          target={thermo.target}
          gap={thermo.gap}
          gapPct={thermo.gapPct}
          reached={thermo.reached}
          hasHistory={incomeMonths.length > 0}
          locale={locale}
          currency={currency}
        />
        <FreedomBlock
          monthlyExpense={monthlyExpense}
          portfolio={portfolio}
          defaultIncome={defaultIncome}
          defaultSaving={defaultSaving}
          passiveIncome={passiveIncome}
          defaultRatePct={defaultRatePct}
          ageCurrent={profile.ageCurrent}
          ageFreedomTarget={profile.ageFreedomTarget}
          locale={locale}
          currency={currency}
        />
      </div>

      {/* 3. Patrimonio / Inversiones (sin dona) */}
      <PatrimonyBlock
        horizon={PATRIMONY_YEARS}
        balance={balance}
        capital={capitalAported}
        interest={interestGained}
        cols={cols}
        xLabels={xLabels}
        hasAssets={hasAssets}
        locale={locale}
        currency={currency}
      />
    </div>
  );
}
