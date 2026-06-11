"use client";

import { useState, type CSSProperties } from "react";
import { formatMoney } from "@/lib/format";
import { MoneyAmount } from "./MoneyAmount";

// Cada tarjeta es un "contenedor de consulta" (container query). Así el tamaño
// del monto se mide contra el ancho de SU tarjeta (unidad cqi), no contra el
// viewport. Esto resuelve el conflicto móvil/escritorio: en móvil la tarjeta es
// ancha → número grande; en escritorio las 3 tarjetas son angostas → el número
// se achica solo lo necesario para entrar (US$ 2.437.863 sin partirse). Los
// montos quedan grandes y consistentes con el resto del Dashboard.
const CARD_CONTAINER: CSSProperties = { containerType: "inline-size" };

// El número más largo (US$ 2.437.863, Syne bold) mide ~8,5em de ancho. Para que
// entre con margen en cualquier ancho de tarjeta, el coeficiente cqi debe dejar
// ~15% de aire: 10cqi (10% del ancho de la tarjeta) → 8,5 × 0,10 = 0,85 → entra.
// En móvil la tarjeta es ancha y manda el TECHO del clamp (2.1rem / 1.9rem), por
// eso allí los montos quedan grandes igual que ahora. En escritorio/tablet, las
// tarjetas son más angostas y manda cqi, así el número se achica solo lo justo.
const HERO_AMOUNT: CSSProperties = {
  fontSize: "clamp(1.3rem, 11cqi, 2.2rem)",
  overflowWrap: "anywhere",
  minWidth: 0,
};
const AMOUNT: CSSProperties = {
  fontSize: "clamp(1.2rem, 10cqi, 2rem)",
  overflowWrap: "anywhere",
  minWidth: 0,
};

/**
 * Patrimonio / Inversiones (mockup 03). Tarjetas KPI + gráfico de barras
 * apiladas (capital aportado + retorno) año a año hasta el horizonte.
 *
 * Interactivo: al pasar el cursor (o tocar) una barra, el tooltip muestra el
 * cálculo de ese año — capital invertido y el retorno que está generando.
 * Reusa los cálculos de Investments (projectedValue, en el server); acá solo
 * presenta.
 */
type Point = {
  year: number;
  capital: number;
  interest: number;
  value: number;
};

