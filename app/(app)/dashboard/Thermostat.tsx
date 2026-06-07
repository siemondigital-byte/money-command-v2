"use client";

import { formatMoney } from "@/lib/format";

/**
 * Termostato financiero: compara la temperatura ACTUAL (promedio del historial
 * de ingresos) con la DESEADA (meta de ingreso a 2 años de Settings).
 *
 * Recibe primitivas ya calculadas en el server (helper puro thermostat()).
 * Visual: barra tipo medidor con el punto actual y el punto de ajuste deseado.
 */
export function Thermostat({
  current,
  target,
  gap,
  gapPct,
  reached,
  hasHistory,
  locale,
  currency,
}: {
  current: number;
  target: number;
  gap: number;
  gapPct: number;
  reached: boolean;
  hasHistory: boolean;
  locale: string;
  currency: string;
}) {
  const money = (n: number) => formatMoney(n, locale, currency);
  const hasTarget = target > 0;

  // Posición del marcador "actual" sobre la escala 0..target (tope 100%).
  const currentPct = hasTarget
    ? Math.min(100, Math.max(0, (current / target) * 100))
    : 0;

  return (
    <section
      className="card"
      style={{ borderRadius: "16px", display: "flex", flexDirection: "column", gap: "16px" }}
    >
      <div className="label">Termostato financiero</div>

      {!hasTarget ? (
        <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>
          Configurá tu meta de ingreso a 2 años en{" "}
          <a href="/settings#thermostat" style={{ color: "var(--accent-2)" }}>
            Settings
          </a>{" "}
          para ver cuánta temperatura te falta.
        </p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "16px",
            }}
          >
            <div>
              <div className="label">Hoy (promedio)</div>
              <div className="kpi-medium" style={{ color: "var(--accent-2)", marginTop: 4 }}>
                {hasHistory ? money(current) : "—"}
              </div>
              <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: 2 }}>
                {hasHistory
                  ? "promedio de meses registrados"
                  : "registrá ingresos para calcularlo"}
              </p>
            </div>
            <div>
              <div className="label">Meta 2 años</div>
              <div className="kpi-medium" style={{ color: "var(--gold)", marginTop: 4 }}>
                {money(target)}
              </div>
              <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: 2 }}>
                temperatura deseada
              </p>
            </div>
            <div>
              <div className="label">{reached ? "Estado" : "Te falta"}</div>
              <div
                className="kpi-medium"
                style={{ color: reached ? "var(--accent)" : "var(--text)", marginTop: 4 }}
              >
                {reached ? "Meta alcanzada" : money(gap)}
              </div>
              {!reached && hasHistory && gapPct > 0 && (
                <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: 2 }}>
                  +{gapPct.toFixed(0)}% sobre tu actual
                </p>
              )}
            </div>
          </div>

          {/* Medidor: escala con marcador actual y punto de ajuste (meta) al 100% */}
          <div style={{ marginTop: "4px" }}>
            <div
              style={{
                position: "relative",
                height: "12px",
                borderRadius: "999px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  width: `${currentPct}%`,
                  background: reached
                    ? "var(--accent)"
                    : "linear-gradient(90deg, var(--accent-2), var(--gold))",
                  borderRadius: "999px",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "6px",
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--hint)",
              }}
            >
              <span>Actual</span>
              <span>Ajuste deseado</span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
