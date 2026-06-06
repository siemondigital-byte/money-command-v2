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
  type DebtRow,
  type DebtAsOf,
} from "./debts";

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
