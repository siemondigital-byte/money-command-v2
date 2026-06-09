import type { Scorecard as ScorecardData } from "@/lib/coach";

/**
 * Presentación del Scorecard de salud financiera. Componente sin estado: recibe
 * el objeto ya calculado por lib/coach.ts (solo lectura). Responsive: las barras
 * son full-width y las filas apilan en móvil.
 */

/** Color de la barra/puntaje según el valor (verde alto, dorado medio, coral bajo). */
function scoreColor(score: number): string {
  if (score >= 70) return "var(--accent)";
  if (score >= 40) return "var(--gold)";
  return "var(--danger)";
}

export function Scorecard({ scorecard }: { scorecard: ScorecardData }) {
  const { metrics, total, rangeLabel, priorityMessage } = scorecard;
  const totalColor = scoreColor(total);

  return (
    <div className="flex flex-col gap-6">
      {/* Total + prioridad */}
      <section
        className="card"
        style={{ display: "flex", flexDirection: "column", gap: "14px" }}
      >
        <div className="label">Salud financiera</div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <span
            className="kpi-large"
            style={{ color: totalColor, lineHeight: 1 }}
          >
            {total}
          </span>
          <span style={{ fontSize: "13px", color: "var(--muted)" }}>/ 100</span>
          <span
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: "1.05rem",
              color: "var(--text)",
            }}
          >
            {rangeLabel}
          </span>
        </div>

        {/* Barra total */}
        <div
          style={{
            height: 10,
            background: "var(--surface-2)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${total}%`,
              height: "100%",
              background: totalColor,
              borderRadius: 999,
            }}
          />
        </div>

        <p
          style={{
            fontSize: "13px",
            color: "var(--muted)",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {priorityMessage}
        </p>
      </section>

      {/* Las 5 métricas */}
      <section
        className="card"
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        <div className="label">Las 5 métricas</div>

        {metrics.map((m) => {
          const color = scoreColor(m.score);
          return (
            <div
              key={m.key}
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "12px",
                }}
              >
                <span
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "var(--text)",
                  }}
                >
                  {m.label}
                </span>
                <span
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    color,
                    whiteSpace: "nowrap",
                  }}
                >
                  {m.score}
                </span>
              </div>

              <div
                style={{
                  height: 8,
                  background: "var(--surface-2)",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${m.score}%`,
                    height: "100%",
                    background: color,
                    borderRadius: 999,
                  }}
                />
              </div>

              <p
                style={{
                  fontSize: "12px",
                  color: "var(--muted)",
                  margin: 0,
                  overflowWrap: "anywhere",
                }}
              >
                {m.subtitle}
              </p>
            </div>
          );
        })}
      </section>
    </div>
  );
}
