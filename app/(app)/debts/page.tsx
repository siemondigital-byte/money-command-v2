import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeDebt, type SerializedDebt } from "@/lib/serialize";
import { activePeriod, getMonthlyRecord, periodToString } from "@/lib/monthly";
import {
  DEBT_TYPE_LABELS_ES,
  PURPOSE_LABELS_ES,
  sumBalances,
  sumMonthlyPayments,
  weightedApr,
  debtToIncomeRatio,
  dtiStatus,
  splitByPurpose,
  hasDebtsBehind,
  compareStrategies,
  type DebtType,
  type DebtPurpose,
  type PayoffResult,
} from "@/lib/debts";
import { DebtForm } from "./DebtForm";
import { DebtProjectionChart } from "./DebtProjectionChart";
import { deleteDebtAction, confirmDebtPaymentsAction } from "./actions";

export const metadata = { title: "Deudas · The Money Command" };

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

export default async function DebtsPage({
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

  const [debtsRaw, monthlyRecord] = await Promise.all([
    prisma.debt.findMany({
      where: { userId: user.id, isActive: true },
      orderBy: [{ balance: "desc" }, { createdAt: "asc" }],
    }),
    getMonthlyRecord(user.id, period),
  ]);
  const debts = debtsRaw.map(serializeDebt);

  const editing = params.edit
    ? (debts.find((d) => d.id === params.edit) ?? null)
    : null;

  // KPIs (helpers puros)
  const totalBalance = sumBalances(debts);
  const monthlyPayment = sumMonthlyPayments(debts);
  const wApr = weightedApr(debts);
  const income = Number(monthlyRecord?.incomeTotal ?? 0);
  const paymentShare = income > 0 ? monthlyPayment / income : 0;
  const ratio = debtToIncomeRatio(monthlyPayment, income);
  const ratioStatus = dtiStatus(ratio);
  const split = splitByPurpose(debts);

  const ratioColor =
    ratioStatus === "healthy"
      ? "var(--accent)"
      : ratioStatus === "warning"
        ? "var(--gold)"
        : "var(--danger)";

  const behind = hasDebtsBehind(debts, period);

  // CAPA 2 — estrategias de pago sobre las deudas activas
  const comparison = compareStrategies(
    debts.map((d) => ({
      id: d.id,
      name: d.name,
      balance: d.balance,
      apr: d.apr,
      minPayment: d.minPayment,
      currentPayment: d.currentPayment,
    })),
  );
  const recommended = comparison.avalanche; // recommended === "avalanche"

  // Formato — decimales según moneda (default ISO 4217)
  const locale = profile.locale === "es" ? "es-AR" : "en-US";
  const money = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: profile.currency,
  });
  const pct = new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 1,
  });

  return (
    <div className="fade-up flex flex-col gap-6">
      <header>
        <div className="label mb-1">Deudas y créditos</div>
        <h1>Salí de la deuda</h1>
        <p style={{ color: "var(--muted)", fontSize: "13px", marginTop: "8px" }}>
          Registrá tus deudas para ver su peso real y dirigir el dinero a
          liberarlas. Pagar deuda es ordenar tus finanzas hacia la libertad.
        </p>
        {monthlyRecord && (
          <p style={{ fontSize: "11px", color: "var(--hint)", marginTop: "6px" }}>
            Consolidado al MonthlyRecord {periodToString(period)} · debtTotal ={" "}
            {money.format(Number(monthlyRecord.debtTotal))}
          </p>
        )}
      </header>

      {/* Confirmación de pago del mes */}
      {behind && (
        <section
          className="card"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            alignItems: "center",
            justifyContent: "space-between",
            borderColor: "var(--accent-2)",
          }}
        >
          <div>
            <div style={{ fontSize: "14px", color: "var(--text)" }}>
              ¿Confirmás tus pagos de deuda de {MONTH_LABELS_ES[period.month - 1]}?
            </div>
            <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
              Si pagaste lo registrado, actualizamos el saldo. Si pagaste
              distinto, editá la deuda abajo.
            </p>
          </div>
          <form action={confirmDebtPaymentsAction}>
            <button type="submit" className="btn-primary">
              Sí, pagué lo registrado
            </button>
          </form>
        </section>
      )}

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
          label="Deuda Total"
          value={money.format(totalBalance)}
          sub={`${debts.length} deuda${debts.length === 1 ? "" : "s"}`}
        />
        <Kpi
          label="Pago Mensual"
          value={money.format(monthlyPayment)}
          sub={income > 0 ? `${pct.format(paymentShare)} de tus ingresos` : "registrá tus ingresos"}
        />
        <Kpi
          label="APR Ponderado"
          value={pct.format(wApr / 100)}
          sub="prom. ponderado"
        />
        <Kpi
          label="Ratio Deuda/Ingreso"
          value={pct.format(ratio)}
          sub="saludable < 36%"
          valueColor={income > 0 ? ratioColor : "var(--muted)"}
        />
        <Kpi
          label="Libre de Deudas"
          value={
            debts.length === 0
              ? "—"
              : recommended.converges
                ? `~${recommended.months} ${recommended.months === 1 ? "mes" : "meses"}`
                : "no converge"
          }
          sub={
            debts.length === 0
              ? "sin deudas"
              : recommended.converges
                ? "estrategia Avalancha"
                : "el pago no cubre el interés"
          }
          valueColor={
            debts.length === 0 || !recommended.converges
              ? "var(--muted)"
              : "var(--accent)"
          }
        />
      </section>

      {/* Desglose consumo vs inversión */}
      <section
        className="card"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        <div>
          <div className="label">Deuda de consumo</div>
          <div className="kpi-medium" style={{ marginTop: "4px", color: "var(--gold)" }}>
            {money.format(split.consumption)}
          </div>
          <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: 2 }}>
            De la que conviene salir y no repetir.
          </p>
        </div>
        <div>
          <div className="label">Deuda de inversión</div>
          <div className="kpi-medium" style={{ marginTop: "4px", color: "var(--accent-2)" }}>
            {money.format(split.investment)}
          </div>
          <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: 2 }}>
            Justificada solo si genera retorno.
          </p>
        </div>
      </section>

      {/* Tabla */}
      {debts.length > 0 && (
        <section className="card" style={{ padding: 0, overflow: "hidden" }}>
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
                  <Th>Nombre</Th>
                  <Th>Tipo</Th>
                  <Th>Etiqueta</Th>
                  <Th align="right">Saldo</Th>
                  <Th align="right">APR</Th>
                  <Th align="right">Pago mín.</Th>
                  <Th align="right">Pago real</Th>
                  <Th align="right">Cuotas</Th>
                  <Th align="right">Acción</Th>
                </tr>
              </thead>
              <tbody>
                {debts.map((d) => (
                  <tr key={d.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <Td>{d.name}</Td>
                    <Td>{DEBT_TYPE_LABELS_ES[d.type as DebtType] ?? d.type}</Td>
                    <Td>{PURPOSE_LABELS_ES[d.purpose as DebtPurpose] ?? d.purpose}</Td>
                    <Td align="right" accent>
                      {money.format(d.balance)}
                    </Td>
                    <Td align="right">{pct.format(d.apr / 100)}</Td>
                    <Td align="right">{money.format(d.minPayment)}</Td>
                    <Td align="right">{money.format(d.currentPayment)}</Td>
                    <Td align="right">{d.termMonths ?? "—"}</Td>
                    <Td align="right">
                      <div
                        style={{
                          display: "inline-flex",
                          gap: "12px",
                          alignItems: "center",
                        }}
                      >
                        <Link
                          href={`/debts?edit=${d.id}#form`}
                          style={{ color: "var(--accent-2)", fontSize: "12px" }}
                        >
                          Editar
                        </Link>
                        <DeleteButton id={d.id} />
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* CAPA 2 — Estrategia de pago */}
      <section className="card flex flex-col gap-4">
        <div>
          <div className="label">Estrategia de pago: ¿cuál te conviene?</div>
          <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
            Mismo presupuesto mensual, distinto orden de ataque. Cuando una
            deuda se salda, su pago acelera la siguiente.
          </p>
        </div>

        {debts.length === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--hint)" }}>
            Cuando registres deudas, acá vas a ver tu plan para liberarte.
          </p>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "16px",
              }}
            >
              <StrategyCard
                title="Avalancha"
                recommended
                desc="Paga primero la deuda con mayor interés. Ahorra más a largo plazo."
                result={comparison.avalanche}
                money={money}
              />
              <StrategyCard
                title="Bola de Nieve"
                desc="Paga primero la deuda más pequeña. Más victorias rápidas."
                result={comparison.snowball}
                money={money}
              />
            </div>

            {comparison.avalanche.converges &&
              comparison.snowball.converges &&
              comparison.interestSaved > 0 && (
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text)",
                    borderTop: "1px solid var(--border)",
                    paddingTop: "12px",
                  }}
                >
                  La estrategia Avalancha te ahorra{" "}
                  <span style={{ color: "var(--accent)" }}>
                    {money.format(comparison.interestSaved)}
                  </span>{" "}
                  en intereses vs Bola de Nieve.
                </p>
              )}
          </>
        )}
      </section>

      {/* CAPA 2 — Proyección de reducción de deuda */}
      <section className="card flex flex-col gap-3">
        <div className="label">Proyección de reducción de deuda</div>
        {debts.length === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--hint)" }}>
            Acá vas a ver cómo baja tu saldo mes a mes hasta llegar a cero.
          </p>
        ) : !recommended.converges ? (
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            Con el pago actual la deuda no se salda: el pago no alcanza a cubrir
            el interés. Subí el pago mensual real de tus deudas para ver la
            proyección.
          </p>
        ) : (
          <>
            <p style={{ fontSize: "12px", color: "var(--muted)" }}>
              Estrategia Avalancha, libre de deudas en ~{recommended.months}{" "}
              {recommended.months === 1 ? "mes" : "meses"}.
            </p>
            <DebtProjectionChart
              schedule={recommended.schedule}
              locale={profile.locale}
              currency={profile.currency}
            />
          </>
        )}
      </section>

      {/* Form crear / editar */}
      <DebtForm editing={editing} />
    </div>
  );
}