export function PatrimonyBlock({
  horizon,
  balance,
  capital,
  interest,
  points,
  maxValue,
  hasAssets,
  locale,
  currency,
}: {
  horizon: number;
  balance: number;
  capital: number;
  interest: number;
  /** Monto real por año: capital aportado, retorno y total proyectado. */
  points: Point[];
  /** Valor máximo de la serie (último año), para escalar las alturas. */
  maxValue: number;
  hasAssets: boolean;
  locale: string;
  currency: string;
}) {
  const moneyShort = (n: number) =>
    formatMoney(n, locale, currency, { maxFractionDigits: 0 });

  const [active, setActive] = useState<number | null>(null);
  // Por defecto, el último año (así el tooltip siempre muestra algo coherente
  // con los KPIs de arriba). Al pasar el cursor por otra barra, se actualiza.
  const activeIdx =
    active !== null ? active : points.length > 0 ? points.length - 1 : 0;
  const ap = points[activeIdx];

  return (
    <section
      className="d-card top-mint"
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      <div className="d-section-label">
        Patrimonio · proyección a {horizon} años
      </div>

      {!hasAssets ? (
        <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>
          Cargá posiciones en{" "}
          <a href="/investments" style={{ color: "var(--accent-2)" }}>
            Inversiones
          </a>{" "}
          para ver crecer tu capital por interés compuesto.
        </p>
      ) : (
        <>
          {/* KPIs — tres columnas parejas (en vez de 2fr 1fr 1fr). En móvil
              apilan. Monto con fuente fluida (clamp) + overflowWrap. */}
          <div
            className="grid grid-cols-1 md:grid-cols-3"
            style={{ gap: "14px" }}
          >
            <div className="d-kpi hero mint top-mint" style={CARD_CONTAINER}>
              <div className="lab">Balance acumulado · {horizon}A</div>
              <div className="v" style={HERO_AMOUNT}>
                <MoneyAmount value={balance} locale={locale} currency={currency} />
              </div>
              <div className="ctx plain">Capital + retorno</div>
            </div>
            <div className="d-kpi sky top-sky" style={CARD_CONTAINER}>
              <div className="lab">Capital aportado</div>
              <div className="v" style={AMOUNT}>
                <MoneyAmount value={capital} locale={locale} currency={currency} />
              </div>
              <div className="ctx plain">depósito + aportes</div>
            </div>
            <div className="d-kpi mint top-gold" style={CARD_CONTAINER}>
              <div className="lab">Retorno generado</div>
              <div className="v" style={{ ...AMOUNT, color: "var(--gold)" }}>
                <MoneyAmount value={interest} locale={locale} currency={currency} />
              </div>
              <div className="ctx plain">crecimiento compuesto</div>
            </div>
          </div>

          {/* Leyenda */}
          <div className="d-legend">
            <span>
              <span className="sw" style={{ background: "var(--accent-2)" }} />
              Capital
            </span>
            <span>
              <span className="sw" style={{ background: "var(--accent)" }} />
              Retorno
            </span>
            <span style={{ color: "var(--hint)" }}>
              pasá el cursor o tocá una barra
            </span>
          </div>

          {/* Gráfico de barras apiladas Capital + Retorno (interactivo) */}
          <div>
            <div className="d-chart">
              {/* Tooltip dinámico del año activo */}
              {ap && (
                <div
                  style={{
                    position: "absolute",
                    top: 4,
                    left: 4,
                    zIndex: 2,
                    pointerEvents: "none",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "8px 10px",
                    minWidth: 158,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.45)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "DM Mono, monospace",
                      fontSize: 10,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                      paddingBottom: 6,
                      marginBottom: 6,
                      borderBottom: "1px dashed var(--border)",
                    }}
                  >
                    Año {ap.year}
                  </div>
                  <TooltipRow label="Capital invertido" value={moneyShort(ap.capital)} color="var(--accent-2)" />
                  <TooltipRow label="Retorno" value={moneyShort(ap.interest)} color="var(--accent)" />
                  <TooltipRow label="Total" value={moneyShort(ap.value)} color="var(--text)" bold />
                </div>
              )}

              {points.map((p, idx) => {
                const kH = (p.capital / maxValue) * 100;
                const iH = (p.interest / maxValue) * 100;
                const isActive = idx === activeIdx;
                return (
                  <div
                    className="col"
                    key={p.year}
                    onMouseEnter={() => setActive(idx)}
                    onMouseLeave={() => setActive(null)}
                    onClick={() => setActive(idx)}
                    style={{
                      cursor: "pointer",
                      borderRadius: 2,
                      background: isActive
                        ? "rgba(255,255,255,0.06)"
                        : undefined,
                    }}
                    aria-label={`Año ${p.year}: capital invertido ${moneyShort(
                      p.capital,
                    )}, retorno ${moneyShort(p.interest)}`}
                  >
                    <div
                      className="seg i"
                      style={{ height: `${iH}%`, opacity: isActive ? 1 : 0.82 }}
                    />
                    <div
                      className="seg k"
                      style={{ height: `${kH}%`, opacity: isActive ? 1 : 0.82 }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="d-chart-x">
              {points.map((p) => (
                <span key={p.year}>{p.year % 5 === 0 ? `${p.year}A` : ""}</span>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function TooltipRow({
  label,
  value,
  color,
  bold,
}: {
  label: string;
  value: string;
  color: string;
  bold?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 14,
        padding: "2px 0",
        fontFamily: "DM Mono, monospace",
        fontSize: 11,
      }}
    >
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span style={{ color, fontWeight: bold ? 600 : 400 }}>{value}</span>
    </div>
  );
}
