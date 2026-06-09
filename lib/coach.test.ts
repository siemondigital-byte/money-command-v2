/**
 * Tests del Scorecard del Coach (fórmula oficial por puntos fijos que suman 100).
 */
import { describe, it, expect } from "vitest";
import {
  savingsMetric,
  emergencyMetric,
  debtMetric,
  diversificationMetric,
  freedomMetric,
  scorecardRange,
  buildScorecard,
  type CoachInputs,
} from "./coach";

describe("savingsMetric (30 pts, por tramos)", () => {
  it(">=30% → 30", () => {
    expect(savingsMetric(1000, 700).score).toBe(30); // 30%
  });
  it("20-30% → 27", () => {
    expect(savingsMetric(1000, 750).score).toBe(27); // 25%
  });
  it("10-20% → 20", () => {
    expect(savingsMetric(1000, 850).score).toBe(20); // 15%
  });
  it("5-10% → 10", () => {
    expect(savingsMetric(1000, 930).score).toBe(10); // 7%
  });
  it("<5% → 0", () => {
    expect(savingsMetric(1000, 980).score).toBe(0); // 2%
  });
  it("sin ingreso → 0", () => {
    expect(savingsMetric(0, 0).score).toBe(0);
  });
  it("subtítulo", () => {
    expect(savingsMetric(1000, 700).subtitle).toBe("30% actual · meta 30%");
  });
});

describe("emergencyMetric (20 pts)", () => {
  it("cubre 3 de 6 meses → 10", () => {
    const r = emergencyMetric(
      [{ name: "Fondo de emergencia", basket: "essentials", currentAmount: 6000 }],
      2000, // 3 meses → (3/6)*20 = 10
    );
    expect(r.score).toBe(10);
    expect(r.subtitle).toBe("3.0 de 6 meses completados");
  });
  it("cubre 6+ meses → 20 (techo)", () => {
    const r = emergencyMetric(
      [{ name: "Fondo", basket: "essentials", currentAmount: 18000 }],
      2000, // 9 meses → techo 20
    );
    expect(r.score).toBe(20);
  });
  it("sin meta → 0 con guía", () => {
    const r = emergencyMetric(
      [{ name: "Viaje", basket: "style", currentAmount: 1000 }],
      2000,
    );
    expect(r.score).toBe(0);
    expect(r.subtitle).toMatch(/define una meta/i);
  });
  it("match case-insensitive", () => {
    const r = emergencyMetric(
      [{ name: "Mi EMERGENCIA", basket: "essentials", currentAmount: 12000 }],
      2000,
    );
    expect(r.score).toBe(20);
  });
});

describe("debtMetric (20 pts, ratio pagos/ingreso)", () => {
  it("sin deudas → 20", () => {
    const r = debtMetric([], 5000);
    expect(r.score).toBe(20);
    expect(r.subtitle).toMatch(/sin deudas/i);
  });
  it("<15% → 20", () => {
    // pago 500 / ingreso 5000 = 10%
    const r = debtMetric([{ name: "Visa", apr: 24, currentPayment: 500 }], 5000);
    expect(r.score).toBe(20);
    expect(r.subtitle).toContain("Ratio deuda/ingreso: 10%");
    expect(r.subtitle).toContain("Visa al 24% — acelerar");
  });
  it("15-30% → 15", () => {
    const r = debtMetric([{ name: "A", apr: 10, currentPayment: 1000 }], 5000); // 20%
    expect(r.score).toBe(15);
  });
  it("30-50% → 10", () => {
    const r = debtMetric([{ name: "A", apr: 10, currentPayment: 2000 }], 5000); // 40%
    expect(r.score).toBe(10);
  });
  it(">50% → 0", () => {
    const r = debtMetric([{ name: "A", apr: 10, currentPayment: 3000 }], 5000); // 60%
    expect(r.score).toBe(0);
  });
  it("menciona la deuda de mayor APR", () => {
    const r = debtMetric(
      [
        { name: "Auto", apr: 9, currentPayment: 200 },
        { name: "Tarjeta", apr: 24.9, currentPayment: 100 },
      ],
      5000,
    );
    expect(r.subtitle).toContain("Tarjeta al 24.9%");
  });
});

