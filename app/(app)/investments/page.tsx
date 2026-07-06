import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import { getServerDict } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { serializeInvestment } from "@/lib/serialize";
import {
  INVESTMENT_CATEGORIES,
  DEFAULT_PASSIVE_YIELDS_BY_CATEGORY,
  monthlyPlanB,
  type InvestmentCategory,
} from "@/lib/formulas";
import {
  portfolioTotal,
  weightedYield,
  projectedValue,
  projectedMonthlyPassiveIncome,
  projectionTable,
  growthSeries,
  portfolioShares,
} from "@/lib/investments";
import { PortfolioDonut, type DonutSlice } from "./PortfolioDonut";
import { GrowthChart } from "./GrowthChart";
import { InvestmentForm } from "./InvestmentForm";
import { deleteInvestmentAction } from "./actions";

export async function generateMetadata() {
  return { title: (await getServerDict()).metadata.investments };
}

/** Paleta por POSICIÓN (no por categoría): cada activo un color distinto, el
 * mismo en la tabla, el gráfico y el donut. Se cicla si hay más posiciones. */
const POSITION_COLORS = [
  "#7fffb2", // verde
  "#4dd9ff", // cian
  "#ffd166", // dorado
  "#ff6b6b", // coral
  "#b388ff", // violeta
  "#ff9f6b", // naranja
  "#5ad1c8", // teal
  "#f078c8", // rosa
];

/** Horizonte del gráfico: año a año de 0 a 30. */
const GROWTH_YEARS = Array.from({ length: 31 }, (_, i) => i);

