/**
 * Tests del módulo Debts (helpers puros), capa 1.
 *
 * Cubren el contrato:
 *   - Amortización: interés mensual, saldo del mes siguiente, avance N meses
 *   - KPIs: deuda total, pago mensual, APR ponderado, ratio deuda/ingreso
 *   - Desglose consumo vs inversión
 *   - Detección de confirmación pendiente (as-of anterior al período activo)
 */

import { describe, it, expect } from "vitest";
import {
  monthlyInterest,
  nextBalance,
  advanceBalance,
  sumBalances,
  sumMonthlyPayments,
  weightedApr,
  debtToIncomeRatio,
  dtiStatus,
  splitByPurpose,
  monthsElapsed,
  hasDebtsBehind,
  simulatePayoff,
  compareStrategies,
  PAYOFF_MAX_MONTHS,
  type DebtRow,
  type DebtAsOf,
  type DebtForPayoff,
} from "./debts";

function payoffDebt(p: Partial<DebtForPayoff>): DebtForPayoff {
  return {
    id: p.id ?? "d",
    name: p.name ?? "Deuda",
    balance: 0,
    apr: 0,
    minPayment: 0,
    currentPayment: 0,
    ...p,
  };
}

function row(p: Partial<DebtRow>): DebtRow {
  return {
    balance: 0,
    apr: 0,
    currentPayment: 0,
    purpose: "consumption",
    isActive: true,
    ...p,
  };
}

describe("amortización", () => {
  it("monthlyInterest: saldo 1200 al 24% anual = 24/mes", () => {
    // 1200 * 0.24 / 12 = 24
    expect(monthlyInterest(1200, 24)).toBe(24);
  });

  it("nextBalance: saldo baja por (pago - interés)", () => {
    // interés 24, pago 224 => 1200 + 24 - 224 = 1000
    expect(nextBalance(1200, 24, 224)).toBe(1000);
  });

  it("nextBalance: no baja de 0 (pago mayor al saldo+interés)", () => {
    expect(nextBalance(100, 12, 500)).toBe(0);
  });

  it("nextBalance: APR 0 => saldo - pago", () => {
    expect(nextBalance(1000, 0, 250)).toBe(750);
  });

  it("advanceBalance: 0 meses no cambia el saldo", () => {
    expect(advanceBalance(1000, 24, 100, 0)).toBe(1000);
  });

  it("advanceBalance: APR 0, 4 meses de 250 sobre 1000 => 0", () => {
    expect(advanceBalance(1000, 0, 250, 4)).toBe(0);
  });

  it("advanceBalance: si el pago no cubre el interés, el saldo no baja", () => {
    // interés mensual 20 (1000*0.24/12), pago 10 => sube cada mes, nunca 0
    const after = advanceBalance(1000, 24, 10, 3);
    expect(after).toBeGreaterThan(1000);
  });

  it("advanceBalance: corta en 0 y no sigue restando", () => {
    expect(advanceBalance(500, 0, 250, 10)).toBe(0);
  });
});

describe("KPIs", () => {
  const debts = [
    row({ balance: 8000, apr: 22, currentPayment: 300, purpose: "consumption" }),
    row({ balance: 2000, apr: 12, currentPayment: 100, purpose: "investment" }),
    row({ balance: 9999, apr: 50, currentPayment: 999, isActive: false }), // ignorada
  ];

  it("sumBalances: solo activas", () => {
    expect(sumBalances(debts)).toBe(10000);
  });

  it("sumMonthlyPayments: solo activas", () => {
    expect(sumMonthlyPayments(debts)).toBe(400);
  });

  it("weightedApr: ponderado por saldo", () => {
    // (8000*22 + 2000*12) / 10000 = (176000 + 24000)/10000 = 20
    expect(weightedApr(debts)).toBe(20);
  });

  it("weightedApr: sin saldo => 0", () => {
    expect(weightedApr([row({ balance: 0, apr: 30 })])).toBe(0);
  });

  it("debtToIncomeRatio: pago 400 sobre ingreso 2000 = 0.2", () => {
    expect(debtToIncomeRatio(400, 2000)).toBe(0.2);
  });

  it("debtToIncomeRatio: ingreso 0 => 0 (sin dividir por cero)", () => {
    expect(debtToIncomeRatio(400, 0)).toBe(0);
  });

  it("dtiStatus: umbrales 36% / 43%", () => {
    expect(dtiStatus(0.2)).toBe("healthy");
    expect(dtiStatus(0.35)).toBe("healthy");
    expect(dtiStatus(0.36)).toBe("warning");
    expect(dtiStatus(0.42)).toBe("warning");
    expect(dtiStatus(0.43)).toBe("danger");
    expect(dtiStatus(0.6)).toBe("danger");
  });

  it("splitByPurpose: consumo vs inversión (solo activas)", () => {
    expect(splitByPurpose(debts)).toEqual({
      consumption: 8000,
      investment: 2000,
    });
  });
});

