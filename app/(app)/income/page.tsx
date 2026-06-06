import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeIncome } from "@/lib/serialize";
import { effectivePlanB, incomeTotals } from "@/lib/income";
import {
  activePeriod,
  getMonthlyRecord,
  periodToString,
} from "@/lib/monthly";
import { IncomeRowForm } from "./IncomeRowForm";
import { PlanBOverrideForm } from "./PlanBOverrideForm";
import { deleteIncomeAction } from "./actions";

export const metadata = { title: "Ingresos · The Money Command" };

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

const PLAN_LABELS = {
  A: { name: "Plan A · Salario / Activos", helper: "Tu ingreso principal recurrente." },
  B: {
    name: "Plan B · Ingreso pasivo",
    helper:
      "Calculado desde el portafolio de Inversiones: capital × yield pasivo ÷ 12. Es la fuente única de verdad — Income consume este valor.",
  },
  C: {
    name: "Plan C · Secundario / Freelance",
    helper: "Ingresos variables: proyectos, segundo trabajo, comisiones.",
  },
} as const;

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { user, profile } = await requireUser();
  const params = await searchParams;

  const period = activePeriod({
    activeYear: profile.activeYear,
    activeMonth: profile.activeMonth,
  });

  // Carga de datos
  const [rowsRaw, positionsRaw, monthlyRecord] = await Promise.all([
    prisma.income.findMany({
      // Sólo las filas del período activo (Income es flujo del mes).
      where: { userId: user.id, year: period.year, month: period.month },
      orderBy: [{ plan: "asc" }, { createdAt: "asc" }],
    }),
    prisma.investment.findMany({
      where: { userId: user.id, isActive: true },
      select: { capital: true, passiveYield: true },
    }),
    getMonthlyRecord(user.id, period),
  ]);

  const rows = rowsRaw.map(serializeIncome);
  const positions = positionsRaw.map((p) => ({
    capital: Number(p.capital),
    passiveYield: Number(p.passiveYield),
  }));

  const editing = params.edit
    ? (rows.find((r) => r.id === params.edit) ?? null)
    : null;

  // Plan B efectivo
  const planB = effectivePlanB({
    positions,
    manualOverride: profile.planBManualOverride,
    manualAmount:
      profile.planBManualAmount !== null
        ? Number(profile.planBManualAmount)
        : null,
  });

  // Totales
  const totals = incomeTotals(
    rows.map((r) => ({ plan: r.plan, amount: r.amount, isActive: r.isActive })),
    planB.amount,
  );

  // Formato moneda — decimales según moneda (default ISO 4217)
  const locale = profile.locale === "es" ? "es-AR" : "en-US";
  const money = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: profile.currency,
  });
  const pct = new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 1,
  });

  const rowsA = rows.filter((r) => r.plan === "A");
  const rowsC = rows.filter((r) => r.plan === "C");

  return (
    <div className="fade-up flex flex-col gap-6">
      <header>
        <div className="label mb-1">
          Ingresos · {MONTH_LABELS_ES[period.month - 1]} {period.year}
        </div>
        <h1>Plan A · B · C</h1>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "13px",
            marginTop: "8px",
          }}
        >
          Plan A y Plan C son manuales. Plan B se consume desde Inversiones
          como suma de yields ÷ 12 — con override manual opcional. Lo que
          cargás acá se consolida automáticamente en el período activo.
        </p>
        {monthlyRecord && (
          <p
            style={{
              fontSize: "11px",
              color: "var(--hint)",
              marginTop: "6px",
            }}
          >
            Consolidado al MonthlyRecord {periodToString(period)} ·
            incomeTotal = {money.format(Number(monthlyRecord.incomeTotal))}
          </p>
        )}
      </header>

      {/* KPIs */}
      <section
        className="card"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "20px",
        }}
      >
        <div>
          <div className="label">Total ingresos/mes</div>
          <div className="kpi-large" style={{ marginTop: "4px" }}>
            {money.format(totals.total)}
          </div>
        </div>
        <div>
          <div className="label">% pasivo</div>
          <div className="kpi-medium" style={{ marginTop: "4px" }}>
            {pct.format(totals.passiveShare)}
          </div>
          <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: 2 }}>
            Plan B sobre el total
          </p>
        </div>
      </section>

      {/* Plan A */}
      <PlanSection
        plan="A"
        money={money}
        rows={rowsA}
        editing={editing?.plan === "A" ? editing : null}
        editingHref="/income"
      />

      {/* Plan B */}
      <section
        className="card"
        id="plan-b"
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div>
            <div className="label">{PLAN_LABELS.B.name}</div>
            <p
              style={{
                fontSize: "12px",
                color: "var(--muted)",
                marginTop: "4px",
              }}
            >
              {PLAN_LABELS.B.helper}
            </p>
          </div>
          <PlanBBadge source={planB.source} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            paddingTop: "8px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div>
            <div className="label">Plan B mensual</div>
            <div
              className="kpi-large"
              style={{
                marginTop: "4px",
                color:
                  planB.source === "manual"
                    ? "var(--warning)"
                    : "var(--accent)",
              }}
            >
              {money.format(planB.amount)}
            </div>
          </div>
          <div>
            <div className="label">
              {planB.source === "manual" ? "Auto desde Inversiones" : "Yields totales"}
            </div>
            <div
              className="kpi-medium"
              style={{ marginTop: "4px", color: "var(--muted)" }}
            >
              {money.format(planB.autoAmount)}
            </div>
            <p
              style={{
                fontSize: "11px",
                color: "var(--hint)",
                marginTop: 2,
              }}
            >
              <Link href="/investments" style={{ color: "var(--accent-2)" }}>
                Editar posiciones →
              </Link>
            </p>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "12px",
          }}
        >
          <PlanBOverrideForm
            enabled={profile.planBManualOverride}
            amount={
              profile.planBManualAmount !== null
                ? Number(profile.planBManualAmount)
                : null
            }
            autoAmount={planB.autoAmount}
            locale={profile.locale}
            currency={profile.currency}
          />
        </div>
      </section>

      {/* Plan C */}
      <PlanSection
        plan="C"
        money={money}
        rows={rowsC}
        editing={editing?.plan === "C" ? editing : null}
        editingHref="/income"
      />
    </div>
  );
}

