/**
 * Tests del módulo Income.
 *
 * Cubren el contrato:
 *   - Plan B viene de Investments (fuente única de verdad)
 *   - Si hay override manual, gana el override
 *   - Totales y % pasivo se calculan correctamente
 *   - "Ideal a invertir" se deriva del método preferido del usuario
 */

import { describe, it, expect } from "vitest";
import {
  effectivePlanB,
  incomeTotals,
  idealMonthlyInvestmentCapital,
} from "./income";

describe("effectivePlanB", () => {
  it("auto: sin override, sin posiciones → 0", () => {
    const r = effectivePlanB({
      positions: [],
      manualOverride: false,
      manualAmount: null,
    });
    expect(r).toEqual({ amount: 0, source: "auto", autoAmount: 0 });
  });

  it("auto: sin override, con posiciones → suma de yields ÷ 12", () => {
    // 100k al 4% + 50k al 2% = 4000 + 1000 = 5000/año = 416.66/mes
    const r = effectivePlanB({
      positions: [
        { capital: 100_000, passiveYield: 0.04 },
        { capital: 50_000, passiveYield: 0.02 },
      ],
      manualOverride: false,
      manualAmount: 99999, // se ignora porque override === false
    });
    expect(r.source).toBe("auto");
    expect(r.amount).toBeCloseTo(5000 / 12, 4);
    expect(r.autoAmount).toBeCloseTo(5000 / 12, 4);
  });

  it("manual: override activo con monto → manda el override", () => {
    const r = effectivePlanB({
      positions: [{ capital: 100_000, passiveYield: 0.04 }], // auto=333.33
      manualOverride: true,
      manualAmount: 1500,
    });
    expect(r.source).toBe("manual");
    expect(r.amount).toBe(1500);
    expect(r.autoAmount).toBeCloseTo(333.33, 2);
  });

  it("manual: override activo pero monto null → manda manual 0 (la UI debe pedir el valor)", () => {
    const r = effectivePlanB({
      positions: [{ capital: 100_000, passiveYield: 0.04 }],
      manualOverride: true,
      manualAmount: null,
    });
    expect(r.source).toBe("manual");
    expect(r.amount).toBe(0);
    expect(r.autoAmount).toBeCloseTo(333.33, 2);
  });

  it("contraste: autoAmount siempre expuesto aunque el override gane", () => {
    const r = effectivePlanB({
      positions: [{ capital: 200_000, passiveYield: 0.03 }], // auto=500
      manualOverride: true,
      manualAmount: 1200,
    });
    expect(r.amount).toBe(1200);
    expect(r.autoAmount).toBeCloseTo(500, 4);
  });
});

describe("incomeTotals", () => {
  it("portafolio vacío + sin filas → todo cero", () => {
    expect(incomeTotals([], 0)).toEqual({
      planA: 0,
      planB: 0,
      planC: 0,
      total: 0,
      passiveShare: 0,
    });
  });

  it("suma filas activas A y C, ignora inactivas", () => {
    const totals = incomeTotals(
      [
        { plan: "A", amount: 3000, isActive: true },
        { plan: "A", amount: 500, isActive: false }, // inactiva
        { plan: "C", amount: 800, isActive: true },
        { plan: "C", amount: 200, isActive: true },
      ],
      400, // planB
    );
    expect(totals.planA).toBe(3000);
    expect(totals.planC).toBe(1000);
    expect(totals.planB).toBe(400);
    expect(totals.total).toBe(4400);
    expect(totals.passiveShare).toBeCloseTo(400 / 4400, 4);
  });

  it("passiveShare es 0 cuando total es 0 (evita división por cero)", () => {
    const totals = incomeTotals([], 0);
    expect(totals.passiveShare).toBe(0);
  });

  it("planB viene del input, NO se suma desde filas con plan='B'", () => {
    // Si hubiera una fila plan='B' (no debería) la función la ignora
    const totals = incomeTotals(
      [
        { plan: "A", amount: 1000, isActive: true },
        { plan: "B", amount: 9999, isActive: true }, // ruido — ignorado
      ],
      300,
    );
    expect(totals.planB).toBe(300);
    expect(totals.total).toBe(1300);
  });
});

describe("idealMonthlyInvestmentCapital", () => {
  it("50/30/20 sobre 5000 → 1000 (20% Libertad)", () => {
    expect(idealMonthlyInvestmentCapital(5000, "50/30/20")).toBe(1000);
  });

  it("50/25/25 sobre 4000 → 1000 (25% Libertad)", () => {
    expect(idealMonthlyInvestmentCapital(4000, "50/25/25")).toBe(1000);
  });

  it("40/20/40 sobre 6000 → 2400 (40% Libertad)", () => {
    expect(idealMonthlyInvestmentCapital(6000, "40/20/40")).toBe(2400);
  });

  it("método inválido → 0", () => {
    expect(idealMonthlyInvestmentCapital(5000, "abc")).toBe(0);
    expect(idealMonthlyInvestmentCapital(5000, "50/30")).toBe(0);
  });

  it("ingreso 0 → 0", () => {
    expect(idealMonthlyInvestmentCapital(0, "50/30/20")).toBe(0);
  });
});