describe("confirmación pendiente", () => {
  it("monthsElapsed: cuenta meses entre as-of y período activo", () => {
    expect(monthsElapsed({ year: 2026, month: 1 }, { year: 2026, month: 4 })).toBe(3);
    expect(monthsElapsed({ year: 2025, month: 12 }, { year: 2026, month: 2 })).toBe(2);
  });

  it("monthsElapsed: nunca negativo (período activo anterior al as-of)", () => {
    expect(monthsElapsed({ year: 2026, month: 6 }, { year: 2026, month: 3 })).toBe(0);
  });

  it("hasDebtsBehind: true si alguna activa quedó en un período anterior", () => {
    const debts: DebtAsOf[] = [
      { balanceAsOfYear: 2026, balanceAsOfMonth: 5, isActive: true },
    ];
    expect(hasDebtsBehind(debts, { year: 2026, month: 6 })).toBe(true);
    expect(hasDebtsBehind(debts, { year: 2026, month: 5 })).toBe(false);
  });

  it("hasDebtsBehind: ignora deudas inactivas", () => {
    const debts: DebtAsOf[] = [
      { balanceAsOfYear: 2026, balanceAsOfMonth: 1, isActive: false },
    ];
    expect(hasDebtsBehind(debts, { year: 2026, month: 6 })).toBe(false);
  });
});

// ============================================================================
// CAPA 2 — estrategias de pago (bordes obligatorios del anexo §3)
// ============================================================================

describe("simulatePayoff: bordes obligatorios", () => {
  it("sin deudas: todo en 0, no divide por cero ni cuelga", () => {
    const r = simulatePayoff([], "avalanche");
    expect(r.months).toBe(0);
    expect(r.totalInterest).toBe(0);
    expect(r.budget).toBe(0);
    expect(r.converges).toBe(true);
    expect(r.order).toEqual([]);
    expect(r.schedule).toEqual([0]);
  });

  it("una sola deuda: avalancha y bola de nieve dan igual", () => {
    const debts = [
      payoffDebt({ id: "a", balance: 1000, apr: 24, minPayment: 50, currentPayment: 200 }),
    ];
    const a = simulatePayoff(debts, "avalanche");
    const s = simulatePayoff(debts, "snowball");
    expect(a.months).toBe(s.months);
    expect(a.totalInterest).toBe(s.totalInterest);
    expect(a.converges).toBe(true);
    expect(a.schedule[a.schedule.length - 1]).toBe(0);
  });

  it("APR 0%: se paga linealmente, sin interés", () => {
    // 100 / 25 por mes = 4 meses
    const debts = [
      payoffDebt({ id: "a", balance: 100, apr: 0, minPayment: 0, currentPayment: 25 }),
    ];
    const r = simulatePayoff(debts, "avalanche");
    expect(r.months).toBe(4);
    expect(r.totalInterest).toBe(0);
    expect(r.converges).toBe(true);
    expect(r.schedule).toEqual([100, 75, 50, 25, 0]);
  });

  it("no converge: el pago no cubre el interés, corta en el tope de seguridad", () => {
    // saldo 1000 al 24% => interés 20/mes, presupuesto 5 < 20: crece
    const debts = [
      payoffDebt({ id: "a", balance: 1000, apr: 24, minPayment: 5, currentPayment: 5 }),
    ];
    const r = simulatePayoff(debts, "avalanche");
    expect(r.converges).toBe(false);
    expect(r.months).toBe(PAYOFF_MAX_MONTHS);
    expect(Number.isFinite(r.totalInterest)).toBe(true);
  });

  it("rollover entre dos deudas: el pago liberado acelera la siguiente", () => {
    // A y B de 100 c/u, mínimos 10 c/u, presupuesto total 100 (sobrante 80).
    // El sobrante ataca A; al saldarse, todo el presupuesto cae sobre B.
    // Resultado: ambas saldadas en 2 meses (vs 10 meses si A pagara solo 10).
    const debts = [
      payoffDebt({ id: "a", balance: 100, apr: 0, minPayment: 10, currentPayment: 10 }),
      payoffDebt({ id: "b", balance: 100, apr: 0, minPayment: 10, currentPayment: 90 }),
    ];
    const r = simulatePayoff(debts, "snowball");
    expect(r.budget).toBe(100);
    expect(r.months).toBe(2);
    expect(r.converges).toBe(true);
    expect(r.schedule[r.schedule.length - 1]).toBe(0);
  });

  it("schedule: arranca en el total y baja monótono hasta 0", () => {
    const debts = [
      payoffDebt({ id: "a", balance: 500, apr: 12, minPayment: 25, currentPayment: 100 }),
      payoffDebt({ id: "b", balance: 800, apr: 30, minPayment: 40, currentPayment: 120 }),
    ];
    const r = simulatePayoff(debts, "avalanche");
    expect(r.schedule[0]).toBe(1300);
    expect(r.schedule[r.schedule.length - 1]).toBe(0);
    expect(r.schedule.length).toBe(r.months + 1);
    for (let i = 1; i < r.schedule.length; i++) {
      expect(r.schedule[i]).toBeLessThanOrEqual(r.schedule[i - 1]!);
    }
  });
});

