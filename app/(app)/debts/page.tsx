import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeDebt, type SerializedDebt } from "@/lib/serialize";
import { activePeriod, getMonthlyRecord, periodToString } from "@/lib/monthly";
import {
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
import { getDict } from "@/lib/i18n";
import { getServerDict } from "@/lib/i18n/server";
import { DebtForm } from "./DebtForm";
import { DebtProjectionChart } from "./DebtProjectionChart";
import { deleteDebtAction, confirmDebtPaymentsAction } from "./actions";

export async function generateMetadata() {
  return { title: (await getServerDict()).metadata.debts };
}

export default async function DebtsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { user, profile } = await requireUser();
  const dict = getDict(profile.locale);
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
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
  const pct = new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 0,
  });

  return (
    <div className="fade-up flex flex-col gap-6">
      <header>
        <div className="label mb-1">{dict.debts.headerLabel}</div>
        <h1>{dict.debts.title}</h1>
        <p style={{ color: "var(--muted)", fontSize: "13px", marginTop: "8px" }}>
          {dict.debts.intro}
        </p>
        {monthlyRecord && (
          <p style={{ fontSize: "11px", color: "var(--hint)", marginTop: "6px" }}>
            {dict.debts.consolidatedPre} {periodToString(period)} ·{" "}
            {dict.debts.consolidatedTotal}{" "}
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
              {dict.debts.confirmPre} {dict.labels.months[period.month - 1]}
              {dict.debts.confirmSuf}
            </div>
            <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
              {dict.debts.confirmNote}
            </p>
          </div>
          <form action={confirmDebtPaymentsAction}>
            <button type="submit" className="btn-primary">
              {dict.debts.confirmButton}
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
          label={dict.debts.kpiTotalDebt}
          value={money.format(totalBalance)}
          sub={`${debts.length} ${debts.length === 1 ? dict.debts.debtSingular : dict.debts.debtPlural}`}
        />
        <Kpi
          label={dict.debts.kpiMonthlyPayment}
          value={money.format(monthlyPayment)}
          sub={income > 0 ? `${pct.format(paymentShare)} ${dict.debts.ofYourIncome}` : dict.debts.registerIncome}
        />
        <Kpi
          label={dict.debts.kpiWeightedApr}
          value={pct.format(wApr / 100)}
          sub={dict.debts.weightedAprSub}
        />
        <Kpi
          label={dict.debts.kpiDebtToIncome}
          value={pct.format(ratio)}
          sub={dict.debts.debtToIncomeSub}
          valueColor={income > 0 ? ratioColor : "var(--muted)"}
        />
        <Kpi
          label={dict.debts.kpiDebtFree}
          value={
            debts.length === 0
              ? "—"
              : recommended.converges
                ? `${recommended.months} ${recommended.months === 1 ? dict.debts.monthSingular : dict.debts.monthPlural}`
                : dict.debts.notConverge
          }
          sub={
            debts.length === 0
              ? dict.debts.noDebts
              : recommended.converges
                ? dict.debts.avalancheStrategyShort
                : dict.debts.paymentNotCoverInterest
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
          <div className="label">{dict.debts.consumptionDebt}</div>
          <div className="kpi-medium" style={{ marginTop: "4px", color: "var(--gold)" }}>
            {money.format(split.consumption)}
          </div>
          <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: 2 }}>
            {dict.debts.consumptionDebtNote}
          </p>
        </div>
        <div>
          <div className="label">{dict.debts.investmentDebt}</div>
          <div className="kpi-medium" style={{ marginTop: "4px", color: "var(--accent-2)" }}>
            {money.format(split.investment)}
          </div>
          <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: 2 }}>
            {dict.debts.investmentDebtNote}
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
                  <Th>{dict.debts.colName}</Th>
                  <Th>{dict.debts.colType}</Th>
                  <Th>{dict.debts.colLabel}</Th>
                  <Th align="right">{dict.debts.colBalance}</Th>
                  <Th align="right">{dict.debts.colApr}</Th>
                  <Th align="right">{dict.debts.colMinPayment}</Th>
                  <Th align="right">{dict.debts.colRealPayment}</Th>
                  <Th align="right">{dict.debts.colInstallments}</Th>
                  <Th align="right">{dict.debts.colAction}</Th>
                </tr>
              </thead>
              <tbody>
                {debts.map((d) => (
                  <tr key={d.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <Td>{d.name}</Td>
                    <Td>{dict.labels.debtTypes[d.type as DebtType] ?? d.type}</Td>
                    <Td>{dict.labels.debtPurposes[d.purpose as DebtPurpose] ?? d.purpose}</Td>
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
                          {dict.debts.edit}
                        </Link>
                        <DeleteButton id={d.id} label={dict.debts.delete} />
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
          <div className="label">{dict.debts.strategyTitle}</div>
          <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
            {dict.debts.strategyIntro}
          </p>
        </div>

        {debts.length === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--hint)" }}>
            {dict.debts.strategyEmpty}
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
                title={dict.debts.avalanche}
                recommended
                desc={dict.debts.avalancheDesc}
                result={comparison.avalanche}
                money={money}
                dict={dict}
              />
              <StrategyCard
                title={dict.debts.snowball}
                desc={dict.debts.snowballDesc}
                result={comparison.snowball}
                money={money}
                dict={dict}
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
                  {dict.debts.savesPre}{" "}
                  <span style={{ color: "var(--accent)" }}>
                    {money.format(comparison.interestSaved)}
                  </span>{" "}
                  {dict.debts.savesSuf}
                </p>
              )}
          </>
        )}
      </section>

      {/* CAPA 2 — Proyección de reducción de deuda */}
      <section className="card flex flex-col gap-3">
        <div className="label">{dict.debts.projectionTitle}</div>
        {debts.length === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--hint)" }}>
            {dict.debts.projectionEmpty}
          </p>
        ) : !recommended.converges ? (
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            {dict.debts.projectionNotConverge}
          </p>
        ) : (
          <>
            <p style={{ fontSize: "12px", color: "var(--muted)" }}>
              {dict.debts.projectionCaptionPre} {recommended.months}{" "}
              {recommended.months === 1 ? dict.debts.monthSingular : dict.debts.monthPlural}
              {dict.debts.projectionCaptionSuf}
            </p>
            <DebtProjectionChart
              schedule={recommended.schedule}
              locale={profile.locale}
              currency={profile.currency}
              todayLabel={dict.debts.chartToday}
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
  dict,
}: {
  title: string;
  desc: string;
  result: PayoffResult;
  money: Intl.NumberFormat;
  recommended?: boolean;
  dict: ReturnType<typeof getDict>;
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
            {dict.debts.recommended}
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
          label={dict.debts.freeIn}
          value={
            result.converges
              ? `${result.months} ${result.months === 1 ? dict.debts.monthSingular : dict.debts.monthPlural}`
              : dict.debts.notConverge
          }
        />
        <StrategyStat
          label={dict.debts.totalInterest}
          value={result.converges ? money.format(result.totalInterest) : "—"}
        />
        <StrategyStat label={dict.debts.startsWith} value={startsWith} />
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

function DeleteButton({ id, label }: { id: string; label: string }) {
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
        {label}
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
