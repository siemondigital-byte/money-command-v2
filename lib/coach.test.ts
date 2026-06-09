/**
 * Tests del Scorecard del Coach. Bordes de cada métrica + total ponderado.
 */
import { describe, it, expect } from "vitest";
import {
  savingsMetric,
  debtMetric,
  emergencyMetric,
  investingMetric,
  diversificationMetric,
  rangeLabel,
  priorityMessage,
  buildScorecard,
  type CoachInputs,
  type CoachMetric,
} from "./coach";

describe("savingsMetric", () => {
  it("30% de ahorro → puntaje 100", () => {
    // ingreso 1000, gasto 700 → 30%
    expect(savingsMetric(1000, 700).score).toBe(100);
  });
  it("15% de ahorro → ~50", () => {
    expect(savingsMetric(1000, 850).score).toBe(50);
  });
  it("sin ingreso → 0", () => {
    expect(savingsMetric(0, 0).score).toBe(0);
  });
  it("gasto mayor al ingreso → 0 (clamp)", () => {
    expect(savingsMetric(1000, 1500).score).toBe(0);
  });
  it("subtítulo con % y meta", () => {
    expect(savingsMetric(1000, 700).subtitle).toBe("30% actual · meta 30%");
  });
});

describe("debtMetric", () => {
  it("sin deudas → 100", () => {
    const r = debtMetric([], 5000);
    expect(r.score).toBe(100);
    expect(r.subtitle).toMatch(/sin deudas/i);
  });
  it("tarjeta cara baja el puntaje y nombra la peor", () => {
    const r = debtMetric(
      [{ name: "Tarjeta Visa", balance: 3000, apr: 24.9 }],
      5000,
    );
    expect(r.score).toBeLessThan(70);
    expect(r.subtitle).toContain("Tarjeta Visa");
    expect(r.subtitle).toContain("24.9");
  });
  it("APR más alto = peor puntaje", () => {
    const low = debtMetric([{ name: "A", balance: 1000, apr: 5 }], 5000).score;
    const high = debtMetric([{ name: "B", balance: 1000, apr: 30 }], 5000).score;
    expect(high).toBeLessThan(low);
  });
  it("elige la deuda de mayor APR como la peor", () => {
    const r = debtMetric(
      [
        { name: "Auto", balance: 10000, apr: 9 },
        { name: "Tarjeta", balance: 2000, apr: 24.9 },
      ],
      5000,
    );
    expect(r.subtitle).toContain("Tarjeta");
  });
});

describe("emergencyMetric", () => {
  it("sin meta de fondo → 0 con guía", () => {
    const r = emergencyMetric(
      [{ name: "Viaje", basket: "style", currentAmount: 1000 }],
      2000,
    );
    expect(r.score).toBe(0);
    expect(r.subtitle).toMatch(/definí una meta/i);
  });
  it("cubre 3 de 6 meses → 50", () => {
    const r = emergencyMetric(
      [{ name: "Fondo de emergencia", basket: "essentials", currentAmount: 6000 }],
      2000, // 6000/2000 = 3 meses
    );
    expect(r.score).toBe(50);
    expect(r.subtitle).toBe("3.0 de 6 meses completados");
  });
  it("match por nombre case-insensitive ('Emergencia')", () => {
    const r = emergencyMetric(
      [{ name: "Mi EMERGENCIA", basket: "essentials", currentAmount: 12000 }],
      2000, // 6 meses → 100
    );
    expect(r.score).toBe(100);
  });
  it("sin gasto promedio → 0 con aviso", () => {
    const r = emergencyMetric(
      [{ name: "Fondo", basket: "essentials", currentAmount: 6000 }],
      0,
    );
    expect(r.score).toBe(0);
    expect(r.subtitle).toMatch(/gastos/i);
  });
});

describe("investingMetric", () => {
  it("sin inversiones → 0", () => {
    expect(investingMetric([]).score).toBe(0);
  });
  it("todas con aporte → 100", () => {
    const r = investingMetric([
      { capital: 1000, monthlyContribution: 100, category: "equity" },
      { capital: 2000, monthlyContribution: 50, category: "fixed_income" },
    ]);
    expect(r.score).toBe(100);
    expect(r.subtitle).toMatch(/todas/i);
  });
  it("la mitad con aporte → 50", () => {
    const r = investingMetric([
      { capital: 1000, monthlyContribution: 100, category: "equity" },
      { capital: 2000, monthlyContribution: 0, category: "fixed_income" },
    ]);
    expect(r.score).toBe(50);
  });
  it("ninguna con aporte → 0 con aviso", () => {
    const r = investingMetric([
      { capital: 1000, monthlyContribution: 0, category: "equity" },
    ]);
    expect(r.score).toBe(0);
    expect(r.subtitle).toMatch(/sin aportes/i);
  });
});

