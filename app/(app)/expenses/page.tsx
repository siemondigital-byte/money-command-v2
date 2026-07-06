import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeExpense, type SerializedExpense } from "@/lib/serialize";
import { activePeriod, getMonthlyRecord, periodToString } from "@/lib/monthly";
import {
  BASKETS,
  BASKET_COLORS,
  sumRealByBasket,
  totalsByType,
  type Basket,
} from "@/lib/expenses";
import { getDict, type Dict } from "@/lib/i18n";
import { getServerDict } from "@/lib/i18n/server";
import { PortfolioDonut, type DonutSlice } from "../investments/PortfolioDonut";
import { ExpenseForm } from "./ExpenseForm";
import { SubscriptionForm } from "./SubscriptionForm";
import { StatementScanner } from "./StatementScanner";
import {
  VariablesByCategory,
  type CategoryExpenseRow,
} from "./VariablesByCategory";
import { normalizeCategoryKey, categoryLabel } from "./category-grouping";
import { deleteExpenseAction } from "./actions";

export async function generateMetadata() {
  return { title: (await getServerDict()).metadata.expenses };
}

type Tab = "fixed" | "variable" | "basket";

// Categorías que alimentan el panel de fugas (suscripciones y gastos hormiga).
// Enfoque por CATEGORÍA (no por marca): cualquier gasto de estas categorías
// cuenta. Para incluir/excluir un gasto, se le cambia la categoría en la lista.
// Comparación normalizada (case-insensitive) para no fragmentar "Otros"/"otros".
const LEAK_CATEGORIES = new Set([
  "suscripciones",
  "entretenimiento",
  "delivery",
  "otros",
  "mixtos",
  "mixto",
]);