// ============================================================================
// Primitivos
// ============================================================================
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

function StrategyCard({
  title,
  desc,
  result,
  money,
  recommended,
}: {
  title: string;
  desc: string;
  result: PayoffResult;
  money: Intl.NumberFormat;
  recommended?: boolean;
}) {
  const startsWith = result.order[0]?.name ?? "—";
  return (
    <div
      style={{
        border: `1px solid ${recommended ? "var(--accent)" : "var(--border)"}`,
        borderRadius: "12px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "14px", color: "var(--text)", fontWeight: 600 }}>
          {title}
        </span>
        {recommended && (
          <span
            style={{
              fontSize: "9px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "var(--bg)",
              background: "var(--accent)",
              padding: "3px 7px",
              borderRadius: "6px",
            }}
          >
            Recomendada
          </span>
        )}
      </div>
      <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.5 }}>
        {desc}
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          borderTop: "1px solid var(--border)",
          paddingTop: "10px",
        }}
      >
        <StrategyStat
          label="Libre en"
          value={
            result.converges
              ? `${result.months} ${result.months === 1 ? "mes" : "meses"}`
              : "no converge"
          }
        />
        <StrategyStat
          label="Interés total"
          value={result.converges ? money.format(result.totalInterest) : "—"}
        />
        <StrategyStat label="Empieza por" value={startsWith} />
      </div>
    </div>
  );
}

function StrategyStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "13px",
      }}
    >
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span style={{ color: "var(--text)" }}>{value}</span>
    </div>
  );
}

function DeleteButton({ id }: { id: string }) {
  return (
    <form action={deleteDebtAction} style={{ display: "inline" }}>
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
        padding: "12px 12px",
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
        padding: "12px 12px",
        whiteSpace: "nowrap",
        color: accent ? "var(--accent)" : undefined,
      }}
    >
      {children}
    </td>
  );
}
