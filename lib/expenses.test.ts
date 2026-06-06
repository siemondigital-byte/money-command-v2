/**
 * Tests del módulo Expenses (helpers puros).
 *
 * Cubren el contrato:
 *   - Suma de real y presupuesto por canasta (solo activos)
 *   - Totales por tipo (Fijos / Variables)
 *   - Resumen de suscripciones (mensual / anual / proyección)
 *   - classification derivada del basket (columna legacy)
 *   - Estado de presupuesto (ok / near / over)
 */

import { describe, it, expect } from "vitest";
import {
  sumRealByBasket,
  sumBudgetByBasket,
  totalsByType,
  subscriptionSummary,
  classificationFromBasket,
  budgetStatus,
  type ExpenseRow,
} from "./expenses";

function row(p: Partial<ExpenseRow>): ExpenseRow {
  return {
    type: "fixed",
    basket: "essentials",
    amount: 0,
    budget: 0,
    isActive: true,
    isSubscription: false,
    ...p,
  };
}

describe("sumRealByBasket", () => {
  it("agrupa el real por canasta y totaliza", () => {
    const rows = [
      row({ basket: "essentials", amount: 1000 }),
      row({ basket: "essentials", amount: 500.5 }),
      row({ basket: "style", amount: 200 }),
      row({ basket: "freedom", amount: 300 }),
    ];
    const t = sumRealByBasket(rows);
    expect(t).toEqual({
      essentials: 1500.5,
      style: 200,
      freedom: 300,
      total: 2000.5,
    });
  });

  it("ignora filas inactivas", () => {
    const rows = [
      row({ basket: "style", amount: 100 }),
      row({ basket: "style", amount: 999, isActive: false }),
    ];
    expect(sumRealByBasket(rows).style).toBe(100);
  });

  it("redondea a 2 decimales", () => {
    const rows = [
      row({ basket: "essentials", amount: 0.1 }),
      row({ basket: "essentials", amount: 0.2 }),
    ];
    expect(sumRealByBasket(rows).essentials).toBe(0.3);
  });
});

describe("sumBudgetByBasket", () => {
  it("agrupa el presupuesto por canasta", () => {
    const rows = [
      row({ basket: "essentials", budget: 1200 }),
      row({ basket: "style", budget: 400 }),
    ];
    const t = sumBudgetByBasket(rows);
    expect(t.essentials).toBe(1200);
    expect(t.style).toBe(400);
    expect(t.total).toBe(1600);
  });
});

describe("totalsByType", () => {
  it("separa fijos y variables, real y presupuesto", () => {
    const rows = [
      row({ type: "fixed", amount: 1000, budget: 1100 }),
      row({ type: "fixed", amount: 200, budget: 200 }),
      row({ type: "variable", amount: 300, budget: 250 }),
    ];
    const t = totalsByType(rows);
    expect(t.fixedReal).toBe(1200);
    expect(t.variableReal).toBe(300);
    expect(t.fixedBudget).toBe(1300);
    expect(t.variableBudget).toBe(250);
    expect(t.totalReal).toBe(1500);
    expect(t.totalBudget).toBe(1550);
  });

  it("totalReal es el expensesTotal que va al MonthlyRecord", () => {
    const rows = [
      row({ type: "fixed", amount: 800 }),
      row({ type: "variable", amount: 450.25 }),
    ];
    expect(totalsByType(rows).totalReal).toBe(1250.25);
  });
});

describe("subscriptionSummary", () => {
  it("suma solo suscripciones activas: mensual, anual y proyección", () => {
    const rows = [
      row({ basket: "style", amount: 10, isSubscription: true }),
      row({ basket: "style", amount: 15.5, isSubscription: true }),
      row({ basket: "style", amount: 5, isSubscription: true, isActive: false }),
      row({ basket: "style", amount: 99, isSubscription: false }), // café, no sub
    ];
    const s = subscriptionSummary(rows, 5);
    expect(s.count).toBe(2);
    expect(s.monthly).toBe(25.5);
    expect(s.annual).toBe(306);
    expect(s.projectionYears).toBe(5);
    expect(s.projectionTotal).toBe(1530);
  });

  it("sin suscripciones → todo en 0", () => {
    const s = subscriptionSummary([row({ amount: 100 })]);
    expect(s).toEqual({
      count: 0,
      monthly: 0,
      annual: 0,
      projectionYears: 5,
      projectionTotal: 0,
    });
  });
});

describe("classificationFromBasket", () => {
  it("mapea canasta → classification legacy", () => {
    expect(classificationFromBasket("essentials")).toBe("need");
    expect(classificationFromBasket("style")).toBe("want");
    expect(classificationFromBasket("freedom")).toBe("investment");
  });
});

describe("budgetStatus", () => {
  it("ok dentro, near cerca, over si excede", () => {
    expect(budgetStatus(50, 100)).toBe("ok");
    expect(budgetStatus(95, 100)).toBe("near");
    expect(budgetStatus(120, 100)).toBe("over");
  });
  it("sin presupuesto definido → ok (no se marca)", () => {
    expect(budgetStatus(500, 0)).toBe("ok");
  });
});
