/**
 * Tests de la proyección de Investments (capa A).
 *
 * Una sola tasa por activo (passiveYield): de ahí sale crecimiento, renta y
 * Plan B. Bordes obligatorios:
 *   - rendimiento ponderado por capital; sin capital -> 0
 *   - projectedValue: 1 activo == futureValueWithContributions; varios suman;
 *     cada uno con su tasa; tasa 0 -> lineal; years 0 -> capital
 *   - renta proyectada con la misma tasa por posición; tasa 0 -> renta 0
 *   - sin posiciones -> todo 0, sin dividir por cero
 *   - monotonía: 20A >= 10A >= 5A
 *   - caso conocido: 10k sin aportes al 8% por 30A ~ 100k
 */

import { describe, it, expect } from "vitest";
import { futureValueWithContributions } from "./formulas";
import {
  portfolioTotal,
  weightedYield,
  projectedValue,
  projectedMonthlyPassiveIncome,
  projectionTable,
  growthSeries,
  portfolioShares,
  type ProjectionPosition,
} from "./investments";

function pos(p: Partial<ProjectionPosition>): ProjectionPosition {
  return {
    capital: 0,
    monthlyContribution: 0,
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

describe("weightedYield", () => {
  it("pondera por capital", () => {
    // (1000*0.04 + 3000*0.08) / 4000 = (40 + 240)/4000 = 0.07
    const r = weightedYield([
      pos({ capital: 1000, passiveYield: 0.04 }),
      pos({ capital: 3000, passiveYield: 0.08 }),
    ]);
    expect(r).toBeCloseTo(0.07, 10);
  });
  it("sin capital -> 0 (no divide por cero)", () => {
    expect(weightedYield([pos({ capital: 0, passiveYield: 0.08 })])).toBe(0);
    expect(weightedYield([])).toBe(0);
  });
});

describe("projectedValue", () => {
  it("un activo coincide con futureValueWithContributions", () => {
    const p = pos({ capital: 10000, monthlyContribution: 200, passiveYield: 0.08 });
    expect(projectedValue([p], 10)).toBe(
      Math.round(
        futureValueWithContributions(10000, 200, 0.08, 10) * 100,
      ) / 100,
    );
  });

  it("varios activos suman, cada uno con su propia tasa", () => {
    const a = pos({ capital: 10000, passiveYield: 0.08 });
    const b = pos({ capital: 5000, passiveYield: 0.04 });
    const expected =
      futureValueWithContributions(10000, 0, 0.08, 10) +
      futureValueWithContributions(5000, 0, 0.04, 10);
    expect(projectedValue([a, b], 10)).toBe(Math.round(expected * 100) / 100);
  });

  it("tasa 0 -> crecimiento lineal (capital + aportes)", () => {
    // 1000 + 100*12*5 = 1000 + 6000 = 7000
    expect(projectedValue([pos({ capital: 1000, monthlyContribution: 100, passiveYield: 0 })], 5)).toBe(7000);
  });

  it("years 0 -> capital actual", () => {
    expect(projectedValue([pos({ capital: 4321.5, monthlyContribution: 300, passiveYield: 0.08 })], 0)).toBe(4321.5);
  });

  it("caso conocido: 10k sin aportes al 8% por 30A ~ 100k", () => {
    const v = projectedValue([pos({ capital: 10000, passiveYield: 0.08 })], 30);
    expect(v).toBeGreaterThan(95000);
    expect(v).toBeLessThan(105000);
  });

  it("sin posiciones -> 0", () => {
    expect(projectedValue([], 10)).toBe(0);
  });

  it("monotonía: 20A >= 10A >= 5A", () => {
    const ps = [pos({ capital: 10000, monthlyContribution: 200, passiveYield: 0.08 })];
    const v5 = projectedValue(ps, 5);
    const v10 = projectedValue(ps, 10);
    const v20 = projectedValue(ps, 20);
    expect(v10).toBeGreaterThanOrEqual(v5);
    expect(v20).toBeGreaterThanOrEqual(v10);
  });
});

describe("projectedMonthlyPassiveIncome", () => {
  it("= valor proyectado x tasa / 12 (un activo)", () => {
    // sin aportes: FV = 10000*1.08^10; renta mensual = FV*0.08/12
    const fv = futureValueWithContributions(10000, 0, 0.08, 10);
    const expected = Math.round(((fv * 0.08) / 12) * 100) / 100;
    expect(
      projectedMonthlyPassiveIncome(
        [pos({ capital: 10000, passiveYield: 0.08 })],
        10,
      ),
    ).toBe(expected);
  });

  it("tasa 0 -> renta 0 (el valor solo sube por aportes)", () => {
    expect(
      projectedMonthlyPassiveIncome(
        [pos({ capital: 50000, monthlyContribution: 100, passiveYield: 0 })],
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
    const ps = [pos({ capital: 10000, monthlyContribution: 100, passiveYield: 0.08 })];
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

describe("growthSeries (gráfico apilado)", () => {
  it("sin posiciones -> perAsset vacío, years conservados", () => {
    const s = growthSeries([], [0, 10, 20, 30]);
    expect(s.years).toEqual([0, 10, 20, 30]);
    expect(s.perAsset).toEqual([]);
  });

  it("una banda coincide con projectedValue por año", () => {
    const p = pos({ capital: 10000, monthlyContribution: 100, passiveYield: 0.08 });
    const years = [0, 5, 10, 30];
    const s = growthSeries([p], years);
    expect(s.perAsset).toHaveLength(1);
    expect(s.perAsset[0]).toEqual(years.map((y) => projectedValue([p], y)));
  });

  it("cada banda es monótona creciente", () => {
    const ps = [
      pos({ capital: 10000, monthlyContribution: 100, passiveYield: 0.08 }),
      pos({ capital: 5000, monthlyContribution: 0, passiveYield: 0.04 }),
    ];
    const s = growthSeries(ps, [0, 10, 20, 30]);
    for (const band of s.perAsset) {
      for (let j = 1; j < band.length; j++) {
        expect(band[j]).toBeGreaterThanOrEqual(band[j - 1]!);
      }
    }
  });

  it("la altura apilada por año = projectedValue de todo el portafolio", () => {
    const ps = [
      pos({ capital: 10000, monthlyContribution: 100, passiveYield: 0.08 }),
      pos({ capital: 5000, monthlyContribution: 50, passiveYield: 0.04 }),
    ];
    const years = [0, 7, 15, 30];
    const s = growthSeries(ps, years);
    years.forEach((y, j) => {
      const stacked = s.perAsset.reduce((sum, band) => sum + band[j]!, 0);
      // pequeña tolerancia por redondeo por activo vs portafolio
      expect(stacked).toBeCloseTo(projectedValue(ps, y), 0);
    });
  });
});

describe("portfolioShares (donut)", () => {
  it("share por posición = capital / total, suma 1", () => {
    const ps = [pos({ capital: 3000 }), pos({ capital: 1000 })];
    const shares = portfolioShares(ps);
    expect(shares[0]!.share).toBeCloseTo(0.75, 10);
    expect(shares[1]!.share).toBeCloseTo(0.25, 10);
    expect(shares.reduce((s, x) => s + x.share, 0)).toBeCloseTo(1, 10);
  });

  it("sin capital -> shares en 0 (no divide por cero)", () => {
    const shares = portfolioShares([pos({ capital: 0 }), pos({ capital: 0 })]);
    expect(shares.every((s) => s.share === 0)).toBe(true);
  });

  it("sin posiciones -> arreglo vacío", () => {
    expect(portfolioShares([])).toEqual([]);
  });
});
