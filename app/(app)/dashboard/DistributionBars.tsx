"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";
import { distributionAmounts, type BasketDistribution } from "@/lib/dashboard";

/**
 * Distribución por canastas con BARRAS movibles + presets (ANEXO §4).
 *
 * Precargadas con la distribución REAL del usuario. Al mover una barra, las
 * otras dos se reajustan para mantener el total en 100%. Es SIMULACIÓN: no
 * toca gastos reales ni la consolidación. El texto de brecha se recalcula al
 * mover.
 */

type BasketKey = keyof BasketDistribution;

const BASKET_META: { key: BasketKey; label: string; color: string }[] = [
  { key: "essentials", label: "Esenciales", color: "#4dd9ff" },
  { key: "style", label: "Estilo", color: "#ffd166" },
  { key: "freedom", label: "Libertad", color: "#7fffb2" },
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

export function DistributionBars({
  income,
  realDist,
  initialDist,
  locale,
  currency,
}: {
  income: number;
  /** Distribución real (para comparar contra la simulación). */
  realDist: BasketDistribution;
  /** Distribución inicial de las barras (real si hay datos, si no el preset). */
  initialDist: BasketDistribution;
  locale: string;
  currency: string;
}) {
  const [dist, setDist] = useState<BasketDistribution>({
    essentials: round1(initialDist.essentials),
    style: round1(initialDist.style),
    freedom: round1(initialDist.freedom),
  });

  const money = (n: number) => formatMoney(n, locale, currency);
  const amounts = distributionAmounts(income, dist);

  function handleChange(key: BasketKey, raw: number) {
    const value = Math.min(100, Math.max(0, raw));
    const others = BASKET_META.map((b) => b.key).filter((k) => k !== key);
    const remaining = 100 - value;
    const [a, b] = others as [BasketKey, BasketKey];
    const sumOthers = dist[a] + dist[b];

    let next: BasketDistribution;
    if (sumOthers <= 0) {
      // Si las otras estaban en 0, repartir el resto en partes iguales.
      next = { ...dist, [key]: value, [a]: remaining / 2, [b]: remaining / 2 };
    } else {
      next = {
        ...dist,
        [key]: value,
        [a]: (dist[a] / sumOthers) * remaining,
        [b]: (dist[b] / sumOthers) * remaining,
      };
    }
    setDist({
      essentials: round1(next.essentials),
      style: round1(next.style),
      freedom: round1(next.freedom),
    });
  }

  function applyPreset(preset: BasketDistribution) {
    setDist({ ...preset });
  }

  // Texto de brecha sobre Libertad (la canasta que importa para el avance).
  const realFreedom = round1(realDist.freedom);
  const simFreedom = round1(dist.freedom);
  const hasReal = realDist.essentials + realDist.style + realDist.freedom > 0;
  const diffPct = round1(simFreedom - realFreedom);
  const diffAmount =
    income > 0 ? Math.abs((diffPct / 100) * income) : 0;

  return (
    <section
      className="card"
      style={{ borderRadius: "16px", display: "flex", flexDirection: "column", gap: "18px" }}
    >
      <div>
        <div className="label">Distribución por canastas (simulación)</div>
        <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "6px" }}>
          Mové las barras para simular escenarios. Es una proyección: no cambia
          tus gastos reales. Esenciales menos, Libertad más.
        </p>
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
              onClick={() => applyPreset(p.dist)}
              style={{
                background: active ? "var(--accent)" : "var(--surface-2)",
                color: active ? "var(--bg)" : "var(--text)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "6px 12px",
                fontFamily: "DM Mono, monospace",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Barras */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {BASKET_META.map((b) => {
          const pct = dist[b.key];
          return (
            <div key={b.key} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  fontSize: "13px",
                }}
              >
                <span style={{ color: "var(--text)" }}>{b.label}</span>
                <span style={{ color: "var(--muted)", fontSize: "12px" }}>
                  {pct.toFixed(0)}% · {money(amounts[b.key])}
                </span>
              </div>
              <div
                style={{
                  position: "relative",
                  height: "10px",
                  borderRadius: "999px",
                  background: "var(--surface-2)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: `${pct}%`,
                    background: b.color,
                    borderRadius: "999px",
                  }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(pct)}
                onChange={(e) => handleChange(b.key, Number(e.target.value))}
                aria-label={`Ajustar ${b.label}`}
                style={{ width: "100%", accentColor: b.color, cursor: "pointer" }}
              />
            </div>
          );
        })}
      </div>

      {/* Texto de brecha */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "12px",
          fontSize: "13px",
          color: "var(--muted)",
          lineHeight: 1.5,
        }}
      >
        {!hasReal ? (
          <span>
            Todavía no hay gastos cargados para comparar. Estás viendo el preset
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
            Este escenario coincide con tu distribución real ({realFreedom.toFixed(0)}% a
            Libertad).
          </span>
        )}
      </div>
    </section>
  );
}
