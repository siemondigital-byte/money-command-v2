"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";
import { futureValueWithContributions } from "@/lib/formulas";
import {
  freedomNumber,
  freedomProgress,
  yearsToFreedom,
} from "@/lib/dashboard";

/**
 * Libertad financiera (mockup 02 · Calculadora de libertad), ANEXO REDISENO §2.
 *
 * El Número de Libertad = gasto real × 12 / tasa (sin divisor fijo). La tasa
 * (interés compuesto) y los aportes son movibles para proyectarse; la edad se
 * LEE. Dos barras de avance:
 *   - ESTADO ACTUAL: portafolio real / NLF (a la tasa default). Fija.
 *   - PROYECCIÓN: portafolio proyectado al horizonte / NLF. Se mueve con la
 *     simulación (tasa + ahorro).
 *
 * La renta pasiva es el Plan B existente (no se recalcula).
 */
export function FreedomBlock({
  monthlyExpense,
  portfolio,
  defaultIncome,
  defaultSaving,
  passiveIncome,
  defaultRatePct,
  ageCurrent,
  ageFreedomTarget,
  locale,
  currency,
}: {
  monthlyExpense: number;
  portfolio: number;
  defaultIncome: number;
  defaultSaving: number;
  passiveIncome: number;
  defaultRatePct: number;
  ageCurrent: number | null;
  ageFreedomTarget: number | null;
  locale: string;
  currency: string;
}) {
  const money = (n: number) => formatMoney(n, locale, currency);
  const moneyShort = (n: number) =>
    formatMoney(n, locale, currency, { maxFractionDigits: 0 });

  const baseRate = Math.round(defaultRatePct * 100) / 100;
  const [ratePct, setRatePct] = useState(baseRate);
  const [income, setIncome] = useState(Math.round(defaultIncome));
  const [saving, setSaving] = useState(Math.round(defaultSaving));

  const rate = ratePct / 100;
  const hasExpense = monthlyExpense > 0;

  // Número de Libertad: gasto real x 12 / tasa (se mueve con la tasa).
  const nlf = freedomNumber(monthlyExpense, rate);
  // Años para llegar: portafolio + aporte (ahorro) a la tasa elegida.
  const years = yearsToFreedom(portfolio, saving, rate, nlf);

  // Barra 1 (estado actual): contra el NLF a la tasa default. Fija.
  const nlfActual = freedomNumber(monthlyExpense, baseRate / 100);
  const progressActual = freedomProgress(portfolio, nlfActual);

  // Barra 2 (proyección): portafolio proyectado al horizonte / NLF. Se mueve.
  const horizon =
    ageFreedomTarget !== null && ageCurrent !== null && ageFreedomTarget > ageCurrent
      ? ageFreedomTarget - ageCurrent
      : 10;
  const projected = futureValueWithContributions(portfolio, saving, rate, horizon);
  const progressProj = nlf > 0 ? Math.min(100, (projected / nlf) * 100) : 0;

  // Rangos de los sliders (anclados a los datos reales).
  const incomeMax = Math.max(2000, Math.round(defaultIncome * 2.5), 20000);
  const savingMax = Math.max(500, income);
  const savingRatePct = income > 0 ? Math.round((saving / income) * 100) : 0;

  return (
    <section className="d-card top-mint" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="d-section-label">Calculadora de libertad</div>

      <div className="d-free">
        {/* Inputs movibles */}
        <div className="d-inputs">
          <div className="d-input">
            <div className="lbl">
              <span>Ingreso mensual</span>
              <span style={{ color: "var(--accent)" }}>editable</span>
            </div>
            <div className="iv">{money(income)}</div>
            <input
              type="range"
              className="d-range"
              min={0}
              max={incomeMax}
              step={100}
              value={Math.min(income, incomeMax)}
              onChange={(e) => setIncome(Number(e.target.value))}
              aria-label="Ingreso mensual"
            />
            <div className="ticks">
              <span>{moneyShort(0)}</span>
              <span>{moneyShort(incomeMax)}+</span>
            </div>
          </div>

          <div className="d-input">
            <div className="lbl">
              <span>Ahorro mensual</span>
              <span style={{ color: "var(--accent)" }}>{savingRatePct}% del ingreso</span>
            </div>
            <div className="iv">{money(saving)}</div>
            <input
              type="range"
              className="d-range"
              min={0}
              max={savingMax}
              step={50}
              value={Math.min(saving, savingMax)}
              onChange={(e) => setSaving(Number(e.target.value))}
              aria-label="Ahorro mensual"
            />
            <div className="ticks">
              <span>{moneyShort(0)}</span>
              <span>{moneyShort(savingMax)}</span>
            </div>
          </div>

          <div className="d-input">
            <div className="lbl">
              <span>Interés compuesto</span>
              <span style={{ color: "var(--accent)" }}>tasa</span>
            </div>
            <div className="iv">{ratePct.toFixed(1)}%</div>
            <input
              type="range"
              className="d-range"
              min={1}
              max={20}
              step={0.5}
              value={Math.min(20, Math.max(1, ratePct))}
              onChange={(e) => setRatePct(Number(e.target.value))}
              aria-label="Tasa de interés compuesto"
            />
            <div className="ticks">
              <span>1%</span>
              <span>20%</span>
            </div>
          </div>

          <div className="d-input read">
            <div className="lbl">
              <span>Edad objetivo de libertad</span>
              <span>se lee</span>
            </div>
            <div className="iv">
              {ageFreedomTarget !== null ? `${ageFreedomTarget} años` : "—"}
            </div>
            <div className="ticks">
              <span>
                {ageCurrent !== null ? `Hoy ${ageCurrent}` : "Configurá tu edad"}
              </span>
              <span>{`Horizonte ${horizon} años`}</span>
            </div>
          </div>
        </div>

        {/* Output: número + barras */}
        <div className="d-output">
          <div>
            <div className="head">
              <span>Tu número de libertad</span>
              <span className="rule">{ratePct.toFixed(1)}% anual</span>
            </div>
            {hasExpense ? (
              <>
                <div className="big">{money(nlf)}</div>
                <div className="ctx">
                  El capital que necesitás invertido para que su retorno cubra
                  tus gastos. El capital queda intacto: vivís de los flujos.
                </div>
              </>
            ) : (
              <div className="ctx" style={{ marginTop: "16px" }}>
                Cargá tus gastos del mes para calcular tu Número de Libertad.
              </div>
            )}
          </div>

          {hasExpense && (
            <div className="prog">
              <div className="row">
                <span>Estado actual</span>
                <span className="yrs">{progressActual.toFixed(1)}%</span>
              </div>
              <div className="bar">
                <div className="seg now" style={{ width: `${progressActual}%` }} />
              </div>
              <div className="row">
                <span>Proyección · {horizon} años</span>
                <span className="yrs">
                  {years === null
                    ? "no converge"
                    : years === 0
                      ? "logrado"
                      : `${years.toFixed(1)} años`}
                </span>
              </div>
              <div className="bar">
                <div className="seg proj" style={{ width: `${progressProj}%` }} />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  color: "var(--muted)",
                  marginTop: "4px",
                }}
              >
                <span>Renta pasiva / mes</span>
                <span style={{ color: "var(--accent)", fontFamily: "Syne, sans-serif", fontWeight: 700 }}>
                  {money(passiveIncome)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