/** SerializedExpense → fila liviana para <VariablesByCategory> (vista agrupada). */
function toCategoryRow(r: SerializedExpense): CategoryExpenseRow {
  return {
    id: r.id,
    name: r.name,
    amount: r.amount,
    category: r.category,
    basket: r.basket as Basket,
    isActive: r.isActive,
    type: r.type,
    purchaseDate: r.purchaseDate
      ? new Date(r.purchaseDate).toISOString().slice(0, 10)
      : null,
  };
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; edit?: string }>;
}) {
  const { user, profile } = await requireUser();
  const params = await searchParams;
  const dict = getDict(profile.locale);

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

  // Panel de fugas (presentación pura): suma los gastos activos del período
  // cuya CATEGORÍA está en LEAK_CATEGORIES (suscripciones, entretenimiento,
  // otros, mixtos). No toca totales ni consolidación.
  // Capital de libertad = mensual × 150 (= mensual × 12 ÷ 0.08, renta al 8%).
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const leakRows = rows.filter(
    (r) => r.isActive && LEAK_CATEGORIES.has(normalizeCategoryKey(r.category)),
  );
  // Mismas filas para la vista agrupada/desplegable (idéntica a la lista de arriba).
  const leakGroupedRows = leakRows.map(toCategoryRow);
  const leakMonthly = round2(leakRows.reduce((s, r) => s + r.amount, 0));
  const leakAnnual = round2(leakMonthly * 12);
  const leakFiveYears = round2(leakMonthly * 60);
  const leakFreedomCapital = round2(leakMonthly * 150);

  // Formato moneda — decimales según moneda (default ISO 4217)
  const locale = profile.locale === "es" ? "es-AR" : "en-US";
  const money = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: profile.currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

  // Las suscripciones tienen su propia sección; no se listan en Fijos/Variables.
  const fixedRows = rows.filter((r) => r.type === "fixed" && !r.isSubscription);
  const variableRows = rows.filter((r) => r.type === "variable");

  const donutSlices: DonutSlice[] = BASKETS.filter(
    (b) => realByBasket[b] > 0,
  ).map((b) => ({
    category: b,
    label: dict.labels.baskets[b],
    capital: realByBasket[b],
    color: BASKET_COLORS[b],
  }));

  return (
    <div className="fade-up flex flex-col gap-6">
      <header>
        <div className="label mb-1">
          Egresos · {dict.labels.months[period.month - 1]} {period.year}
        </div>
        <h1>Dirigí tu dinero</h1>
        <p style={{ color: "var(--muted)", fontSize: "13px", marginTop: "8px" }}>
          Registrá tus egresos del período y asigná cada uno a una canasta:
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

      {/* Escáner de resumen de tarjeta (Etapa 3: revisión + creación real) */}
      <StatementScanner
        existingExpenses={rows.map((r) => ({ name: r.name, amount: r.amount }))}
        activeMonthLabel={`${dict.labels.months[period.month - 1]} ${period.year}`}
      />

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
          dict={dict}
          editing={editing?.type === "fixed" ? editing : null}
          tab="fixed"
        />
      )}
      {tab === "variable" && (
        <ExpenseTypeSection
          type="variable"
          rows={variableRows}
          money={money}
          dict={dict}
          editing={editing?.type === "variable" ? editing : null}
          tab="variable"
          grouped
          locale={locale}
          currency={profile.currency}
        />
      )}
      {tab === "basket" && (
        <BasketSection
          rows={rows}
          realByBasket={realByBasket}
          donutSlices={donutSlices}
          money={money}
          dict={dict}
        />
      )}

      {/* Suscripciones (absorbidas en Estilo) — solo en la tab Variables */}
      {tab === "variable" && (
        <section className="card flex flex-col gap-4">
        <div>
          <div className="label">{dict.expenses.leaks.title}</div>
          <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
            {dict.expenses.leaks.intro}
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
          <Kpi label={dict.expenses.leaks.perMonth} value={money.format(leakMonthly)} />
          <Kpi label={dict.expenses.leaks.perYear} value={money.format(leakAnnual)} muted />
          <Kpi
            label={dict.expenses.leaks.inFiveYears}
            value={money.format(leakFiveYears)}
            muted
          />
          <Kpi
            label={dict.expenses.leaks.freedomCapital}
            value={money.format(leakFreedomCapital)}
            accent
          />
        </div>
        <p style={{ fontSize: "11px", color: "var(--hint)", margin: 0 }}>
          {dict.expenses.leaks.freedomCapitalNote}
        </p>

        {/* Ítems agrupados por categoría, idéntico a la lista de arriba
            (desplegable, nombre + fecha, Editar/Eliminar). La diferencia es que
            acá solo están las categorías de fuga. Para incluir o excluir un
            gasto, se le cambia la categoría. */}
        {leakGroupedRows.length > 0 && (
          <VariablesByCategory
            rows={leakGroupedRows}
            locale={locale}
            currency={profile.currency}
          />
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
  dict,
  editing,
  tab,
  grouped = false,
  locale,
  currency,
}: {
  type: "fixed" | "variable";
  rows: SerializedExpense[];
  money: Intl.NumberFormat;
  dict: Dict;
  editing: SerializedExpense | null;
  tab: Tab;
  /** Agrupar por categoría con desplegables (solo Variables). */
  grouped?: boolean;
  locale?: string;
  currency?: string;
}) {
  const subtotal = rows
    .filter((r) => r.isActive)
    .reduce((s, r) => s + r.amount, 0);
  const label = type === "fixed" ? "Egresos fijos" : "Egresos variables";

  // Vista agrupada: mismas filas, reagrupadas por categoría (solo presentación).
  // El subtotal de arriba sigue siendo Σ activos (igual que totalsByType).
  const groupedRows: CategoryExpenseRow[] = grouped
    ? rows.map(toCategoryRow)
    : [];

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

      {/* Vista agrupada por categoría (Variables): desplegables por categoría. */}
      {grouped && rows.length > 0 && (
        <VariablesByCategory
          rows={groupedRows}
          locale={locale ?? "en-US"}
          currency={currency ?? "USD"}
        />
      )}

      {!grouped && rows.length > 0 && (
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
                <Td>{dict.labels.categories[r.category] ?? r.category}</Td>
                <Td>
                  <BasketTag basket={r.basket as Basket} dict={dict} />
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
        </div>

        {/* Móvil (< md): una tarjeta por gasto, sin scroll horizontal. */}
        <div className="md:hidden flex flex-col gap-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="card card-elevated"
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontWeight: 700,
                      fontSize: "1rem",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {r.name}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--muted)",
                      marginTop: "2px",
                    }}
                  >
                    {dict.labels.categories[r.category] ?? r.category}
                  </div>
                </div>
                <BasketTag basket={r.basket as Basket} dict={dict} />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px 16px",
                }}
              >
                <Field
                  label="Presupuesto"
                  value={r.budget > 0 ? money.format(r.budget) : "—"}
                />
                <Field label="Real" value={money.format(r.amount)} color="var(--accent)" />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "18px",
                  alignItems: "center",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <Link
                  href={`/expenses?tab=${tab}&edit=${r.id}#form`}
                  style={{ color: "var(--accent-2)", fontSize: "13px" }}
                >
                  Editar
                </Link>
                <DeleteButton id={r.id} />
              </div>
            </div>
          ))}
        </div>
        </>
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
            Editar egreso
          </div>
        )}
        <ExpenseForm key={editing?.id ?? "new"} type={type} editing={editing} onDoneHref={`/expenses?tab=${tab}`} />
      </div>
    </section>
  );
}

