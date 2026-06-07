/**
 * Tests de la proyección de Investments (capa A).
 *
 * Bordes obligatorios:
 *   - retorno ponderado por capital; sin capital -> 0
 *   - projectedValue: 1 activo == futureValueWithContributions; varios suman;
 *     cada uno con su retorno; retorno 0 -> lineal; years 0 -> capital
 *   - renta proyectada con yields reales por posición; yield 0 -> 0
 *   - sin posiciones -> todo 0, sin dividir por cero
 *   - monotonía: 20A >= 10A >= 5A
 *   - caso conocido: 10k sin aportes al 8% por 30A ~ 100k
 */

import { describe, it, expect } from "vitest";
import { futureValueWithContributions } from "./formulas";
import {
  portfolioTotal,
  weightedExpectedReturn,
  projectedValue,
  projectedMonthlyPassiveIncome,
  projectionTable,
  type ProjectionPosition,
} from "./investments";

function pos(p: Partial<ProjectionPosition>): ProjectionPosition {
  return {
    capital: 0,
    monthlyContribution: 0,
    expectedReturn: 0,
    passiveYield: 0,
    ...p,
  };
}

describe("portfolioTotal", () => {
  it("suma el capital", () => {
    expect(portfolioTotal([pos({ capital: 1000 }), pos({ capital: 2500.5 })])).toBe(3500.5);
  });
  it("sin posiciones -> 0", () => {
    expect(portfolioTotal([])).toBe(0);
  });
});

describe("weightedExpectedReturn", () => {
  it("pondera por capital", () => {
    // (1000*0.04 + 3000*0.08) / 4000 = (40 + 240)/4000 = 0.07
    const r = weightedExpectedReturn([
      pos({ capital: 1000, expectedReturn: 0.04 }),
      pos({ capital: 3000, expectedReturn: 0.08 }),
    ]);
    expect(r).toBeCloseTo(0.07, 10);
  });
  it("sin capital -> 0 (no divide por cero)", () => {
    expect(weightedExpectedReturn([pos({ capital: 0, expectedReturn: 0.08 })])).toBe(0);
    expect(weightedExpectedReturn([])).toBe(0);
  });
});

describe("projectedValue", () => {
  it("un activo coincide con futureValueWithContributions", () => {
    const p = pos({ capital: 10000, monthlyContribution: 200, expectedReturn: 0.08 });
    expect(projectedValue([p], 10)).toBe(
      Math.round(
        futureValueWithContributions(10000, 200, 0.08, 10) * 100,
      ) / 100,
    );
  });

  it("varios activos suman, cada uno con su propio retorno", () => {
    const a = pos({ capital: 10000, expectedReturn: 0.08 });
    const b = pos({ capital: 5000, expectedReturn: 0.04 });
    const expected =
      futureValueWithContributions(10000, 0, 0.08, 10) +
      futureValueWithContributions(5000, 0, 0.04, 10);
    expect(projectedValue([a, b], 10)).toBe(Math.round(expected * 100) / 100);
  });

  it("retorno 0 -> crecimiento lineal (capital + aportes)", () => {
    // 1000 + 100*12*5 = 1000 + 6000 = 7000
    expect(projectedValue([pos({ capital: 1000, monthlyContribution: 100, expectedReturn: 0 })], 5)).toBe(7000);
  });

  it("years 0 -> capital actual", () => {
    expect(projectedValue([pos({ capital: 4321.5, monthlyContribution: 300, expectedReturn: 0.08 })], 0)).toBe(4321.5);
  });

  it("caso conocido: 10k sin aportes al 8% por 30A ~ 100k", () => {
    const v = projectedValue([pos({ capital: 10000, expectedReturn: 0.08 })], 30);
    expect(v).toBeGreaterThan(95000);
    expect(v).toBeLessThan(105000);
  });

  it("sin posiciones -> 0", () => {
    expect(projectedValue([], 10)).toBe(0);
  });

  it("monotonía: 20A >= 10A >= 5A", () => {
    const ps = [pos({ capital: 10000, monthlyContribution: 200, expectedReturn: 0.08 })];
    const v5 = projectedValue(ps, 5);
    const v10 = projectedValue(ps, 10);
    const v20 = projectedValue(ps, 20);
    expect(v10).toBeGreaterThanOrEqual(v5);
    expect(v20).toBeGreaterThanOrEqual(v10);
  });
});

describe("projectedMonthlyPassiveIncome", () => {
  it("= valor proyectado x yield / 12 (un activo)", () => {
    // sin aportes: FV = 10000*1.08^10; renta mensual = FV*0.03/12
    const fv = futureValueWithContributions(10000, 0, 0.08, 10);
    const expected = Math.round(((fv * 0.03) / 12) * 100) / 100;
    expect(
      projectedMonthlyPassiveIncome(
        [pos({ capital: 10000, expectedReturn: 0.08, passiveYield: 0.03 })],
        10,
      ),
    ).toBe(expected);
  });

  it("yield 0 -> renta 0 aunque el valor crezca", () => {
    expect(
      projectedMonthlyPassiveIncome(
        [pos({ capital: 50000, expectedReturn: 0.1, passiveYield: 0 })],
        10,
      ),
    ).toBe(0);
  });

  it("sin posiciones -> 0", () => {
    expect(projectedMonthlyPassiveIncome([], 10)).toBe(0);
  });
});

describe("projectionTable", () => {
  it("una fila por horizonte, con valor y renta", () => {
    const ps = [pos({ capital: 10000, monthlyContribution: 100, expectedReturn: 0.08, passiveYield: 0.03 })];
    const table = projectionTable(ps, [5, 10, 20]);
    expect(table.map((r) => r.years)).toEqual([5, 10, 20]);
    expect(table[0]!.value).toBe(projectedValue(ps, 5));
    expect(table[1]!.monthlyIncome).toBe(projectedMonthlyPassiveIncome(ps, 10));
  });

  it("sin posiciones -> todas las filas en 0", () => {
    const table = projectionTable([], [5, 10, 20]);
    expect(table.every((r) => r.value === 0 && r.monthlyIncome === 0)).toBe(true);
  });
});
