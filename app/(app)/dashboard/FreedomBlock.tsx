"use client";

import { useState } from "react";
import { formatMoneyShort } from "@/lib/format";
import { useTranslations } from "@/lib/i18n/provider";
import { MoneyAmount } from "./MoneyAmount";
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
  const t = useTranslations().dashboard.freedom;
  const money = (n: number) => formatMoneyShort(n, locale, currency);
  const moneyShort = (n: number) => formatMoneyShort(n, locale, currency);

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
      <div className="d-section-label">{t.label}</div>

      <div className="d-free">
        {/* Inputs movibles */}
        <div className="d-inputs">
          <div className="d-input">
            <div className="lbl">
              <span>{t.incomeMonthly}</span>
              <span style={{ color: "var(--accent)" }}>{t.editable}</span>
            </div>
            <div className="iv">
              <MoneyAmount value={income} locale={locale} currency={currency} />
            </div>
            <input
              type="range"
              className="d-range"
              min={0}
              max={incomeMax}
              step={100}
              value={Math.min(income, incomeMax)}
              onChange={(e) => setIncome(Number(e.target.value))}
              aria-label={t.incomeMonthly}
            />
            <div className="ticks">
              <span>{moneyShort(0)}</span>
              <span>{moneyShort(incomeMax)}+</span>
            </div>
          </div>

          <div className="d-input">
            <div className="lbl">
              <span>{t.savingMonthly}</span>
              <span style={{ color: "var(--accent)" }}>{savingRatePct}{t.ofIncome}</span>
            </div>
            <div className="iv">
              <MoneyAmount value={saving} locale={locale} currency={currency} />
            </div>
            <input
              type="range"
              className="d-range"
              min={0}
              max={savingMax}
              step={50}
              value={Math.min(saving, savingMax)}
              onChange={(e) => setSaving(Number(e.target.value))}
              aria-label={t.savingMonthly}
            />
            <div className="ticks">
              <span>{moneyShort(0)}</span>
              <span>{moneyShort(savingMax)}</span>
            </div>
          </div>

          <div className="d-input">
            <div className="lbl">
              <span>{t.compoundInterest}</span>
              <span style={{ color: "var(--accent)" }}>{t.rate}</span>
            </div>
            <div className="iv">{Math.round(ratePct)}%</div>
            <input
              type="range"
              className="d-range"
              min={1}
              max={20}
              step={0.5}
              value={Math.min(20, Math.max(1, ratePct))}
              onChange={(e) => setRatePct(Number(e.target.value))}
              aria-label={t.ariaRate}
            />
            <div className="ticks">
              <span>1%</span>
              <span>20%</span>
            </div>
          </div>

          <div className="d-input read">
            <div className="lbl">
              <span>{t.ageTargetLabel}</span>
            </div>
            <div className="iv">
              {ageFreedomTarget !== null ? `${ageFreedomTarget} ${t.years}` : "—"}
            </div>
            <div className="ticks">
              <span>
                {ageCurrent !== null ? `${t.today} ${ageCurrent}` : t.setAge}
              </span>
              <span>{`${t.horizon} ${horizon} ${t.years}`}</span>
            </div>
          </div>
        </div>

        {/* Output: número + barras. La tarjeta es container query para que el
            Número de Libertad escale con su ancho (cqi) y llegue al mismo techo
            que los KPI de Allocation/Proyección: se ve igual de grande y unificado. */}
        <div className="d-output" style={{ containerType: "inline-size" }}>
          <div>
            <div className="head">
              <span>{t.yourFreedomNumber}</span>
              <span className="rule">{Math.round(ratePct)}{t.perYearRate}</span>
            </div>
            {hasExpense ? (
              <>
                <div
                  className="big"
                  style={{
                    fontSize: "clamp(1.3rem, 13cqi, 2.7rem)",
                    overflowWrap: "anywhere",
                    minWidth: 0,
                  }}
                >
                  <MoneyAmount value={nlf} locale={locale} currency={currency} />
                </div>
                <div className="ctx">
                  {t.nlfCtx}
                </div>
              </>
            ) : (
              <div className="ctx" style={{ marginTop: "16px" }}>
                {t.noExpenseCtx}
              </div>
            )}
          </div>

          {hasExpense && (
            <div className="prog">
              <div className="row">
                <span>{t.currentState}</span>
                <span className="yrs">{Math.round(progressActual)}%</span>
              </div>
              <div className="bar">
                <div className="seg now" style={{ width: `${progressActual}%` }} />
              </div>
              <div className="row">
                <span>{t.projection} {horizon} {t.years}</span>
                <span className="yrs">
                  {years === null
                    ? t.notConverge
                    : years === 0
                      ? t.achieved
                      : `${Math.round(years)} ${t.years}`}
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
                <span>{t.passivePerMonth}</span>
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
