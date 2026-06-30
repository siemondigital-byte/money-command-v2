"use client";

import { useState, type CSSProperties } from "react";
import { formatMoneyShort } from "@/lib/format";
import { distributionAmounts, type BasketDistribution } from "@/lib/dashboard";
import { MoneyAmount } from "./MoneyAmount";

// Monto de la tarjeta KPI: fuente fluida (clamp) que achica el número cuando es
// largo + overflowWrap, para que NUNCA se corte ni desborde su tarjeta. La hero
// (Ingreso del mes) queda apenas más grande.
const HERO_AMOUNT: CSSProperties = {
  fontSize: "clamp(1.2rem, 4.2vw, 2rem)",
  overflowWrap: "anywhere",
  minWidth: 0,
};
const AMOUNT: CSSProperties = {
  fontSize: "clamp(1.05rem, 3.6vw, 1.7rem)",
  overflowWrap: "anywhere",
  minWidth: 0,
};

/**
 * PANEL DEL MÉTODO (mockup 01 · Asignación del mes).
 *
 * Arriba: tarjetas KPI con números destacados y borde de color (Ingreso verde,
 * Gastado cian, Invertido dorado). Abajo: las TRES barras de distribución
 * (Esenciales/Estilo/Libertad) con su target marcado, movibles para simular,
 * con presets y texto de brecha. Es SIMULACIÓN: no toca gastos reales.
 */

type BasketKey = keyof BasketDistribution;

const BASKET_META: { key: BasketKey; label: string; tone: "sky" | "gold" | "mint" }[] = [
  { key: "essentials", label: "Esenciales", tone: "sky" },
  { key: "style", label: "Estilo", tone: "gold" },
  { key: "freedom", label: "Libertad", tone: "mint" },
];

