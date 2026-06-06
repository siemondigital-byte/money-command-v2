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

  // KPI Plan B y agregados
  const planBMonthly = monthlyPlanB(
    serialized.map((p) => ({
      capital: p.capital,
      passiveYield: p.passiveYield,
    })),
  );
  const totalCapital = serialized.reduce((sum, p) => sum + p.capital, 0);

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

      {/* KPI + Donut */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 220px",
          gap: "16px",
          alignItems: "stretch",
        }}
      >
        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div>
            <div className="label">Ingreso pasivo mensual (Plan B)</div>
            <div
              className="kpi-large"
              style={{ marginTop: "4px" }}
            >
              {money.format(planBMonthly)}
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "var(--muted)",
                marginTop: "4px",
              }}
            >
              Flujo de yields del portafolio. Capital se mantiene intacto.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              borderTop: "1px solid var(--border)",
              paddingTop: "12px",
            }}
          >
            <div>
              <div className="label">Capital total</div>
              <div className="kpi-medium">{money.format(totalCapital)}</div>
            </div>
            <div>
              <div className="label">Posiciones</div>
              <div className="kpi-medium">{serialized.length}</div>
            </div>
          </div>
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
