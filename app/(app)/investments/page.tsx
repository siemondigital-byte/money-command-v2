import Link from "next/link";
import { requireUser } from "@/lib/auth";
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

export const metadata = { title: "Inversiones · The Money Command" };

const CATEGORY_LABELS_ES: Record<InvestmentCategory, string> = {
  fixed_income: "Renta fija",
  equity: "Renta variable",
  real_estate: "Bienes raíces",
  speculative: "Cripto / Especulativo",
  other: "Otros",
};

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
  });
  const pct = new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 2,
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
      name: p.label ?? CATEGORY_LABELS_ES[p.category as InvestmentCategory],
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
    label: CATEGORY_LABELS_ES[cat],
    suggestedYield: DEFAULT_PASSIVE_YIELDS_BY_CATEGORY[cat],
  }));

  const hasAssets = serialized.length > 0;

  return (
    <div className="fade-up flex flex-col gap-6">
      <header>
        <div className="label mb-1">Inversiones</div>
        <h1>Tu portafolio</h1>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "13px",
            marginTop: "8px",
          }}
        >
          Cada activo con su tasa y su aporte mensual. Proyectamos su
          crecimiento por interés compuesto, y tu renta pasiva de hoy es el
          Plan B (suma de capital por su yield, dividido 12).
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
          label="Portafolio Total"
          value={money.format(totalCapital)}
          sub={`${serialized.length} posición${serialized.length === 1 ? "" : "es"}`}
        />
        <Kpi
          label="Rendimiento Ponderado"
          value={pct.format(wYield)}
          sub="prom. ponderado por capital"
        />
        <Kpi
          label="Renta Pasiva Hoy"
          value={money.format(planBMonthly)}
          sub="Plan B mensual (yields)"
          valueColor="var(--accent)"
        />
        <Kpi
          label="Proyección 10A"
          value={money.format(proj10)}
          sub="valor estimado"
        />
        <Kpi
          label="Renta 10A"
          value={money.format(renta10)}
          sub="renta pasiva/mes a 10 años"
        />
      </section>

      {/* Proyección por horizonte (capa A) + Donut por posición.
          Móvil: apila en 1 columna (tabla arriba, dona abajo) para que la dona
          entre completa. Desktop (>= md): 1fr 220px, dona al costado. */}
      <section className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4 items-stretch">
        <div className="card flex flex-col gap-3">
          <div className="label">Proyección por horizonte</div>
          {!hasAssets ? (
            <p style={{ fontSize: "13px", color: "var(--hint)" }}>
              Cuando cargues posiciones, acá vas a ver tu valor y tu renta
              proyectados a 5, 10 y 20 años.
            </p>
          ) : (
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
                  <Th>Horizonte</Th>
                  <Th align="right">Valor proyectado</Th>
                  <Th align="right">Renta/mes</Th>
                </tr>
              </thead>
              <tbody>
                {projTable.map((r) => (
                  <tr key={r.years} style={{ borderTop: "1px solid var(--border)" }}>
                    <Td>{r.years} años</Td>
                    <Td align="right">{money.format(r.value)}</Td>
                    <Td align="right" accent>
                      {money.format(r.monthlyIncome)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              Sin datos para graficar
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
        <div className="label">Crecimiento por interés compuesto — 30 años</div>
        {!hasAssets ? (
          <p style={{ fontSize: "13px", color: "var(--hint)" }}>
            Acá vas a ver cómo crece cada activo, apilado, año a año hasta los 30.
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
            />
          </>
        )}
      </section>

      {/* Pieza 1 — Tabla fila por activo */}
      <section className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
          <div className="label">Tus activos</div>
        </div>
        {!hasAssets ? (
          <p style={{ fontSize: "13px", color: "var(--muted)", padding: "16px" }}>
            Sin posiciones todavía. Agregá la primera más abajo.
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
                  <Th>Activo</Th>
                  <Th>Tipo</Th>
                  <Th align="right">Valor</Th>
                  <Th align="right">Aporte/mes</Th>
                  <Th align="right">Rendimiento</Th>
                  <Th align="right">5A</Th>
                  <Th align="right">10A</Th>
                  <Th align="right">Renta 10A</Th>
                  <Th align="right">20A</Th>
                  <Th align="right">Acción</Th>
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
                      <Td>{CATEGORY_LABELS_ES[a.category as InvestmentCategory]}</Td>
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
                            Editar
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
                              Eliminar
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

      {/* Form crear / editar */}
      <InvestmentForm categories={categoryOptions} editing={editing} />
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
