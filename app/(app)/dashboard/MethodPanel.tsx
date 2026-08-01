"use client";

import { useState, type CSSProperties } from "react";
import { formatMoneyShort } from "@/lib/format";
import { distributionAmounts, type BasketDistribution } from "@/lib/dashboard";
import { useTranslations } from "@/lib/i18n/provider";
import { MoneyAmount } from "./MoneyAmount";

// Cada tarjeta es un "contenedor de consulta" (container query): el tamaño del
// monto se mide contra el ancho de SU tarjeta (unidad cqi), no contra el viewport.
// Mismo sistema que el bloque de Proyección (PatrimonyBlock) para que ambos se
// vean igual de grandes. En móvil la tarjeta es ancha y manda el TECHO del clamp
// (1.7rem / 1.5rem); en desktop las 4 columnas son angostas y manda cqi, así el
// número se achica solo lo justo para no cortarse.
const CARD_CONTAINER: CSSProperties = { containerType: "inline-size" };
const HERO_AMOUNT: CSSProperties = {
  fontSize: "clamp(1.1rem, 9cqi, 1.7rem)",
  overflowWrap: "anywhere",
  minWidth: 0,
};
const AMOUNT: CSSProperties = {
  fontSize: "clamp(1rem, 8cqi, 1.5rem)",
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

// La etiqueta de cada canasta se resuelve por locale (t.labels.baskets).
const BASKET_META: { key: BasketKey; tone: "sky" | "gold" | "mint" }[] = [
  { key: "essentials", tone: "sky" },
  { key: "style", tone: "gold" },
  { key: "freedom", tone: "mint" },
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
  const dict = useTranslations();
  const t = dict.dashboard.method;
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
      <div className="d-section-label">{t.title}</div>

      {/* KPIs — tres columnas parejas (en vez de 2fr 1fr 1fr). En móvil apilan.
          El monto usa fuente fluida (clamp) + overflowWrap para no cortarse. */}
      <div
        className="grid grid-cols-1 md:grid-cols-4"
        style={{ gap: "14px" }}
      >
        <div className="d-kpi hero mint top-mint" style={CARD_CONTAINER}>
          <div className="lab">{t.kpiIncome}</div>
          <div className="v" style={HERO_AMOUNT}>
            <MoneyAmount value={income} locale={locale} currency={currency} />
          </div>
          <div className="ctx plain">{t.kpiIncomeCtx}</div>
        </div>
        <div className="d-kpi sky top-sky" style={CARD_CONTAINER}>
          <div className="lab">{t.kpiSpent}</div>
          <div className="v" style={AMOUNT}>
            <MoneyAmount value={gastado} locale={locale} currency={currency} />
          </div>
          <div className="ctx plain">{t.kpiSpentCtx}</div>
        </div>
        <div className="d-kpi gold top-gold" style={CARD_CONTAINER}>
          <div className="lab">{t.kpiInvested}</div>
          <div className="v" style={AMOUNT}>
            <MoneyAmount value={invertido} locale={locale} currency={currency} />
          </div>
          <div className="ctx plain">{t.kpiInvestedCtx}</div>
        </div>
        <div className="d-kpi coral top-coral" style={CARD_CONTAINER}>
          <div className="lab">{t.kpiUnassigned}</div>
          <div className="v" style={AMOUNT}>
            <MoneyAmount value={unassignedAmount} locale={locale} currency={currency} />
          </div>
          <div className="ctx plain">{unassignedPct.toFixed(0)}{t.ofIncome}</div>
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
                <span className="cat">{dict.labels.baskets[b.key]}</span>
                <span className="target">
                  {t.targetPrefix} {tgt.toFixed(0)}% · {moneyShort(targetAmounts[b.key])}
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
                  aria-label={`${t.ariaAdjust} ${dict.labels.baskets[b.key]}`}
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
          <span>{t.gapNoReal}</span>
        ) : diffPct > 0 ? (
          <span>
            {t.gapMore1}{" "}
            <strong style={{ color: "var(--text)" }}>{realFreedom.toFixed(0)}%</strong>{" "}
            {t.gapMore2}{" "}
            <strong style={{ color: "var(--accent)" }}>{simFreedom.toFixed(0)}%</strong>{" "}
            {t.gapMore3} {money(diffAmount)} {t.gapMore4}
          </span>
        ) : diffPct < 0 ? (
          <span>
            {t.gapLess1}{" "}
            <strong style={{ color: "var(--text)" }}>{simFreedom.toFixed(0)}%</strong> {t.gapLess2}{" "}
            {Math.abs(diffPct).toFixed(0)}% {t.gapLess3} ({realFreedom.toFixed(0)}%).
          </span>
        ) : (
          <span>
            {t.gapEqual1} ({realFreedom.toFixed(0)}% {t.gapEqualFreedom}).
          </span>
        )}
      </div>
    </section>
  );
}
