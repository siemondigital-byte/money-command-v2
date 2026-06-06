/**
 * Tests de las funciones puras de lib/monthly.ts.
 *
 * Las funciones que tocan Prisma (getMonthlyRecord, upsertMonthlyData, etc.)
 * se validan por integración cuando los módulos las usen, no acá.
 */

import { describe, it, expect } from "vitest";
import {
  activePeriod,
  computeDerived,
  periodToString,
} from "./monthly";

describe("activePeriod", () => {
  it("usa el período del Profile si está seteado", () => {
    const p = activePeriod(
      { activeYear: 2025, activeMonth: 11 },
      new Date("2026-06-05"),
    );
    expect(p).toEqual({ year: 2025, month: 11 });
  });

  it("cae al mes actual si el Profile no tiene período", () => {
    const p = activePeriod(
      { activeYear: null, activeMonth: null },
      new Date(2026, 5, 15), // junio 2026
    );
    expect(p).toEqual({ year: 2026, month: 6 });
  });

  it("cae al mes actual si solo uno de los dos está seteado", () => {
    const p = activePeriod(
      { activeYear: 2025, activeMonth: null },
      new Date(2026, 5, 15),
    );
    expect(p).toEqual({ year: 2026, month: 6 });
  });

  it("rechaza activeMonth fuera de rango", () => {
    const p = activePeriod(
      { activeYear: 2026, activeMonth: 13 },
      new Date(2026, 5, 15),
    );
    expect(p).toEqual({ year: 2026, month: 6 });
  });
});

describe("computeDerived", () => {
  it("ingreso 0 → savingsRate 0 (sin división por cero)", () => {
    const r = computeDerived({
      planA: 0,
      planB: 0,
      planC: 0,
      essentials: 500,
      style: 0,
      freedom: 0,
    });
    expect(r.incomeTotal).toBe(0);
    expect(r.expensesTotal).toBe(500);
    expect(r.savingsRate).toBe(0);
    expect(r.netWorth).toBe(0);
  });

  it("ingreso 5000 gastos 3000 → savingsRate 40%", () => {
    const r = computeDerived({
      planA: 5000,
      planB: 0,
      planC: 0,
      essentials: 2000,
      style: 1000,
      freedom: 0,
    });
    expect(r.incomeTotal).toBe(5000);
    expect(r.expensesTotal).toBe(3000);
    expect(r.savingsRate).toBe(40);
  });

  it("suma de tres planes y tres canastas", () => {
    const r = computeDerived({
      planA: 5000,
      planB: 500,
      planC: 800,
      essentials: 2000,
      style: 1000,
      freedom: 1200,
    });
    expect(r.incomeTotal).toBe(6300);
    expect(r.expensesTotal).toBe(4200);
    expect(r.savingsRate).toBeCloseTo(33.33, 2);
  });

  it("netWorth = portfolioValue - debtTotal", () => {
    const r = computeDerived({
      planA: 1000,
      planB: 0,
      planC: 0,
      essentials: 500,
      style: 0,
      freedom: 0,
      portfolioValue: 150_000,
      debtTotal: 25_000,
    });
    expect(r.netWorth).toBe(125_000);
  });

  it("netWorth = 0 si los snapshots están ausentes", () => {
    const r = computeDerived({
      planA: 1000,
      planB: 0,
      planC: 0,
      essentials: 500,
      style: 0,
      freedom: 0,
    });
    expect(r.netWorth).toBe(0);
  });

  it("netWorth puede ser negativo (deuda > patrimonio)", () => {
    const r = computeDerived({
      planA: 1000,
      planB: 0,
      planC: 0,
      essentials: 0,
      style: 0,
      freedom: 0,
      portfolioValue: 10_000,
      debtTotal: 50_000,
    });
    expect(r.netWorth).toBe(-40_000);
  });

  it("redondea a 2 decimales para evitar artefactos de float", () => {
    const r = computeDerived({
      planA: 1000.10,
      planB: 0.20,
      planC: 0,
      essentials: 500.30,
      style: 0,
      freedom: 0,
    });
    // 1000.10 + 0.20 = 1000.30
    expect(r.incomeTotal).toBe(1000.3);
    expect(r.expensesTotal).toBe(500.3);
  });

  it("savingsRate puede ser negativo (gastos > ingresos)", () => {
    const r = computeDerived({
      planA: 1000,
      planB: 0,
      planC: 0,
      essentials: 2000,
      style: 0,
      freedom: 0,
    });
    expect(r.savingsRate).toBe(-100);
  });

  it("déficit moderado no se clampea (ingreso 1000, gasto 1200 → -20%)", () => {
    const r = computeDerived({
      planA: 1000,
      planB: 0,
      planC: 0,
      essentials: 1200,
      style: 0,
      freedom: 0,
    });
    expect(r.savingsRate).toBe(-20);
  });

  it("gastos MUCHO mayores que ingresos → clamp a -100% (evita overflow Decimal(5,2))", () => {
    // (100 - 2535.99) / 100 * 100 = -2435.99% → antes reventaba el campo
    const r = computeDerived({
      planA: 100,
      planB: 0,
      planC: 0,
      essentials: 2000,
      style: 520,
      freedom: 15.99,
    });
    expect(r.savingsRate).toBe(-100);
    expect(r.savingsRate).toBeGreaterThanOrEqual(-100);
  });

  it("ingreso 0 con gastos → savingsRate 0 (neutral, sin tasa)", () => {
    const r = computeDerived({
      planA: 0,
      planB: 0,
      planC: 0,
      essentials: 800,
      style: 0,
      freedom: 0,
    });
    expect(r.savingsRate).toBe(0);
  });

  it("sin gastos → savingsRate 100% (techo)", () => {
    const r = computeDerived({
      planA: 4000,
      planB: 0,
      planC: 0,
      essentials: 0,
      style: 0,
      freedom: 0,
    });
    expect(r.savingsRate).toBe(100);
  });
});

describe("periodToString", () => {
  it("formatea año y mes con padding", () => {
    expect(periodToString({ year: 2026, month: 6 })).toBe("2026-06");
    expect(periodToString({ year: 2026, month: 12 })).toBe("2026-12");
    expect(periodToString({ year: 2099, month: 1 })).toBe("2099-01");
  });
});