describe("simulatePayoff: orden de ataque", () => {
  const debts = [
    // Saldo chico + APR bajo
    payoffDebt({ id: "a", name: "A", balance: 500, apr: 5, minPayment: 20, currentPayment: 20 }),
    // Saldo grande + APR alto
    payoffDebt({ id: "b", name: "B", balance: 3000, apr: 35, minPayment: 100, currentPayment: 200 }),
  ];

  it("avalancha empieza por el mayor APR", () => {
    const r = simulatePayoff(debts, "avalanche");
    expect(r.order[0]!.id).toBe("b");
  });

  it("bola de nieve empieza por el menor saldo", () => {
    const r = simulatePayoff(debts, "snowball");
    expect(r.order[0]!.id).toBe("a");
  });
});

describe("compareStrategies", () => {
  const debts = [
    payoffDebt({ id: "a", name: "A", balance: 500, apr: 5, minPayment: 20, currentPayment: 20 }),
    payoffDebt({ id: "b", name: "B", balance: 3000, apr: 35, minPayment: 100, currentPayment: 200 }),
  ];

  it("avalancha paga <= interés que bola de nieve (caso normal)", () => {
    const c = compareStrategies(debts);
    expect(c.avalanche.totalInterest).toBeLessThanOrEqual(c.snowball.totalInterest);
  });

  it("ahorro = interés bola de nieve - interés avalancha, >= 0", () => {
    const c = compareStrategies(debts);
    expect(c.interestSaved).toBeCloseTo(
      Math.round((c.snowball.totalInterest - c.avalanche.totalInterest) * 100) / 100,
      2,
    );
    expect(c.interestSaved).toBeGreaterThanOrEqual(0);
  });

  it("presupuesto total idéntico en ambas estrategias (solo cambia el orden)", () => {
    const c = compareStrategies(debts);
    expect(c.avalanche.budget).toBe(c.snowball.budget);
    expect(c.budget).toBe(220); // 20 + 200
  });

  it("recomendada = avalancha", () => {
    expect(compareStrategies(debts).recommended).toBe("avalanche");
  });

  it("sin deudas: no rompe, ahorro 0", () => {
    const c = compareStrategies([]);
    expect(c.interestSaved).toBe(0);
    expect(c.avalanche.months).toBe(0);
    expect(c.budget).toBe(0);
  });
});
