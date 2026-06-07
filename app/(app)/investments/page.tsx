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
} from "@/lib/investments";
import { PortfolioDonut, type DonutSlice } from "./PortfolioDonut";
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

const CATEGORY_COLORS: Record<InvestmentCategory, string> = {
  fixed_income: "#4dd9ff", // var(--accent-2) cian — estable
  equity: "#7fffb2", // var(--accent) verde neón — crecimiento
  real_estate: "#ffd166", // var(--gold) dorado — tangible
  speculative: "#ff6b6b", // var(--danger) rojo — volátil
  other: "#6b6b80", // var(--muted) — neutro
};

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

  // Proyección (capa A): cada activo con su capital, aporte y tasa única.
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

  // Donut: agregado por categoría (solo las que tienen capital > 0)
  const byCategory = new Map<InvestmentCategory, number>();
  for (const p of serialized) {
    const cat = p.category as InvestmentCategory;
    byCategory.set(cat, (byCategory.get(cat) ?? 0) + p.capital);
  }
  const donutSlices: DonutSlice[] = INVESTMENT_CATEGORIES.filter(
    (cat) => (byCategory.get(cat) ?? 0) > 0,
  ).map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS_ES[cat],
    capital: byCategory.get(cat)!,
    color: CATEGORY_COLORS[cat],
  }));

  // Categorías para el form con yields sugeridos
  const categoryOptions = INVESTMENT_CATEGORIES.map((cat) => ({
    value: cat,
    label: CATEGORY_LABELS_ES[cat],
    suggestedYield: DEFAULT_PASSIVE_YIELDS_BY_CATEGORY[cat],
  }));

  // Agrupación para la lista
  const grouped = INVESTMENT_CATEGORIES.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS_ES[cat],
    color: CATEGORY_COLORS[cat],
    positions: serialized.filter((p) => p.category === cat),
  })).filter((g) => g.positions.length > 0);

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
          Posiciones agrupadas en cinco categorías. El Plan B mensual se calcula
          como suma de (capital × yield pasivo) ÷ 12.
        </p>
      </header>

      {/* KPIs */}
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

      {/* Proyección (tabla) + Donut */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 220px",
          gap: "16px",
          alignItems: "stretch",
        }}
      >
        <div className="card flex flex-col gap-3">
          <div>
            <div className="label">Proyección de interés compuesto</div>
            <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
              Capital actual más aportes, creciendo al retorno de cada activo y
              reinvirtiendo. La renta es la que ese portafolio proyectado
              generaría con sus yields.
            </p>
          </div>
          {serialized.length === 0 ? (
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

      {/* Leyenda categorías */}
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
          {donutSlices.map((s) => (
            <div
              key={s.category}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: s.color,
                }}
              />
              <span style={{ color: "var(--text)" }}>{s.label}</span>
              <span>·</span>
              <span>
                {pct.format(totalCapital > 0 ? s.capital / totalCapital : 0)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Lista por categoría */}
      {grouped.length === 0 ? (
        <div className="card">
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            Sin posiciones todavía. Agregá la primera más abajo.
          </p>
        </div>
      ) : (
        grouped.map((g) => (
          <CategoryGroup
            key={g.category}
            label={g.label}
            color={g.color}
            positions={g.positions}
            money={money}
            pct={pct}
            editingId={editing?.id}
          />
        ))
      )}

      {/* Form crear / editar */}
      <InvestmentForm categories={categoryOptions} editing={editing} />
    </div>
  );
}

function CategoryGroup({
  label,
  color,
  positions,
  money,
  pct,
  editingId,
}: {
  label: string;
  color: string;
  positions: ReturnType<typeof serializeInvestment>[];
  money: Intl.NumberFormat;
  pct: Intl.NumberFormat;
  editingId?: string | null;
}) {
  const groupTotal = positions.reduce((s, p) => s + p.capital, 0);
  const groupPlanB = positions.reduce(
    (s, p) => s + (p.capital * p.passiveYield) / 12,
    0,
  );

  return (
    <section className="card flex flex-col gap-2" style={{ padding: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: 2,
              background: color,
            }}
          />
          <div>
            <div
              className="label"
              style={{ fontSize: "10px", color: "var(--muted)" }}
            >
              {label}
            </div>
            <div style={{ fontSize: "13px", color: "var(--text)" }}>
              {positions.length} posición{positions.length === 1 ? "" : "es"}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="label" style={{ fontSize: "10px" }}>
            Capital · Plan B/mes
          </div>
          <div style={{ fontSize: "13px", color: "var(--text)" }}>
            {money.format(groupTotal)}
            <span style={{ color: "var(--muted)" }}> · </span>
            <span style={{ color: "var(--accent)" }}>
              {money.format(groupPlanB)}
            </span>
          </div>
        </div>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "13px",
        }}
      >
        <thead>
          <tr>
            <Th>Etiqueta</Th>
            <Th align="right">Capital</Th>
            <Th align="right">Yield</Th>
            <Th align="right">Flujo/mes</Th>
            <Th align="right">Acción</Th>
          </tr>
        </thead>
        <tbody>
          {positions.map((p, idx) => {
            const monthlyFlow = (p.capital * p.passiveYield) / 12;
            const isEditing = editingId === p.id;
            return (
              <tr
                key={p.id}
                style={{
                  borderTop: idx === 0 ? "none" : "1px solid var(--border)",
                  background: isEditing
                    ? "rgba(127, 255, 178, 0.04)"
                    : undefined,
                }}
              >
                <Td>{p.label ?? <em style={{ color: "var(--hint)" }}>—</em>}</Td>
                <Td align="right">{money.format(p.capital)}</Td>
                <Td align="right">{pct.format(p.passiveYield)}</Td>
                <Td align="right" accent>
                  {money.format(monthlyFlow)}
                </Td>
                <Td align="right">
                  <div
                    style={{
                      display: "inline-flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <Link
                      href={`/investments?edit=${p.id}#form`}
                      style={{
                        color: "var(--accent-2)",
                        fontSize: "12px",
                      }}
                    >
                      Editar
                    </Link>
                    <form action={deleteInvestmentAction}>
                      <input type="hidden" name="id" value={p.id} />
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
    </section>
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
