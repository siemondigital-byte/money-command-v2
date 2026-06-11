"use client";

import { formatMoney } from "@/lib/format";

/**
 * Termostato financiero VERTICAL y compacto (ANEXO REDISENO §2).
 *
 * Mide la temperatura ACTUAL (promedio del historial de ingresos) contra la
 * DESEADA (meta de ingreso a 2 años de Settings). Medidor tipo tubo vertical
 * con el nivel actual y la marca del ajuste deseado. Recibe primitivas ya
 * calculadas por el helper puro thermostat().
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
  const moneyShort = (n: number) =>
    formatMoney(n, locale, currency, { maxFractionDigits: 0 });
  const hasTarget = target > 0;

  // Nivel del tubo: actual sobre la escala 0..target (tope 100%).
  const levelPct = hasTarget
    ? Math.min(100, Math.max(0, (current / target) * 100))
    : 0;

  return (
    <section
      className="d-card top-sky d-thermo"
      // En desktop, .d-mid estira esta tarjeta para igualar a la Calculadora
      // (align-items: stretch). alignSelf:start evita ese estirado y mantiene
      // el termostato compacto, sin hueco bajo el tubo.
      style={{ alignSelf: "start" }}
    >
      <div className="d-section-label">Termostato</div>

      {!hasTarget ? (
        <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
          Configurá tu meta de ingreso a 2 años en{" "}
          <a href="/settings#thermostat" style={{ color: "var(--accent-2)" }}>
            Settings
          </a>{" "}
          para medir tu temperatura.
        </p>
      ) : (
        <div className="meter">
          {/* El tubo tiene ancho fijo (26px) y NO se puede encoger: flexShrink:0
              + minWidth evitan que, en la columna angosta de escritorio, el
              flexbox lo aplaste a ~1px para dejarle lugar al monto de la escala.
              Height fija para conservar su forma de tubo en todas las vistas. */}
          <div
            className="tube"
            style={{ height: "200px", flexShrink: 0, minWidth: "26px" }}
          >
            <div
              className="level"
              style={{
                height: `${levelPct}%`,
                background: reached
                  ? "var(--accent)"
                  : "linear-gradient(0deg, var(--accent-2), var(--gold))",
              }}
            />
            {/* marca de ajuste deseado al tope (100% = meta) */}
            <div className="tgt" style={{ bottom: "calc(100% - 2px)" }} />
          </div>
          <div className="scale" style={{ minWidth: 0 }}>
            <div>
              <div className="label">Meta 2 años</div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "var(--gold)" }}>
                {moneyShort(target)}
              </div>
            </div>
            <div>
              <div className="label">Hoy (prom.)</div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "var(--accent-2)" }}>
                {hasHistory ? moneyShort(current) : "—"}
              </div>
            </div>
            <div>
              <div className="label">{reached ? "Estado" : "Te falta"}</div>
              <div
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 800,
                  fontSize: "1rem",
                  color: reached ? "var(--accent)" : "var(--text)",
                }}
              >
                {reached ? "Alcanzada" : hasHistory ? money(gap) : "—"}
              </div>
              {!reached && hasHistory && gapPct > 0 && (
                <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "2px" }}>
                  +{gapPct.toFixed(0)}% sobre tu actual
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