export default async function InvestmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { user, profile } = await requireUser();
  const params = await searchParams;
  const dict = getDict(profile.locale).investments;
  const catLabels = getDict(profile.locale).labels.investmentCategories;

  const positions = await prisma.investment.findMany({
    where: { userId: user.id, isActive: true },
    orderBy: [{ category: "asc" }, { createdAt: "desc" }],
  });
  const serialized = positions.map(serializeInvestment);

  const editing = params.edit
    ? (serialized.find((p) => p.id === params.edit) ?? null)
    : null;

  // Renta pasiva de HOY: el Plan B de siempre (yields). Sin cambios.
  const planBMonthly = monthlyPlanB(
    serialized.map((p) => ({
      capital: p.capital,
      passiveYield: p.passiveYield,
    })),
  );

  // Proyección: cada activo con su capital, aporte y tasa única (passiveYield).
  const projPositions = serialized.map((p) => ({
    capital: p.capital,
    monthlyContribution: p.monthlyContribution,
    passiveYield: p.passiveYield,
  }));
  const totalCapital = portfolioTotal(projPositions);
  const wYield = weightedYield(projPositions); // fracción
  const proj10 = projectedValue(projPositions, 10);
  const renta10 = projectedMonthlyPassiveIncome(projPositions, 10);
  const projTable = projectionTable(projPositions, [5, 10, 20]);

  // Formato moneda — decimales según moneda (default ISO 4217)
  const locale = profile.locale === "es" ? "es-AR" : "en-US";
  const money = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: profile.currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
  const pct = new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 0,
  });

  // Reparto del portafolio por posición (helper testeado), mismo orden que serialized.
  const shares = portfolioShares(projPositions);

  // Color por posición + proyecciones por activo (reusa las funciones puras).
  const assets = serialized.map((p, i) => {
    const color = POSITION_COLORS[i % POSITION_COLORS.length]!;
    const proj = {
      capital: p.capital,
      monthlyContribution: p.monthlyContribution,
      passiveYield: p.passiveYield,
    };
    return {
      ...p,
      color,
      name: p.label ?? catLabels[p.category as InvestmentCategory],
      share: shares[i]!.share,
      v5: projectedValue([proj], 5),
      v10: projectedValue([proj], 10),
      v20: projectedValue([proj], 20),
      renta10: projectedMonthlyPassiveIncome([proj], 10),
    };
  });

  // Donut por POSICIÓN (solo con capital > 0).
  const donutSlices: DonutSlice[] = assets
    .filter((a) => a.capital > 0)
    .map((a) => ({
      category: a.id,
      label: a.name,
      capital: a.capital,
      color: a.color,
    }));

  // Serie año a año para el gráfico apilado.
  const gs = growthSeries(projPositions, GROWTH_YEARS);

  // Categorías para el form con yields sugeridos
  const categoryOptions = INVESTMENT_CATEGORIES.map((cat) => ({
    value: cat,
    label: catLabels[cat],
    suggestedYield: DEFAULT_PASSIVE_YIELDS_BY_CATEGORY[cat],
  }));

  const hasAssets = serialized.length > 0;

  return (
    <div className="fade-up flex flex-col gap-6">
      <header>
        <div className="label mb-1">{dict.headerLabel}</div>
        <h1>{dict.title}</h1>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "13px",
            marginTop: "8px",
          }}
        >
          {dict.intro}
        </p>
      </header>

      {/* KPIs (capa A) */}
      <section
        className="card"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "20px",
        }}
      >
        <Kpi
          label={dict.kpiPortfolioTotal}
          value={money.format(totalCapital)}
          sub={`${serialized.length} ${serialized.length === 1 ? dict.positionSingular : dict.positionPlural}`}
        />
        <Kpi
          label={dict.kpiWeightedReturn}
          value={pct.format(wYield)}
          sub={dict.weightedReturnSub}
        />
        <Kpi
          label={dict.kpiPassiveToday}
          value={money.format(planBMonthly)}
          sub={dict.passiveTodaySub}
          valueColor="var(--accent)"
        />
        <Kpi
          label={dict.kpiProjection10}
          value={money.format(proj10)}
          sub={dict.projection10Sub}
        />
        <Kpi
          label={dict.kpiRent10}
          value={money.format(renta10)}
          sub={dict.rent10Sub}
        />
      </section>

      {/* Proyección por horizonte (capa A) + Donut por posición.
          Móvil: apila en 1 columna (tabla arriba, dona abajo) para que la dona
          entre completa. Desktop (>= md): 1fr 220px, dona al costado. */}
      <section className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4 items-stretch">
        <div className="card flex flex-col gap-3">
          <div className="label">{dict.projectionByHorizon}</div>
          {!hasAssets ? (
            <p style={{ fontSize: "13px", color: "var(--hint)" }}>
              {dict.projectionEmpty}
            </p>
          ) : (
            <>
            {/* Desktop (>= md): tabla original, sin cambios. Oculta en móvil. */}
            <div className="hidden md:block">
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
                borderTop: "1px solid var(--border)",
              }}
            >
              <thead>
                <tr>
                  <Th>{dict.colHorizon}</Th>
                  <Th align="right">{dict.colProjectedValue}</Th>
                  <Th align="right">{dict.colRentPerMonth}</Th>
                </tr>
              </thead>
              <tbody>
                {projTable.map((r) => (
                  <tr key={r.years} style={{ borderTop: "1px solid var(--border)" }}>
                    <Td>{r.years} {dict.yearsSuffix}</Td>
                    <Td align="right">{money.format(r.value)}</Td>
                    <Td align="right" accent>
                      {money.format(r.monthlyIncome)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {/* Móvil (< md): una tarjeta por horizonte, sin scroll horizontal. */}
            <div className="md:hidden flex flex-col gap-3">
              {projTable.map((r) => (
                <div
                  key={r.years}
                  className="card card-elevated"
                  style={{ display: "flex", flexDirection: "column", gap: "10px" }}
                >
                  <div
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontWeight: 700,
                      fontSize: "1rem",
                    }}
                  >
                    {r.years} {dict.yearsSuffix}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px 16px",
                    }}
                  >
                    <Field
                      label={dict.colProjectedValue}
                      value={money.format(r.value)}
                    />
                    <Field
                      label={dict.colRentPerMonth}
                      value={money.format(r.monthlyIncome)}
                      color="var(--accent)"
                    />
                  </div>
                </div>
              ))}
            </div>
            </>
          )}
        </div>

        <div className="card" style={{ padding: "12px" }}>
          {donutSlices.length > 0 ? (
            <PortfolioDonut
              slices={donutSlices}
              formattedTotal={money.format(totalCapital)}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 180,
                fontSize: "11px",
                color: "var(--hint)",
                textAlign: "center",
              }}
            >
              {dict.noDataToChart}
            </div>
          )}
        </div>
      </section>

      {/* Leyenda del donut, por posición */}
      {donutSlices.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "11px",
            color: "var(--muted)",
          }}
        >
          {assets
            .filter((a) => a.capital > 0)
            .map((a) => (
              <div
                key={a.id}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: a.color,
                  }}
                />
                <span style={{ color: "var(--text)" }}>{a.name}</span>
                <span>·</span>
                <span>{pct.format(a.share)}</span>
              </div>
            ))}
        </div>
      )}

      {/* Pieza 2 — Crecimiento por interés compuesto, 30 años (apilado) */}
      <section className="card flex flex-col gap-3">
        <div className="label">{dict.growthTitle}</div>
        {!hasAssets ? (
          <p style={{ fontSize: "13px", color: "var(--hint)" }}>
            {dict.growthEmpty}
          </p>
        ) : (
          <>
            {/* Leyenda: activo + su tasa */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                fontSize: "11px",
                color: "var(--muted)",
              }}
            >
              {assets.map((a) => (
                <div
                  key={a.id}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: a.color,
                    }}
                  />
                  <span style={{ color: "var(--text)" }}>{a.name}</span>
                  <span>({pct.format(a.passiveYield)})</span>
                </div>
              ))}
            </div>
            <GrowthChart
              years={gs.years}
              perAsset={gs.perAsset}
              labels={assets.map((a) => a.name)}
              colors={assets.map((a) => a.color)}
              locale={profile.locale}
              currency={profile.currency}
              todayLabel={dict.chartToday}
              assetFallback={dict.chartAssetFallback}
            />
          </>
        )}
      </section>

      {/* Pieza 1 — Tabla fila por activo */}
      <section className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
          <div className="label">{dict.assetsTitle}</div>
        </div>
        {!hasAssets ? (
          <p style={{ fontSize: "13px", color: "var(--muted)", padding: "16px" }}>
            {dict.assetsEmpty}
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <Th>{dict.colAsset}</Th>
                  <Th>{dict.colType}</Th>
                  <Th align="right">{dict.colValue}</Th>
                  <Th align="right">{dict.colContributionPerMonth}</Th>
                  <Th align="right">{dict.colReturn}</Th>
                  <Th align="right">{dict.col5y}</Th>
                  <Th align="right">{dict.col10y}</Th>
                  <Th align="right">{dict.colRent10y}</Th>
                  <Th align="right">{dict.col20y}</Th>
                  <Th align="right">{dict.colAction}</Th>
                </tr>
              </thead>
              <tbody>
                {assets.map((a) => {
                  const isEditing = editing?.id === a.id;
                  return (
                    <tr
                      key={a.id}
                      style={{
                        borderTop: "1px solid var(--border)",
                        background: isEditing
                          ? "rgba(127, 255, 178, 0.04)"
                          : undefined,
                      }}
                    >
                      <Td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              width: 8,
                              height: 8,
                              borderRadius: 2,
                              background: a.color,
                            }}
                          />
                          {a.name}
                        </span>
                      </Td>
                      <Td>{catLabels[a.category as InvestmentCategory]}</Td>
                      <Td align="right">{money.format(a.capital)}</Td>
                      <Td align="right">
                        {a.monthlyContribution > 0
                          ? money.format(a.monthlyContribution)
                          : "—"}
                      </Td>
                      <Td align="right">{pct.format(a.passiveYield)}</Td>
                      <Td align="right">{money.format(a.v5)}</Td>
                      <Td align="right">{money.format(a.v10)}</Td>
                      <Td align="right" accent>
                        {money.format(a.renta10)}
                      </Td>
                      <Td align="right">{money.format(a.v20)}</Td>
                      <Td align="right">
                        <div
                          style={{
                            display: "inline-flex",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          <Link
                            href={`/investments?edit=${a.id}#form`}
                            style={{ color: "var(--accent-2)", fontSize: "12px" }}
                          >
                            {dict.edit}
                          </Link>
                          <form action={deleteInvestmentAction}>
                            <input type="hidden" name="id" value={a.id} />
                            <button
                              type="submit"
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "var(--danger)",
                                fontSize: "12px",
                                cursor: "pointer",
                                fontFamily: "DM Mono, monospace",
                                padding: 0,
                              }}
                            >
                              {dict.delete}
                            </button>
                          </form>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Form crear / editar. El key remonta el form al cambiar editing (entre
          posiciones o de editar→crear), reseteando useActionState → evita el
          "Falta el id" (binding/estado pegado de un guardado previo). Mismo
          patrón que GoalForm. */}
      <InvestmentForm key={editing?.id ?? "new"} categories={categoryOptions} editing={editing} />
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="kpi-medium" style={{ marginTop: "4px", color: valueColor }}>
        {value}
      </div>
      {sub && (
        <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: 2 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function Th({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      style={{
        textAlign: align ?? "left",
        padding: "10px 16px",
        fontSize: "10px",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: "var(--muted)",
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align,
  accent,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  accent?: boolean;
}) {
  return (
    <td
      style={{
        textAlign: align ?? "left",
        padding: "10px 16px",
        whiteSpace: "nowrap",
        color: accent ? "var(--accent)" : undefined,
      }}
    >
      {children}
    </td>
  );
}

/** Par etiqueta/valor de las tarjetas de móvil. El valor envuelve si es largo
 * (overflowWrap) para que nunca se desborde de la card. */
function Field({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: 0 }}>
      <span className="label">{label}</span>
      <span
        style={{
          fontFamily: "Syne, sans-serif",
          fontWeight: 700,
          fontSize: "0.95rem",
          color,
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </span>
    </div>
  );
}
