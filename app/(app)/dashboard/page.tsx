import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { activePeriod } from "@/lib/monthly";
import { formatMoney } from "@/lib/format";
import { effectivePlanB } from "@/lib/income";
import { portfolioTotal, weightedYield } from "@/lib/investments";
import { DEFAULT_PORTFOLIO_RETURN, type InvestmentCategory } from "@/lib/formulas";
import {
  thermostat,
  realDistribution,
  type BasketDistribution,
} from "@/lib/dashboard";
import { AffirmationCard } from "./AffirmationCard";
import { Thermostat } from "./Thermostat";
import { DistributionBars } from "./DistributionBars";
import { FreedomBlock } from "./FreedomBlock";
import { PortfolioDonut, type DonutSlice } from "../investments/PortfolioDonut";

export const metadata = { title: "Dashboard · The Money Command" };

const CATEGORY_LABELS_ES: Record<InvestmentCategory, string> = {
  fixed_income: "Renta fija",
  equity: "Renta variable",
  real_estate: "Bienes raíces",
  speculative: "Cripto / Especulativo",
  other: "Otros",
};

const POSITION_COLORS = [
  "#7fffb2",
  "#4dd9ff",
  "#ffd166",
  "#ff6b6b",
  "#b388ff",
  "#ff9f6b",
  "#5ad1c8",
  "#f078c8",
];

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
  const money = (n: number) => formatMoney(n, locale, currency);

  // Datos consolidados / históricos (LECTURA, nunca escritura).
  const [record, records, investments, debts, subsCount] = await Promise.all([
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
    prisma.debt.findMany({ where: { userId: user.id, isActive: true } }),
    prisma.expense.count({
      where: {
        userId: user.id,
        isActive: true,
        isSubscription: true,
        year: period.year,
        month: period.month,
      },
    }),
  ]);

  // --- KPIs del período activo ---
  const incomeTotal = Number(record?.incomeTotal ?? 0);
  const expenseTotal = Number(record?.expenseTotal ?? 0);
  const savingsRate = Number(record?.savingsRate ?? 0);
  const netWorth = Number(record?.netWorth ?? 0);
  const debtTotal = Number(record?.debtTotal ?? 0);
  const activeDebtCount = debts.length;

  // --- Portafolio (estado actual) ---
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
  const wYield = weightedYield(projPositions); // fracción
  const defaultRatePct =
    portfolio > 0 && wYield > 0 ? wYield * 100 : DEFAULT_PORTFOLIO_RETURN * 100;

  // Renta pasiva = Plan B existente (respeta override). NO se recalcula distinto.
  const passiveIncome = effectivePlanB({
    positions: projPositions.map((p) => ({
      capital: p.capital,
      passiveYield: p.passiveYield,
    })),
    manualOverride: profile.planBManualOverride,
    manualAmount:
      profile.planBManualAmount !== null
        ? Number(profile.planBManualAmount)
        : null,
  }).amount;

  // Donut por posición (reusa PortfolioDonut).
  const donutSlices: DonutSlice[] = investments
    .map((p, i) => ({
      category: p.id,
      label: p.label ?? CATEGORY_LABELS_ES[p.category as InvestmentCategory],
      capital: Number(p.capital),
      color: POSITION_COLORS[i % POSITION_COLORS.length]!,
    }))
    .filter((s) => s.capital > 0);

  // --- Termostato: promedio de ingresos del historial vs meta de Settings ---
  const incomeMonths = records
    .map((r) => Number(r.incomeTotal))
    .filter((n) => n > 0);
  const avgIncome =
    incomeMonths.length > 0
      ? incomeMonths.reduce((s, n) => s + n, 0) / incomeMonths.length
      : 0;
  const targetIncome =
    profile.thermostatTarget !== null ? Number(profile.thermostatTarget) : 0;
  const thermo = thermostat(avgIncome, targetIncome);

  // --- Distribución real por canastas (del período; degrada al historial) ---
  const realDist = realDistribution({
    essentials: Number(record?.essentials ?? 0),
    style: Number(record?.style ?? 0),
    freedom: Number(record?.freedom ?? 0),
  });
  const hasRealDist =
    realDist.essentials + realDist.style + realDist.freedom > 0;
  const preset = presetFromMethod(profile.preferredMethod);
  const initialDist = hasRealDist ? realDist : preset;

  // --- Libertad: gasto mensual real (período; si 0, promedio del historial) ---
  const expenseMonths = records
    .map((r) => Number(r.expenseTotal))
    .filter((n) => n > 0);
  const avgExpense =
    expenseMonths.length > 0
      ? expenseMonths.reduce((s, n) => s + n, 0) / expenseMonths.length
      : 0;
  const monthlyExpense = expenseTotal > 0 ? expenseTotal : avgExpense;

  // --- Logros y prioridades del mes (solo con datos reales) ---
  type Chip = { text: string; tone: "good" | "warn" | "info" };
  const chips: Chip[] = [];
  if (incomeTotal > 0 && savingsRate > 30) {
    chips.push({ text: `Ahorro sobre el 30% (${savingsRate.toFixed(0)}%)`, tone: "good" });
  }
  const maxApr = debts.reduce((m, d) => Math.max(m, Number(d.apr)), 0);
  if (maxApr >= 20) {
    chips.push({
      text: `Acelerá el pago de tu deuda (${maxApr.toFixed(0)}% APR)`,
      tone: "warn",
    });
  }
  if (subsCount > 0) {
    chips.push({
      text: `Revisá ${subsCount} suscripción${subsCount === 1 ? "" : "es"} a dar de baja`,
      tone: "info",
    });
  }
  if (portfolio > 0 && donutSlices.length >= 3) {
    chips.push({ text: "Portafolio diversificado (3+ activos)", tone: "good" });
  }

  const hasRecord = record !== null;

  return (
    <div className="fade-up flex flex-col gap-6">
      <header>
        <div className="label mb-1">Dashboard</div>
        <h1>Tu situación financiera</h1>
        <p style={{ color: "var(--muted)", fontSize: "13px", marginTop: "8px" }}>
          Todo lo que cargás en los otros módulos, reflejado en una sola vista.
          Cambiá el período en el header para ver otro mes.
        </p>
      </header>

      {/* 1. Afirmación del día */}
      <AffirmationCard />

      {/* 2. KPIs de situación financiera */}
      <section
        className="card"
        style={{
          borderRadius: "16px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "20px",
        }}
      >
        <Kpi label="Ingreso total" value={money(incomeTotal)} sub="Plan A + B + C" color="var(--accent)" />
        <Kpi label="Gastos del mes" value={money(expenseTotal)} sub="real consolidado" />
        <Kpi
          label="Tasa de ahorro"
          value={incomeTotal > 0 ? `${savingsRate.toFixed(1)}%` : "—"}
          sub="ingreso menos gasto"
          color="var(--accent-2)"
        />
        <Kpi label="Patrimonio neto" value={money(netWorth)} sub="activos menos deudas" color="var(--gold)" />
        <Kpi
          label="Deuda total"
          value={money(debtTotal)}
          sub={`${activeDebtCount} deuda${activeDebtCount === 1 ? "" : "s"} activa${activeDebtCount === 1 ? "" : "s"}`}
          color={debtTotal > 0 ? "var(--danger)" : undefined}
        />
      </section>

      {!hasRecord && (
        <p style={{ fontSize: "12px", color: "var(--hint)" }}>
          Este período todavía no tiene datos. Cargá{" "}
          <Link href="/income" style={{ color: "var(--accent-2)" }}>ingresos</Link> y{" "}
          <Link href="/expenses" style={{ color: "var(--accent-2)" }}>gastos</Link> para ver
          tus KPIs.
        </p>
      )}

      {/* 3. Termostato financiero */}
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

      {/* 4. Distribución por canastas (barras simulables) */}
      <DistributionBars
        income={incomeTotal > 0 ? incomeTotal : avgIncome}
        realDist={realDist}
        initialDist={initialDist}
        locale={locale}
        currency={currency}
      />

      {/* 5. Gráfico de capital (donut por posición) */}
      <section
        className="card"
        style={{ borderRadius: "16px", display: "flex", flexDirection: "column", gap: "14px" }}
      >
        <div className="label">Capital del portafolio</div>
        {donutSlices.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "220px 1fr",
              gap: "20px",
              alignItems: "center",
            }}
          >
            <PortfolioDonut slices={donutSlices} formattedTotal={money(portfolio)} />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "12px",
                color: "var(--muted)",
              }}
            >
              {donutSlices.map((s) => (
                <div
                  key={s.category}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: s.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: "var(--text)" }}>{s.label}</span>
                  <span>·</span>
                  <span>{money(s.capital)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>
            Cargá posiciones en{" "}
            <Link href="/investments" style={{ color: "var(--accent-2)" }}>Inversiones</Link>{" "}
            para ver el reparto de tu capital.
          </p>
        )}
      </section>

      {/* 6. Libertad financiera (tasa ajustable) */}
      <FreedomBlock
        monthlyExpense={monthlyExpense}
        portfolio={portfolio}
        monthlyContribution={totalContribution}
        passiveIncome={passiveIncome}
        defaultRatePct={defaultRatePct}
        locale={locale}
        currency={currency}
      />

      {/* 7. Logros y prioridades del mes */}
      <section
        className="card"
        style={{ borderRadius: "16px", display: "flex", flexDirection: "column", gap: "14px" }}
      >
        <div className="label">Logros y prioridades del mes</div>
        {chips.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {chips.map((c, i) => (
              <span
                key={i}
                style={{
                  fontSize: "12px",
                  padding: "8px 14px",
                  borderRadius: "999px",
                  border: "1px solid var(--border)",
                  background: "var(--surface-2)",
                  color:
                    c.tone === "good"
                      ? "var(--accent)"
                      : c.tone === "warn"
                        ? "var(--danger)"
                        : "var(--accent-2)",
                }}
              >
                {c.text}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>
            A medida que cargues datos, acá vas a ver tus logros y las prioridades
            del mes.
          </p>
        )}
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="kpi-medium" style={{ marginTop: "4px", color }}>
        {value}
      </div>
      {sub && (
        <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: 2 }}>{sub}</p>
      )}
    </div>
  );
}