function PlanBBadge({ source }: { source: "auto" | "manual" }) {
  if (source === "manual") {
    return (
      <span
        style={{
          fontSize: "10px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          fontWeight: 700,
          color: "var(--bg)",
          background: "var(--warning)",
          padding: "4px 8px",
          borderRadius: "6px",
        }}
      >
        Manual
      </span>
    );
  }
  return (
    <span
      style={{
        fontSize: "10px",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        fontWeight: 700,
        color: "var(--bg)",
        background: "var(--accent)",
        padding: "4px 8px",
        borderRadius: "6px",
      }}
    >
      Auto
    </span>
  );
}

function PlanSection({
  plan,
  rows,
  editing,
  editingHref,
  money,
}: {
  plan: "A" | "C";
  rows: ReturnType<typeof serializeIncome>[];
  editing: ReturnType<typeof serializeIncome> | null;
  editingHref: string;
  money: Intl.NumberFormat;
}) {
  const subtotal = rows
    .filter((r) => r.isActive)
    .reduce((s, r) => s + r.amount, 0);

  return (
    <section
      className="card"
      style={{ display: "flex", flexDirection: "column", gap: "12px" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div>
          <div className="label">{PLAN_LABELS[plan].name}</div>
          <p
            style={{
              fontSize: "12px",
              color: "var(--muted)",
              marginTop: "4px",
            }}
          >
            {PLAN_LABELS[plan].helper}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="label">Subtotal/mes</div>
          <div
            className="kpi-medium"
            style={{ marginTop: "4px", color: "var(--accent)" }}
          >
            {money.format(subtotal)}
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
              <Th align="right">Monto</Th>
              <Th align="right">Acción</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <Td>{r.name}</Td>
                <Td align="right">{money.format(r.amount)}</Td>
                <Td align="right">
                  <div
                    style={{
                      display: "inline-flex",
                      gap: "12px",
                      alignItems: "center",
                    }}
                  >
                    <Link
                      href={`/income?edit=${r.id}#plan-${plan.toLowerCase()}-form`}
                      style={{
                        color: "var(--accent-2)",
                        fontSize: "12px",
                      }}
                    >
                      Editar
                    </Link>
                    <form action={deleteIncomeAction}>
                      <input type="hidden" name="id" value={r.id} />
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
            ))}
          </tbody>
        </table>
      )}

      <div
        id={`plan-${plan.toLowerCase()}-form`}
        style={{
          paddingTop: "8px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div
          className="label"
          style={{ marginBottom: "8px", color: "var(--muted)" }}
        >
          {editing ? `Editar fila ${plan}` : `Agregar a Plan ${plan}`}
        </div>
        <IncomeRowForm plan={plan} editing={editing} onDoneHref={editingHref} />
      </div>
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
        padding: "10px 4px",
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
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      style={{
        textAlign: align ?? "left",
        padding: "10px 4px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </td>
  );
}
