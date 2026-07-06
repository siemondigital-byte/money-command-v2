"use client";

import type { CSSProperties } from "react";
import { useTranslations } from "@/lib/i18n/provider";
import { MoneyAmount } from "./MoneyAmount";

// Número de la escala del termostato: prefijo de moneda chico (MoneyAmount) y
// tamaño que se achica con el ancho de la columna (cqi) y puede envolver, para
// que "COP 100,000" nunca se recorte dentro de la tarjeta (overflow: hidden).
const SCALE_NUM: CSSProperties = {
  fontFamily: "Syne, sans-serif",
  fontWeight: 800,
  fontSize: "clamp(0.9rem, 12cqi, 1.2rem)",
  letterSpacing: "-0.03em",
  lineHeight: 1.05,
  overflowWrap: "anywhere",
  minWidth: 0,
};

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
  const t = useTranslations().dashboard.thermostat;
  const hasTarget = target > 0;

  // Nivel del tubo: actual sobre la escala 0..target (tope 100%).
  const levelPct = hasTarget
    ? Math.min(100, Math.max(0, (current / target) * 100))
    : 0;

  return (
    <section
      className="d-card top-sky d-thermo"
      // .d-mid tiene align-items: stretch, así el termostato iguala la altura
      // de la Calculadora de Libertad en desktop (sin alignSelf:start que lo
      // dejaba compacto).
    >
      <div className="d-section-label">{t.label}</div>

      {!hasTarget ? (
        <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
          {t.noTargetPre}{" "}
          <a href="/settings#thermostat" style={{ color: "var(--accent-2)" }}>
            {t.settingsLink}
          </a>{" "}
          {t.noTargetSuf}
        </p>
      ) : (
        <div className="meter">
          {/* Ancho fijo que no se encoge (flexShrink:0 + minWidth). El ALTO lo
              define el CSS: sin height fija + align-self:stretch, el tubo estira
              al alto de la tarjeta (queda a la altura de los números). */}
          <div
            className="tube"
            style={{ flexShrink: 0, minWidth: "40px" }}
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
          <div className="scale" style={{ minWidth: 0, containerType: "inline-size" }}>
            <div>
              <div className="label">{t.target2y}</div>
              <div style={{ ...SCALE_NUM, color: "var(--gold)" }}>
                <MoneyAmount value={target} locale={locale} currency={currency} />
              </div>
            </div>
            <div>
              <div className="label">{t.todayAvg}</div>
              <div style={{ ...SCALE_NUM, color: "var(--accent-2)" }}>
                {hasHistory ? (
                  <MoneyAmount value={current} locale={locale} currency={currency} />
                ) : (
                  "—"
                )}
              </div>
            </div>
            <div>
              <div className="label">{reached ? t.stateReached : t.stateGap}</div>
              <div
                style={{
                  ...SCALE_NUM,
                  color: reached ? "var(--accent)" : "var(--text)",
                }}
              >
                {reached ? (
                  t.reachedValue
                ) : hasHistory ? (
                  <MoneyAmount value={gap} locale={locale} currency={currency} />
                ) : (
                  "—"
                )}
              </div>
              {!reached && hasHistory && gapPct > 0 && (
                <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "2px" }}>
                  +{gapPct.toFixed(0)}{t.overCurrentSuffix}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
