import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeExpense, type SerializedExpense } from "@/lib/serialize";
import { activePeriod, getMonthlyRecord, periodToString } from "@/lib/monthly";
import {
  BASKETS,
  BASKET_LABELS_ES,
  BASKET_COLORS,
  CATEGORY_LABELS_ES,
  sumRealByBasket,
  totalsByType,
  subscriptionSummary,
  type Basket,
} from "@/lib/expenses";
import { PortfolioDonut, type DonutSlice } from "../investments/PortfolioDonut";
import { ExpenseForm } from "./ExpenseForm";
import { SubscriptionForm } from "./SubscriptionForm";
import { deleteExpenseAction } from "./actions";

export const metadata = { title: "Gastos · The Money Command" };

const MONTH_LABELS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

type Tab = "fixed" | "variable" | "basket";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; edit?: string }>;
}) {
  const { user, profile } = await requireUser();
  const params = await searchParams;

  const period = activePeriod({
    activeYear: profile.activeYear,
    activeMonth: profile.activeMonth,
  });

  const [rowsRaw, monthlyRecord] = await Promise.all([
    prisma.expense.findMany({
      // Sólo los gastos del período activo (Expenses es flujo del mes).
      where: { userId: user.id, year: period.year, month: period.month },
      orderBy: [{ type: "asc" }, { createdAt: "asc" }],
    }),
    getMonthlyRecord(user.id, period),
  ]);
  const rows = rowsRaw.map(serializeExpense);

  const tab: Tab =
    params.tab === "variable" || params.tab === "basket"
      ? params.tab
      : "fixed";
  const editing = params.edit
    ? (rows.find((r) => r.id === params.edit) ?? null)
    : null;

  // Totales (helpers puros). El real es el expensesTotal que va al MonthlyRecord.
  const helperRows = rows.map((r) => ({
    type: r.type,
    basket: r.basket,
    amount: r.amount,
    budget: r.budget,
    isActive: r.isActive,
    isSubscription: r.isSubscription,
  }));
  const totals = totalsByType(helperRows);
  const realByBasket = sumRealByBasket(helperRows);
  const subs = subscriptionSummary(helperRows);

  // Formato moneda — decimales según moneda (default ISO 4217)
  const locale = profile.locale === "es" ? "es-AR" : "en-US";
  const money = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: profile.currency,
  });

  // Las suscripciones tienen su propia sección; no se listan en Fijos/Variables.
  const fixedRows = rows.filter((r) => r.type === "fixed" && !r.isSubscription);
  const variableRows = rows.filter((r) => r.type === "variable");
  const subscriptionRows = rows.filter((r) => r.isSubscription);

  const donutSlices: DonutSlice[] = BASKETS.filter(
    (b) => realByBasket[b] > 0,
  ).map((b) => ({
    category: b,
    label: BASKET_LABELS_ES[b],
    capital: realByBasket[b],
    color: BASKET_COLORS[b],
  }));

  return (
    <div className="fade-up flex flex-col gap-6">
      <header>
        <div className="label mb-1">
          Gastos · {MONTH_LABELS_ES[period.month - 1]} {period.year}
        </div>
        <h1>Dirigí tu dinero</h1>
        <p style={{ color: "var(--muted)", fontSize: "13px", marginTop: "8px" }}>
          Registrá tus gastos del período y asigná cada uno a una canasta:
          Esenciales, Estilo o Libertad. El total real y el desglose por canasta
          se consolidan en el período activo.
        </p>
        {monthlyRecord && (
          <p style={{ fontSize: "11px", color: "var(--hint)", marginTop: "6px" }}>
            Consolidado al MonthlyRecord {periodToString(period)} · expensesTotal
            = {money.format(Number(monthlyRecord.expenseTotal))}
          </p>
        )}
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
        <Kpi label="Total Fijos" value={money.format(totals.fixedReal)} />
        <Kpi label="Total Variables" value={money.format(totals.variableReal)} />
        <Kpi
          label="Total Presupuesto"
          value={money.format(totals.totalBudget)}
          muted
        />
        <Kpi
          label="Total Real"
          value={money.format(totals.totalReal)}
          accent
        />
      </section>

      {/* Tabs */}
      <nav style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <TabLink current={tab} tab="fixed" label="Fijos" />
        <TabLink current={tab} tab="variable" label="Variables" />
        <TabLink current={tab} tab="basket" label="Por canasta" />
      </nav>

      {/* Contenido del tab */}
      {tab === "fixed" && (
        <ExpenseTypeSection
          type="fixed"
          rows={fixedRows}
          money={money}
          editing={editing?.type === "fixed" ? editing : null}
          tab="fixed"
        />
      )}
      {tab === "variable" && (
        <ExpenseTypeSection
          type="variable"
          rows={variableRows}
          money={money}
          editing={editing?.type === "variable" ? editing : null}
          tab="variable"
        />
      )}
      {tab === "basket" && (
        <BasketSection
          rows={rows}
          realByBasket={realByBasket}
          donutSlices={donutSlices}
          money={money}
        />
      )}

      {/* Suscripciones (absorbidas en Estilo) — solo en la tab Variables */}
      {tab === "variable" && (
        <section className="card flex flex-col gap-4">
        <div>
          <div className="label">Suscripciones y gastos hormiga</div>
          <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
            Se suman dentro de Estilo. Mirá lo que pesan al mes, al año y a
            futuro.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "16px",
            borderTop: "1px solid var(--border)",
            paddingTop: "12px",
          }}
        >
          <Kpi label="Por mes" value={money.format(subs.monthly)} />
          <Kpi label="Por año" value={money.format(subs.annual)} muted />
          <Kpi
            label={`En ${subs.projectionYears} años`}
            value={money.format(subs.projectionTotal)}
            muted
          />
        </div>

        {subscriptionRows.length > 0 && (
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
                <Th>Suscripción</Th>
                <Th align="right">Costo/mes</Th>
                <Th align="right">Acción</Th>
              </tr>
            </thead>
            <tbody>
              {subscriptionRows.map((r) => (
                <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <Td>{r.name}</Td>
                  <Td align="right">{money.format(r.amount)}</Td>
                  <Td align="right">
                    <DeleteButton id={r.id} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
          <SubscriptionForm />
        </div>
        </section>
      )}
    </div>
  );
}

// ============================================================================
// Secciones
// ============================================================================
function ExpenseTypeSection({
  type,
  rows,
  money,
  editing,
  tab,
}: {
  type: "fixed" | "variable";
  rows: SerializedExpense[];
  money: Intl.NumberFormat;
  editing: SerializedExpense | null;
  tab: Tab;
}) {
  const subtotal = rows
    .filter((r) => r.isActive)
    .reduce((s, r) => s + r.amount, 0);
  const label = type === "fixed" ? "Gastos fijos" : "Gastos variables";

  return (
    <section className="card flex flex-col gap-3">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
        }}
      >
        <div>
          <div className="label">{label}</div>
          <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
            {type === "fixed"
              ? "Recurrentes: renta, seguro, servicios."
              : "Cambian mes a mes: súper, salidas, transporte."}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="label">Subtotal real</div>
          <div
            className="kpi-medium"
            style={{ marginTop: "4px", color: "var(--accent)" }}
          >
            {money.format(Math.round(subtotal * 100) / 100)}
          </div>
        </div>
      </div>

      {rows.length > 0 && (
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
              <Th>Nombre</Th>
              <Th>Categoría</Th>
              <Th>Canasta</Th>
              <Th align="right">Presupuesto</Th>
              <Th align="right">Real</Th>
              <Th align="right">Acción</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}>
                <Td>{r.name}</Td>
                <Td>{CATEGORY_LABELS_ES[r.category] ?? r.category}</Td>
                <Td>
                  <BasketTag basket={r.basket as Basket} />
                </Td>
                <Td align="right">
                  {r.budget > 0 ? money.format(r.budget) : "—"}
                </Td>
                <Td align="right" accent>
                  {money.format(r.amount)}
                </Td>
                <Td align="right">
                  <div
                    style={{
                      display: "inline-flex",
                      gap: "12px",
                      alignItems: "center",
                    }}
                  >
                    <Link
                      href={`/expenses?tab=${tab}&edit=${r.id}#form`}
                      style={{ color: "var(--accent-2)", fontSize: "12px" }}
                    >
                      Editar
                    </Link>
                    <DeleteButton id={r.id} />
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div
        id="form"
        style={{ paddingTop: "8px", borderTop: "1px solid var(--border)" }}
      >
        {editing && (
          <div
            className="label"
            style={{ marginBottom: "8px", color: "var(--muted)" }}
          >
            Editar gasto
          </div>
        )}
        <ExpenseForm type={type} editing={editing} onDoneHref={`/expenses?tab=${tab}`} />
      </div>
    </section>
  );
}

function BasketSection({
  rows,
  realByBasket,
  donutSlices,
  money,
}: {
  rows: SerializedExpense[];
  realByBasket: ReturnType<typeof sumRealByBasket>;
  donutSlices: DonutSlice[];
  money: Intl.NumberFormat;
}) {
  const total = realByBasket.total;
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 220px",
        gap: "16px",
        alignItems: "stretch",
      }}
    >
      <div className="card flex flex-col gap-5">
        <div className="label">Reparto del gasto real por canasta</div>
        {BASKETS.map((b) => {
          const real = realByBasket[b];
          // NIVEL 1 — % de la canasta sobre el total real del mes.
          // Las tres suman 100%. Si el total es 0, 0% sin dividir por cero.
          const pct = total > 0 ? (real / total) * 100 : 0;
          // NIVEL 2 — gastos de la canasta (activos), de mayor a menor; cada
          // % es sobre el TOTAL del mes (no sobre la canasta), para que se vea
          // el peso real de cada gasto en el panorama completo.
          const items = rows
            .filter((r) => r.isActive && r.basket === b)
            .sort((a, c) => c.amount - a.amount);
          return (
            <div key={b} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                }}
              >
                <span style={{ color: "var(--text)" }}>{BASKET_LABELS_ES[b]}</span>
                <span style={{ color: "var(--muted)" }}>
                  {money.format(real)}
                  <span style={{ color: "var(--text)" }}>
                    {" · "}
                    {Math.round(pct)}%
                  </span>
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  background: "var(--surface)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: BASKET_COLORS[b],
                  }}
                />
              </div>

              {/* NIVEL 2 — desglose de gastos individuales */}
              {items.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    paddingLeft: "12px",
                    marginTop: "4px",
                  }}
                >
                  {items.map((r) => {
                    // Dos porcentajes: dentro de la canasta y sobre el total
                    // del mes. Guards para no dividir por cero.
                    const pctOfBasket = real > 0 ? (r.amount / real) * 100 : 0;
                    const pctOfTotal = total > 0 ? (r.amount / total) * 100 : 0;
                    // La barra representa el peso sobre el TOTAL del mes, así
                    // todas las barras (canasta y gastos) quedan en la misma
                    // escala y se compara el peso real de un vistazo.
                    return (
                      <div
                        key={r.id}
                        style={{ display: "flex", flexDirection: "column", gap: "4px" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "12px",
                          }}
                        >
                          <span style={{ color: "var(--text)" }}>{r.name}</span>
                          <span style={{ color: "var(--muted)" }}>
                            {money.format(r.amount)}
                          </span>
                        </div>
                        <div
                          style={{
                            height: 4,
                            background: "var(--surface)",
                            borderRadius: 4,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${pctOfTotal}%`,
                              height: "100%",
                              background: "var(--muted)",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            fontSize: "11px",
                            color: "var(--hint)",
                          }}
                        >
                          <span>{Math.round(pctOfBasket)}% de la canasta</span>
                          <span>·</span>
                          <span>{pctOfTotal.toFixed(1)}% del total</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding: "12px" }}>
        {donutSlices.length > 0 ? (
          <PortfolioDonut
            slices={donutSlices}
            formattedTotal={money.format(realByBasket.total)}
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
            Sin gastos para graficar
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// Primitivos
// ============================================================================
function Kpi({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: string;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div>
      <div className="label">{label}</div>
      <div
        className="kpi-medium"
        style={{
          marginTop: "4px",
          color: accent ? "var(--accent)" : muted ? "var(--muted)" : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function TabLink({
  current,
  tab,
  label,
}: {
  current: Tab;
  tab: Tab;
  label: string;
}) {
  const active = current === tab;
  return (
    <Link
      href={`/expenses?tab=${tab}`}
      style={{
        padding: "6px 14px",
        borderRadius: "8px",
        fontSize: "12px",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        border: "1px solid var(--border)",
        background: active ? "var(--accent)" : "transparent",
        color: active ? "var(--bg)" : "var(--muted)",
        fontWeight: active ? 700 : 400,
      }}
    >
      {label}
    </Link>
  );
}

function BasketTag({ basket }: { basket: Basket }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
      <span
        style={{
          display: "inline-block",
          width: 8,
          height: 8,
          borderRadius: 2,
          background: BASKET_COLORS[basket],
        }}
      />
      <span style={{ fontSize: "12px" }}>{BASKET_LABELS_ES[basket]}</span>
    </span>
  );
}

function DeleteButton({ id }: { id: string }) {
  return (
    <form action={deleteExpenseAction} style={{ display: "inline" }}>
      <input type="hidden" name="id" value={id} />
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
        padding: "10px 8px",
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
        padding: "10px 8px",
        whiteSpace: "nowrap",
        color: accent ? "var(--accent)" : undefined,
      }}
    >
      {children}
    </td>
  );
}
