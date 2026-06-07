"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";
import {
  freedomNumber,
  freedomProgress,
  yearsToFreedom,
} from "@/lib/dashboard";

/**
 * Libertad Financiera: UNA sola medición, tasa ajustable (ANEXO §6).
 *
 * El Número de Libertad mide cuánto CAPITAL necesitás invertido para que su
 * retorno pasivo cubra tus gastos. El único control editable es la TASA; el
 * resto (gasto, portafolio, aporte) se LEE. Al mover la tasa, los años y el
 * número se recalculan.
 *
 * Default de la tasa: rendimiento ponderado real del portafolio (si hay), o 8%.
 */
export function FreedomBlock({
  monthlyExpense,
  portfolio,
  monthlyContribution,
  passiveIncome,
  defaultRatePct,
  locale,
  currency,
}: {
  monthlyExpense: number;
  portfolio: number;
  monthlyContribution: number;
  passiveIncome: number;
  /** Tasa default en % (ej. 8 o el weightedYield × 100). */
  defaultRatePct: number;
  locale: string;
  currency: string;
}) {
  const [ratePct, setRatePct] = useState<number>(
    Math.round(defaultRatePct * 100) / 100,
  );

  const money = (n: number) => formatMoney(n, locale, currency);
  const rate = ratePct / 100;

  const nlf = freedomNumber(monthlyExpense, rate);
  const years = yearsToFreedom(portfolio, monthlyContribution, rate, nlf);
  const progress = freedomProgress(portfolio, nlf);

  const hasExpense = monthlyExpense > 0;

  return (
    <section
      className="card"
      style={{ borderRadius: "16px", display: "flex", flexDirection: "column", gap: "18px" }}
    >
      <div>
        <div className="label">Libertad financiera</div>
        <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "6px" }}>
          El capital que necesitás invertido para que su retorno pasivo cubra tus
          gastos actuales. El capital queda intacto: vivís de los flujos.
        </p>
      </div>

      {/* Control de tasa */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <label
          className="label"
          htmlFor="freedom-rate"
          style={{ marginBottom: 0 }}
        >
          Tasa de rendimiento
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            id="freedom-rate"
            type="number"
            min={0.1}
            max={30}
            step={0.1}
            value={ratePct}
            onChange={(e) => {
              const v = Number(e.target.value);
              setRatePct(Number.isFinite(v) ? v : 0);
            }}
            style={{
              width: "80px",
              background: "var(--surface-2)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "6px 10px",
              fontFamily: "DM Mono, monospace",
              fontSize: "14px",
            }}
          />
          <span style={{ color: "var(--muted)", fontSize: "14px" }}>%</span>
        </div>
        <input
          type="range"
          min={1}
          max={20}
          step={0.5}
          value={Math.min(20, Math.max(1, ratePct))}
          onChange={(e) => setRatePct(Number(e.target.value))}
          aria-label="Ajustar tasa de rendimiento"
          style={{ flex: 1, minWidth: "140px", accentColor: "var(--accent)" }}
        />
      </div>

      {!hasExpense ? (
        <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>
          Cargá tus gastos del mes para calcular tu Número de Libertad.
        </p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "18px",
            }}
          >
            <div>
              <div className="label">Tu número de libertad</div>
              <div className="kpi-large" style={{ marginTop: 4 }}>
                {money(nlf)}
              </div>
              <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: 2 }}>
                capital objetivo
              </p>
            </div>
            <div>
              <div className="label">Años para llegar</div>
              <div
                className="kpi-large"
                style={{ marginTop: 4, color: "var(--accent-2)" }}
              >
                {years === null ? "—" : years === 0 ? "0" : years.toFixed(1)}
              </div>
              <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: 2 }}>
                {years === null
                  ? "no converge con este aporte"
                  : years === 0
                    ? "ya alcanzaste tu número"
                    : "al ritmo y tasa actuales"}
              </p>
            </div>
            <div>
              <div className="label">Renta pasiva / mes</div>
              <div
                className="kpi-large"
                style={{ marginTop: 4, color: "var(--accent)" }}
              >
                {money(passiveIncome)}
              </div>
              <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: 2 }}>
                Plan B actual (yields)
              </p>
            </div>
          </div>

          {/* Barra de avance */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                color: "var(--muted)",
                marginBottom: "6px",
              }}
            >
              <span>Avance hacia tu número</span>
              <span style={{ color: "var(--text)" }}>{progress.toFixed(1)}%</span>
            </div>
            <div
              style={{
                height: "12px",
                borderRadius: "999px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, var(--accent-2), var(--accent))",
                  borderRadius: "999px",
                }}
              />
            </div>
            <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "6px" }}>
              {money(portfolio)} invertidos de {money(nlf)}
            </p>
          </div>
        </>
      )}
    </section>
  );
}