describe("diversificationMetric", () => {
  it("sin activos → 0", () => {
    expect(diversificationMetric([]).score).toBe(0);
  });
  it("4 tipos + 5 activos → 100", () => {
    const r = diversificationMetric([
      { capital: 100, monthlyContribution: 0, category: "fixed_income" },
      { capital: 100, monthlyContribution: 0, category: "equity" },
      { capital: 100, monthlyContribution: 0, category: "real_estate" },
      { capital: 100, monthlyContribution: 0, category: "speculative" },
      { capital: 100, monthlyContribution: 0, category: "equity" },
    ]);
    expect(r.score).toBe(100);
  });
  it("1 activo, 1 tipo → puntaje bajo", () => {
    const r = diversificationMetric([
      { capital: 100, monthlyContribution: 0, category: "equity" },
    ]);
    expect(r.score).toBeLessThan(40);
    expect(r.subtitle).toContain("1 activo");
  });
  it("ignora activos sin capital", () => {
    const r = diversificationMetric([
      { capital: 0, monthlyContribution: 0, category: "equity" },
    ]);
    expect(r.score).toBe(0);
  });
});

describe("rangeLabel", () => {
  it("escala cualitativa", () => {
    expect(rangeLabel(85)).toMatch(/sólida/i);
    expect(rangeLabel(65)).toMatch(/buen progreso/i);
    expect(rangeLabel(10)).toMatch(/punto de partida/i);
  });
});

describe("priorityMessage", () => {
  it("todo alto → mantener el rumbo", () => {
    const metrics: CoachMetric[] = [
      { key: "savings", label: "", score: 90, subtitle: "" },
      { key: "debt", label: "", score: 90, subtitle: "" },
      { key: "emergency", label: "", score: 90, subtitle: "" },
      { key: "investing", label: "", score: 90, subtitle: "" },
      { key: "diversification", label: "", score: 90, subtitle: "" },
    ];
    expect(priorityMessage(metrics)).toMatch(/mantené el rumbo/i);
  });
  it("prioriza deuda/emergencia bajas (mayor peso)", () => {
    const metrics: CoachMetric[] = [
      { key: "savings", label: "", score: 60, subtitle: "" },
      { key: "debt", label: "", score: 30, subtitle: "" },
      { key: "emergency", label: "", score: 0, subtitle: "" },
      { key: "investing", label: "", score: 65, subtitle: "" },
      { key: "diversification", label: "", score: 65, subtitle: "" },
    ];
    const msg = priorityMessage(metrics);
    expect(msg).toMatch(/fondo de emergencia/i);
    expect(msg).toMatch(/deudas/i);
  });
});

describe("buildScorecard", () => {
  const base: CoachInputs = {
    incomeMonth: 1000,
    expenseMonth: 700,
    avgMonthlyExpense: 700,
    debts: [],
    goals: [],
    investments: [],
  };

  it("devuelve 5 métricas en orden", () => {
    const sc = buildScorecard(base);
    expect(sc.metrics.map((m) => m.key)).toEqual([
      "savings",
      "debt",
      "emergency",
      "investing",
      "diversification",
    ]);
  });

  it("total ponderado: deuda y emergencia pesan doble", () => {
    // savings 100, debt 100 (sin deudas), emergency 0, investing 0, divers 0.
    // total = (100*1 + 100*2 + 0*2 + 0*1 + 0*1) / 7 = 300/7 ≈ 43
    const sc = buildScorecard(base);
    expect(sc.total).toBe(43);
  });

  it("total 0-100 y etiqueta + mensaje presentes", () => {
    const sc = buildScorecard(base);
    expect(sc.total).toBeGreaterThanOrEqual(0);
    expect(sc.total).toBeLessThanOrEqual(100);
    expect(typeof sc.rangeLabel).toBe("string");
    expect(sc.priorityMessage.length).toBeGreaterThan(0);
  });
});
