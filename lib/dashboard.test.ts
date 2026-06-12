/**
 * Tests de los helpers del Dashboard. Se enfocan en los bordes que el ANEXO
 * exige: meta 0/null sin brecha, meta alcanzada, sin historial degrada, gasto
 * 0, tasa 0 (evitar div/0), aporte que no converge -> null.
 */

import { describe, it, expect } from "vitest";
import {
  thermostat,
  realDistribution,
  unassignedAllocation,
  distributionAmounts,
  freedomNumber,
  freedomNumberInflated,
  yearsToFreedom,
  freedomProgress,
} from "./dashboard";

describe("thermostat", () => {
  it("sin meta (null) no marca brecha", () => {
    const r = thermostat(5000, null);
    expect(r).toEqual({
      current: 5000,
      target: 0,
      gap: 0,
      gapPct: 0,
      reached: false,
    });
  });

  it("meta 0 no marca brecha", () => {
    expect(thermostat(5000, 0).gap).toBe(0);
  });

  it("meta alcanzada cuando current >= target", () => {
    const r = thermostat(12000, 10000);
    expect(r.reached).toBe(true);
    expect(r.gap).toBe(0);
    expect(r.gapPct).toBe(0);
  });

  it("calcula brecha en monto y % sobre el actual", () => {
    const r = thermostat(5000, 8000);
    expect(r.gap).toBe(3000);
    expect(r.gapPct).toBe(60); // 3000/5000
    expect(r.reached).toBe(false);
  });

  it("sin historial (current 0) con meta: gap = target, sin div/0", () => {
    const r = thermostat(0, 8000);
    expect(r.current).toBe(0);
    expect(r.gap).toBe(8000);
    expect(r.gapPct).toBe(0);
  });

  it("ingreso null degrada a current 0", () => {
    expect(thermostat(null, 8000).current).toBe(0);
  });
});

describe("realDistribution (% del ingreso; Libertad incluye inversión)", () => {
  it("ejemplo de Andrea: 47% / 11% / 19% del ingreso", () => {
    // ingreso 7475, esenciales 3500, estilo 820, libertad 0, aporte inversión 1400
    const r = realDistribution({ essentials: 3500, style: 820, freedom: 0 }, 7475, 1400);
    expect(Math.round(r.essentials)).toBe(47);
    expect(Math.round(r.style)).toBe(11);
    expect(Math.round(r.freedom)).toBe(19); // (0 + 1400) / 7475
  });

  it("Libertad suma gastos freedom + aporte a inversión", () => {
    const r = realDistribution({ essentials: 0, style: 0, freedom: 500 }, 2000, 500);
    expect(r.freedom).toBeCloseTo(50); // (500 + 500) / 2000
  });

  it("sin ingreso degrada a ceros (sin div/0)", () => {
    expect(
      realDistribution({ essentials: 100, style: 50, freedom: 0 }, 0, 0),
    ).toEqual({ essentials: 0, style: 0, freedom: 0 });
  });
});

describe("unassignedAllocation (sin asignar)", () => {
  it("ejemplo de Andrea: US$ 1.755 (23%)", () => {
    const r = unassignedAllocation(7475, 3500, 820, 0, 1400);
    expect(r.amount).toBe(1755);
    expect(Math.round(r.pct)).toBe(23);
  });

  it("las 3 canastas + sin asignar suman 100% del ingreso", () => {
    const income = 7475;
    const d = realDistribution({ essentials: 3500, style: 820, freedom: 0 }, income, 1400);
    const u = unassignedAllocation(income, 3500, 820, 0, 1400);
    expect(d.essentials + d.style + d.freedom + u.pct).toBeCloseTo(100);
  });

  it("puede ser negativo (asignó más que el ingreso)", () => {
    const r = unassignedAllocation(3000, 2500, 600, 0, 400);
    expect(r.amount).toBe(-500);
    expect(r.pct).toBeLessThan(0);
  });

  it("ingreso 0 -> {0, 0} (sin div/0)", () => {
    expect(unassignedAllocation(0, 0, 0, 0, 0)).toEqual({ amount: 0, pct: 0 });
  });
});

describe("distributionAmounts", () => {
  it("convierte % en montos sobre el ingreso", () => {
    const r = distributionAmounts(10000, {
      essentials: 50,
      style: 30,
      freedom: 20,
    });
    expect(r).toEqual({ essentials: 5000, style: 3000, freedom: 2000 });
  });

  it("ingreso 0 -> montos 0", () => {
    const r = distributionAmounts(0, { essentials: 50, style: 30, freedom: 20 });
    expect(r).toEqual({ essentials: 0, style: 0, freedom: 0 });
  });
});

describe("freedomNumber", () => {
  it("gasto × 12 / tasa", () => {
    expect(freedomNumber(2000, 0.08)).toBe(300000); // 24000/0.08
  });

  it("tasa 0 evita div/0", () => {
    expect(freedomNumber(2000, 0)).toBe(0);
  });

  it("gasto 0 -> 0", () => {
    expect(freedomNumber(0, 0.08)).toBe(0);
  });
});

describe("freedomNumberInflated", () => {
  it("infla el gasto antes de calcular", () => {
    const base = freedomNumber(1000, 0.08);
    const infl = freedomNumberInflated(1000, 0.08, 5, 10);
    expect(infl).toBeGreaterThan(base);
  });

  it("inflación 0 == número base", () => {
    expect(freedomNumberInflated(1000, 0.08, 0, 10)).toBe(
      freedomNumber(1000, 0.08),
    );
  });

  it("tasa 0 evita div/0", () => {
    expect(freedomNumberInflated(1000, 0, 5, 10)).toBe(0);
  });
});

describe("yearsToFreedom", () => {
  it("ya alcanzado -> 0", () => {
    expect(yearsToFreedom(500000, 1000, 0.08, 300000)).toBe(0);
  });

  it("converge en años positivos", () => {
    const y = yearsToFreedom(10000, 1000, 0.08, 300000);
    expect(y).not.toBeNull();
    expect(y!).toBeGreaterThan(0);
  });

  it("sin aporte y sin retorno no converge -> null", () => {
    expect(yearsToFreedom(1000, 0, 0, 300000)).toBeNull();
  });

  it("NLF 0 -> 0 (sin objetivo)", () => {
    expect(yearsToFreedom(1000, 100, 0.08, 0)).toBe(0);
  });

  it("más tasa = menos años", () => {
    const slow = yearsToFreedom(10000, 1000, 0.04, 300000)!;
    const fast = yearsToFreedom(10000, 1000, 0.1, 300000)!;
    expect(fast).toBeLessThan(slow);
  });
});

describe("freedomProgress", () => {
  it("portafolio / NLF en %", () => {
    expect(freedomProgress(150000, 300000)).toBe(50);
  });

  it("tope 100", () => {
    expect(freedomProgress(400000, 300000)).toBe(100);
  });

  it("NLF 0 -> 0", () => {
    expect(freedomProgress(1000, 0)).toBe(0);
  });
});