function BasketSection({
  rows,
  realByBasket,
  donutSlices,
  money,
  dict,
}: {
  rows: SerializedExpense[];
  realByBasket: ReturnType<typeof sumRealByBasket>;
  donutSlices: DonutSlice[];
  money: Intl.NumberFormat;
  dict: Dict;
}) {
  const total = realByBasket.total;
  return (
    <section className="flex flex-col gap-4">
      {/* Gráfico arriba (parte superior) */}
      <div
        className="card"
        style={{
          padding: "12px",
          maxWidth: "100%",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {donutSlices.length > 0 ? (
          <div style={{ width: "100%", maxWidth: "260px" }}>
            <PortfolioDonut
              slices={donutSlices}
              formattedTotal={money.format(realByBasket.total)}
            />
          </div>
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
            Sin egresos para graficar
          </div>
        )}
      </div>

      {/* Reparto por canasta: dentro de cada canasta, Fijos y Variables, y de
          cada tipo sus 3 categorías con más impacto (sin desplegable). */}
      <div className="card flex flex-col gap-5">
        <div className="label">Reparto del egreso real por canasta</div>
        {BASKETS.map((b) => {
          const real = realByBasket[b];
          // Ocultar la fila completa de una canasta sin gastos en el período
          // (total = 0): no se muestra "$0 · 0%", simplemente no aparece.
          if (real <= 0) return null;
          // NIVEL 1 — % de la canasta sobre el total real del mes.
          // Las tres suman 100%. Si el total es 0, 0% sin dividir por cero.
          const pct = total > 0 ? (real / total) * 100 : 0;
          // NIVEL 2 — la canasta partida en FIJOS y VARIABLES; dentro de cada
          // tipo, las categorías (activas) de mayor a menor. Se reagrupan las
          // MISMAS filas activas: los totales por tipo/categoría no alteran el
          // total de la canasta (realByBasket). Solo presentación.
          const typeGroups = (["variable", "fixed"] as const)
            .map((t) => {
              const catMap = new Map<
                string,
                { key: string; label: string; total: number }
              >();
              let typeTotal = 0;
              for (const r of rows) {
                if (!r.isActive || r.basket !== b || r.type !== t) continue;
                typeTotal += r.amount;
                const key = normalizeCategoryKey(r.category);
                let g = catMap.get(key);
                if (!g) {
                  g = {
                    key,
                    label: categoryLabel(key, r.category, dict.labels.categories),
                    total: 0,
                  };
                  catMap.set(key, g);
                }
                g.total += r.amount;
              }
              const cats = [...catMap.values()]
                .map((c) => ({ ...c, total: Math.round(c.total * 100) / 100 }))
                .sort((a, c) => c.total - a.total);
              return {
                type: t,
                label: t === "fixed" ? "Fijos" : "Variables",
                typeTotal: Math.round(typeTotal * 100) / 100,
                cats,
              };
            })
            .filter((g) => g.typeTotal > 0)
            .sort((a, c) => c.typeTotal - a.typeTotal);
          return (
            <div key={b} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                }}
              >
                <span style={{ color: "var(--text)" }}>{dict.labels.baskets[b]}</span>
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

              {/* NIVEL 2 — por tipo (Fijos/Variables), top 3 categorías */}
              {typeGroups.map((tg) => {
                const topCats = tg.cats.slice(0, 3);
                const extra = tg.cats.length - topCats.length;
                return (
                  <div
                    key={tg.type}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      paddingLeft: "12px",
                      marginTop: "6px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "12px",
                      }}
                    >
                      <span style={{ color: "var(--text)", fontWeight: 600 }}>
                        {tg.label}
                      </span>
                      <span style={{ color: "var(--muted)" }}>
                        {money.format(tg.typeTotal)}
                      </span>
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--hint)" }}>
                      {tg.cats.length >= 3
                        ? "Las 3 categorías con más impacto"
                        : "Categorías con más impacto"}
                    </div>
                    {topCats.map((c) => {
                      // Dos porcentajes: dentro de la canasta y sobre el total
                      // del mes. Guards para no dividir por cero. La barra usa
                      // el peso sobre el total, misma escala que todo el resto.
                      const pctOfBasket = real > 0 ? (c.total / real) * 100 : 0;
                      const pctOfTotal = total > 0 ? (c.total / total) * 100 : 0;
                      return (
                        <div
                          key={c.key}
                          style={{ display: "flex", flexDirection: "column", gap: "4px" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "12px",
                            }}
                          >
                            <span style={{ color: "var(--text)" }}>{c.label}</span>
                            <span style={{ color: "var(--muted)" }}>
                              {money.format(c.total)}
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
                            <span>{Math.round(pctOfTotal)}% del total</span>
                          </div>
                        </div>
                      );
                    })}
                    {extra > 0 && (
                      <div style={{ fontSize: "11px", color: "var(--hint)" }}>
                        +{extra} categoría{extra > 1 ? "s" : ""} más
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
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

function BasketTag({ basket, dict }: { basket: Basket; dict: Dict }) {
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
      <span style={{ fontSize: "12px" }}>{dict.labels.baskets[basket]}</span>
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