const PRESETS: { label: string; dist: BasketDistribution }[] = [
  { label: "50/30/20", dist: { essentials: 50, style: 30, freedom: 20 } },
  { label: "50/25/25", dist: { essentials: 50, style: 25, freedom: 25 } },
  { label: "50/20/30", dist: { essentials: 50, style: 20, freedom: 30 } },
  { label: "40/20/40", dist: { essentials: 40, style: 20, freedom: 40 } },
];

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function MethodPanel({
  income,
  gastado,
  invertido,
  realDist,
  initialDist,
  targetDist,
  unassignedAmount,
  unassignedPct,
  locale,
  currency,
}: {
  income: number;
  gastado: number;
  invertido: number;
  realDist: BasketDistribution;
  initialDist: BasketDistribution;
  /** Target por canasta desde el método de Settings (para el marcador). */
  targetDist: BasketDistribution;
  /** Sin asignar (ingreso − gastos − aporte inversión). Puede ser negativo. */
  unassignedAmount: number;
  /** Sin asignar como % del ingreso. */
  unassignedPct: number;
  locale: string;
  currency: string;
}) {
  const money = (n: number) => formatMoneyShort(n, locale, currency);
  const moneyShort = (n: number) => formatMoneyShort(n, locale, currency);

  // Sin redondear el valor inicial: así el monto (income × %) cae exacto sobre el
  // real de la canasta al cargar (ej. US$ 3.500), sin arrastre de redondeo. La UI
  // muestra el % redondeado igual.
  const [dist, setDist] = useState<BasketDistribution>({
    essentials: initialDist.essentials,
    style: initialDist.style,
    freedom: initialDist.freedom,
  });

  const amounts = distributionAmounts(income, dist);
  const targetAmounts = distributionAmounts(income, targetDist);

  // Cada canasta es un % del ingreso y se mueve independiente. Lo que no se
  // asigna queda como "sin asignar" (no se fuerza a que las tres sumen 100). La
  // simulación sigue igual: arrastrás una barra y ves su % y su monto.
  function handleChange(key: BasketKey, raw: number) {
    const value = Math.min(100, Math.max(0, raw));
    setDist({ ...dist, [key]: round1(value) });
  }

  const realFreedom = round1(realDist.freedom);
  const simFreedom = round1(dist.freedom);
  const hasReal = realDist.essentials + realDist.style + realDist.freedom > 0;
  const diffPct = round1(simFreedom - realFreedom);
  const diffAmount = income > 0 ? Math.abs((diffPct / 100) * income) : 0;

  return (
    <section className="d-card top-mint" style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <div className="d-section-label">Asignación del mes</div>

      {/* KPIs — tres columnas parejas (en vez de 2fr 1fr 1fr). En móvil apilan.
          El monto usa fuente fluida (clamp) + overflowWrap para no cortarse. */}
      <div
        className="grid grid-cols-1 md:grid-cols-4"
        style={{ gap: "14px" }}
      >
        <div className="d-kpi hero mint top-mint">
          <div className="lab">Ingreso del mes</div>
          <div className="v" style={HERO_AMOUNT}>
            <MoneyAmount value={income} locale={locale} currency={currency} />
          </div>
          <div className="ctx plain">Plan A + B + C</div>
        </div>
        <div className="d-kpi sky top-sky">
          <div className="lab">Gastado</div>
          <div className="v" style={AMOUNT}>
            <MoneyAmount value={gastado} locale={locale} currency={currency} />
          </div>
          <div className="ctx plain">Esenciales + Estilo</div>
        </div>
        <div className="d-kpi gold top-gold">
          <div className="lab">Invertido</div>
          <div className="v" style={AMOUNT}>
            <MoneyAmount value={invertido} locale={locale} currency={currency} />
          </div>
          <div className="ctx plain">aporte mensual a inversión</div>
        </div>
        <div className="d-kpi coral top-coral">
          <div className="lab">Sin asignar</div>
          <div className="v" style={AMOUNT}>
            <MoneyAmount value={unassignedAmount} locale={locale} currency={currency} />
          </div>
          <div className="ctx plain">{unassignedPct.toFixed(0)}% del ingreso</div>
        </div>
      </div>

      {/* Presets */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {PRESETS.map((p) => {
          const active =
            round1(dist.essentials) === p.dist.essentials &&
            round1(dist.style) === p.dist.style &&
            round1(dist.freedom) === p.dist.freedom;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => setDist({ ...p.dist })}
              style={{
                background: active ? "var(--accent)" : "var(--surface-2)",
                color: active ? "var(--bg)" : "var(--text)",
                border: "1px solid var(--border)",
                borderRadius: "100px",
                padding: "6px 14px",
                fontFamily: "DM Mono, monospace",
                fontSize: "11px",
                letterSpacing: "0.05em",
                cursor: "pointer",
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Barras */}
      <div className="d-bars">
        {BASKET_META.map((b) => {
          const pct = dist[b.key];
          const tgt = round1(targetDist[b.key]);
          return (
            <div key={b.key} className={`d-bar ${b.tone}`}>
              <div className="blabel">
                <span className="cat">{b.label}</span>
                <span className="target">
                  Target {tgt.toFixed(0)}% · {moneyShort(targetAmounts[b.key])}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div className="track">
                  <div className={`fill ${b.tone}`} style={{ width: `${pct}%` }} />
                  <div className="marker" style={{ left: `${tgt}%` }} />
                </div>
                <input
                  type="range"
                  className={`d-range ${b.tone}`}
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(pct)}
                  onChange={(e) => handleChange(b.key, Number(e.target.value))}
                  aria-label={`Ajustar ${b.label}`}
                />
              </div>
              <div className="pct">
                {pct.toFixed(0)}%<span className="amt">{moneyShort(amounts[b.key])}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Texto de brecha */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "14px",
          fontSize: "12px",
          color: "var(--muted)",
          lineHeight: 1.6,
        }}
      >
        {!hasReal ? (
          <span>
            Todavía no hay egresos cargados para comparar. Estás viendo el preset
            de tu método preferido.
          </span>
        ) : diffPct > 0 ? (
          <span>
            Hoy destinás <strong style={{ color: "var(--text)" }}>{realFreedom.toFixed(0)}%</strong> a
            Libertad. Para llegar a{" "}
            <strong style={{ color: "var(--accent)" }}>{simFreedom.toFixed(0)}%</strong> tendrías que
            redirigir {money(diffAmount)} al mes desde Esenciales y Estilo.
          </span>
        ) : diffPct < 0 ? (
          <span>
            En este escenario destinás{" "}
            <strong style={{ color: "var(--text)" }}>{simFreedom.toFixed(0)}%</strong> a Libertad,{" "}
            {Math.abs(diffPct).toFixed(0)}% menos que hoy ({realFreedom.toFixed(0)}%).
          </span>
        ) : (
          <span>
            Este escenario coincide con tu distribución real ({realFreedom.toFixed(0)}% a Libertad).
          </span>
        )}
      </div>
    </section>
  );
}
