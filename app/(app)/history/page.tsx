import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeMonthlyRecord } from "@/lib/serialize";
import { setActivePeriodAction } from "@/app/(app)/_actions/period";
import { HistoryEditForm } from "./HistoryEditForm";
import { DeleteRecordButton } from "./DeleteRecordButton";

export const metadata = { title: "Historial · The Money Command" };

const SHORT_MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { user, profile } = await requireUser();
  const params = await searchParams;

  const records = await prisma.monthlyRecord.findMany({
    where: { userId: user.id },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });
  const rows = records.map(serializeMonthlyRecord);

  const editing = params.edit
    ? (rows.find((r) => r.id === params.edit) ?? null)
    : null;

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

  return (
    <div className="fade-up flex flex-col gap-6">
      <header>
        <div className="label mb-1">Historial</div>
        <h1>Tus meses registrados</h1>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "13px",
            marginTop: "8px",
          }}
        >
          {rows.length === 0
            ? "Todavía no registraste ningún mes."
            : `${rows.length} mes${rows.length === 1 ? "" : "es"} en tu historial.`}
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="card">
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            Empezá registrando tu primer mes en{" "}
            <Link href="/income" style={{ color: "var(--accent)" }}>
              /income
            </Link>
            .
          </p>
        </div>
      ) : (
        <div
          className="card"
          style={{ padding: 0, overflow: "hidden" }}
        >
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
                  <Th>Mes</Th>
                  <Th align="right">Ingresos</Th>
                  <Th align="right">Gastos</Th>
                  <Th align="right">Tasa ahorro</Th>
                  <Th align="right">Patrimonio</Th>
                  <Th align="right">Acción</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom:
                        idx === rows.length - 1
                          ? "none"
                          : "1px solid var(--border)",
                    }}
                  >
                    <Td>
                      {SHORT_MONTHS[r.month - 1]} {r.year}
                    </Td>
                    <Td align="right">{money.format(r.incomeTotal)}</Td>
                    <Td align="right">{money.format(r.expenseTotal)}</Td>
                    <Td align="right">{pct.format(r.savingsRate / 100)}</Td>
                    <Td align="right">{money.format(r.netWorth)}</Td>
                    <Td align="right">
                      <div
                        style={{
                          display: "inline-flex",
                          gap: "12px",
                          alignItems: "center",
                        }}
                      >
                        <form action={setActivePeriodAction}>
                          <input type="hidden" name="year" value={r.year} />
                          <input type="hidden" name="month" value={r.month} />
                          <input type="hidden" name="next" value="/income" />
                          <button
                            type="submit"
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "var(--accent)",
                              fontSize: "12px",
                              cursor: "pointer",
                              fontFamily: "DM Mono, monospace",
                              padding: 0,
                            }}
                          >
                            Ir al mes
                          </button>
                        </form>
                        <Link
                          href={`/history?edit=${r.id}#edit`}
                          style={{ color: "var(--accent-2)", fontSize: "12px" }}
                        >
                          Editar
                        </Link>
                        <DeleteRecordButton
                          id={r.id}
                          label={`${SHORT_MONTHS[r.month - 1]} ${r.year}`}
                        />
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && (
        <section id="edit" className="card">
          <div className="label" style={{ marginBottom: "12px" }}>
            Editar {SHORT_MONTHS[editing.month - 1]} {editing.year}
          </div>
          <HistoryEditForm record={editing} onDoneHref="/history" />
        </section>
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
        padding: "12px 16px",
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
        padding: "12px 16px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </td>
  );
}
