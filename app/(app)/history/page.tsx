import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeMonthlyRecord } from "@/lib/serialize";
import { HistoryEditForm } from "./HistoryEditForm";
import { DeleteRecordButton } from "./DeleteRecordButton";
import { GoToPeriodButton } from "./GoToPeriodButton";

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

      <AddMonthHint />

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
        <>
        {/* Desktop (>= md): tabla original, sin cambios. Oculta en móvil. */}
        <div
          className="card hidden md:block"
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
                        <GoToPeriodButton year={r.year} month={r.month} />
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

        {/* Móvil (< md): tarjetas apiladas. La tabla de arriba se oculta. */}
        <div className="md:hidden flex flex-col gap-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="card"
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {/* Mes + Ir al mes (acción ya existente, reusada) */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {SHORT_MONTHS[r.month - 1]} {r.year}
                </div>
                <GoToPeriodButton year={r.year} month={r.month} />
              </div>

              {/* Datos del mes, con etiquetas, sin desbordarse */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px 16px",
                }}
              >
                <Field
                  label="Ingresos"
                  value={money.format(r.incomeTotal)}
                  color="var(--accent)"
                />
                <Field label="Gastos" value={money.format(r.expenseTotal)} />
                <Field
                  label="Tasa ahorro"
                  value={pct.format(r.savingsRate / 100)}
                  color="var(--accent-2)"
                />
                <Field
                  label="Patrimonio"
                  value={money.format(r.netWorth)}
                  color="var(--gold)"
                />
              </div>

              {/* Acciones completas y alcanzables dentro de la card */}
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
                  href={`/history?edit=${r.id}#edit`}
                  style={{ color: "var(--accent-2)", fontSize: "13px" }}
                >
                  Editar
                </Link>
                <DeleteRecordButton
                  id={r.id}
                  label={`${SHORT_MONTHS[r.month - 1]} ${r.year}`}
                />
              </div>
            </div>
          ))}
        </div>
        </>
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

/**
 * Botón "+ Agregar mes" que GUÍA al usuario hacia el selector de PERÍODO del
 * header (donde un mes nuevo se crea solo al seleccionarlo). Usa <details>
 * nativo: es interactivo sin JS de cliente, así esta página sigue siendo un
 * Server Component. NO crea meses ni toca la consolidación; solo explica.
 */
function AddMonthHint() {
  return (
    <details>
      <summary
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          listStyle: "none",
          cursor: "pointer",
          width: "fit-content",
          background: "var(--surface-2)",
          color: "var(--accent)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "8px 14px",
          fontFamily: "DM Mono, monospace",
          fontSize: "13px",
          letterSpacing: "0.02em",
        }}
      >
        + Agregar mes
      </summary>
      <div
        style={{
          marginTop: "10px",
          maxWidth: "440px",
          padding: "12px 14px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          fontFamily: "DM Mono, monospace",
          fontSize: "12px",
          lineHeight: 1.6,
          color: "var(--muted)",
        }}
      >
        Para registrar un mes nuevo, elegilo arriba en{" "}
        <strong style={{ color: "var(--text)" }}>PERÍODO</strong> (mes y año), en
        la parte superior de la pantalla. El mes se crea solo al seleccionarlo, y
        después podés cargar sus ingresos, gastos e inversiones.
      </div>
    </details>
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

/** Par etiqueta/valor de la tarjeta de móvil. El valor envuelve si es largo
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