describe("diversificationMetric (15 pts, tipos con peso >5%)", () => {
  it("3+ tipos → 15", () => {
    const r = diversificationMetric([
      { capital: 100, category: "fixed_income" },
      { capital: 100, category: "equity" },
      { capital: 100, category: "real_estate" },
    ]);
    expect(r.score).toBe(15);
    expect(r.subtitle).toBe("3 activos · 3 tipos");
  });
  it("2 tipos → 8", () => {
    const r = diversificationMetric([
      { capital: 100, category: "equity" },
      { capital: 100, category: "fixed_income" },
    ]);
    expect(r.score).toBe(8);
  });
  it("1 tipo → 3", () => {
    const r = diversificationMetric([
      { capital: 100, category: "equity" },
      { capital: 100, category: "equity" },
    ]);
    expect(r.score).toBe(3);
    expect(r.subtitle).toBe("2 activos · 1 tipo");
  });
  it("ignora tipos con peso <=5%", () => {
    // 990 equity + 5 fixed_income (0.5%) → solo 1 tipo significativo
    const r = diversificationMetric([
      { capital: 990, category: "equity" },
      { capital: 5, category: "fixed_income" },
    ]);
    expect(r.score).toBe(3);
  });
  it("sin activos → 0", () => {
    expect(diversificationMetric([]).score).toBe(0);
  });
});

describe("freedomMetric (15 pts, patrimonio/NLF)", () => {
  it("50% del camino → ~8", () => {
    const r = freedomMetric(150000, 300000); // 0.5*15 = 7.5 → 8
    expect(r.score).toBe(8);
    expect(r.subtitle).toBe("50% del camino a tu Número de Libertad");
  });
  it("patrimonio >= NLF → 15 (techo)", () => {
    expect(freedomMetric(400000, 300000).score).toBe(15);
  });
  it("patrimonio negativo → 0", () => {
    expect(freedomMetric(-5000, 300000).score).toBe(0);
  });
  it("NLF 0 → 0 con invitación a definirlo", () => {
    const r = freedomMetric(100000, 0);
    expect(r.score).toBe(0);
    expect(r.subtitle).toMatch(/Número de Libertad/i);
  });
});

describe("scorecardRange (etiqueta + mensaje exacto)", () => {
  it("90-100 Excepcional", () => {
    expect(scorecardRange(95).label).toBe("Excepcional");
    expect(scorecardRange(95).message).toMatch(/1% que aplica el sistema/);
  });
  it("60-74 Bien, pero te falta", () => {
    expect(scorecardRange(65).label).toBe("Bien, pero te falta");
  });
  it("0-19 Es ahora o nunca", () => {
    expect(scorecardRange(10).label).toBe("Es ahora o nunca");
    expect(scorecardRange(10).message).toMatch(/actuar esta semana/);
  });
});

describe("buildScorecard", () => {
  const base: CoachInputs = {
    incomeMonth: 1000,
    expenseMonth: 700, // 30% ahorro → 30
    avgMonthlyExpense: 700,
    netWorth: 0,
    nlf: 0,
    debts: [],
    goals: [],
    investments: [],
  };

  it("orden de las 5 métricas y sus máximos", () => {
    const sc = buildScorecard(base);
    expect(sc.metrics.map((m) => m.key)).toEqual([
      "savings",
      "emergency",
      "debt",
      "diversification",
      "freedom",
    ]);
    expect(sc.metrics.map((m) => m.max)).toEqual([30, 20, 20, 15, 15]);
  });

  it("total = suma de puntos (0-100)", () => {
    // savings 30, emergency 0 (sin meta), debt 20 (sin deudas), diversificación 0, freedom 0
    const sc = buildScorecard(base);
    expect(sc.total).toBe(50);
    expect(sc.rangeLabel).toBe("Te estás quedando corto");
  });

  it("máximos suman 100", () => {
    const sc = buildScorecard(base);
    expect(sc.metrics.reduce((s, m) => s + m.max, 0)).toBe(100);
  });

  it("caso alto: total cercano a 100", () => {
    const sc = buildScorecard({
      incomeMonth: 10000,
      expenseMonth: 6000, // 40% → 30
      avgMonthlyExpense: 3000,
      netWorth: 1000000,
      nlf: 900000, // >=NLF → 15
      debts: [],
      goals: [
        { name: "Fondo emergencia", basket: "essentials", currentAmount: 18000 }, // 6 meses → 20
      ],
      investments: [
        { capital: 1000, category: "fixed_income" },
        { capital: 1000, category: "equity" },
        { capital: 1000, category: "real_estate" }, // 3 tipos → 15
      ],
    });
    // 30 + 20 + 20 + 15 + 15 = 100
    expect(sc.total).toBe(100);
    expect(sc.rangeLabel).toBe("Excepcional");
  });
});
