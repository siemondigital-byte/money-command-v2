/**
 * Tests oficiales de las fórmulas del producto.
 *
 * Estos tests son OBLIGATORIOS. La matemática del NLF y los años a libertad
 * es la columna vertebral de la app — si está mal, el producto pierde credibilidad.
 *
 * Ejecutar con: npm run test
 */

import { describe, it, expect } from "vitest";
import {
  freedomNumber,
  weightedExpectedReturn,
  monthlyPlanB,
  yearsToFinancialFreedom,
  netWorth,
  savingsRate,
  realReturn,
  weightedDebtApr,
  debtToIncomeRatio,
  debtRatioZone,
  thermostatMultiplier,
  thermostatZone,
  monthlyPassiveIncome,
  futureValueWithContributions,
  yearsToDouble,
  realCostOfExpense,
  lifeHoursCost,
  calculateScorecard,
  scorecardRange,
  NLF_DIVISOR,
  DEFAULT_PORTFOLIO_RETURN,
} from "./formulas";

describe("freedomNumber (NLF)", () => {
  it("calcula NLF correcto con 3000/mes deseado", () => {
    // 3000 * 12 / 0.04 = 900,000
    expect(freedomNumber(3000)).toBe(900_000);
  });

  it("calcula NLF correcto con 5000/mes deseado", () => {
    expect(freedomNumber(5000)).toBe(1_500_000);
  });

  it("retorna 0 si el gasto es 0 o negativo", () => {
    expect(freedomNumber(0)).toBe(0);
    expect(freedomNumber(-100)).toBe(0);
  });

  it("usa el divisor del NLF fijo en 0.04", () => {
    expect(NLF_DIVISOR).toBe(0.04);
    // El divisor del NLF nunca cambia: 4% es invariante doctrinal
    const monthlySpend = 1000;
    expect(freedomNumber(monthlySpend)).toBe((monthlySpend * 12) / 0.04);
  });

  it("equivalencia × 300 funciona", () => {
    expect(freedomNumber(2500)).toBe(2500 * 300);
  });
});

describe("weightedExpectedReturn (proyección, Sprint 3)", () => {
  it("retorna default 8% si no hay inversiones", () => {
    expect(weightedExpectedReturn([])).toBe(0.08);
  });

  it("retorna default 8% si capital total es 0", () => {
    expect(
      weightedExpectedReturn([{ capital: 0, expectedReturn: 0.08 }]),
    ).toBe(DEFAULT_PORTFOLIO_RETURN);
  });

  it("calcula retorno ponderado correcto con portafolio mixto", () => {
    // 40% renta fija 4% + 40% renta variable 8% + 20% bienes raíces 6%
    // = 0.4*0.04 + 0.4*0.08 + 0.2*0.06 = 0.016 + 0.032 + 0.012 = 0.06
    const result = weightedExpectedReturn([
      { capital: 4000, expectedReturn: 0.04 },
      { capital: 4000, expectedReturn: 0.08 },
      { capital: 2000, expectedReturn: 0.06 },
    ]);
    expect(result).toBeCloseTo(0.06, 4);
  });

  it("portafolio único retorna su mismo retorno", () => {
    expect(
      weightedExpectedReturn([{ capital: 10000, expectedReturn: 0.07 }]),
    ).toBeCloseTo(0.07, 4);
  });
});

describe("monthlyPlanB (CONTRATO Investments → Income)", () => {
  it("retorna 0 con portafolio vacío", () => {
    expect(monthlyPlanB([])).toBe(0);
  });

  it("retorna 0 si capitales son 0", () => {
    expect(
      monthlyPlanB([
        { capital: 0, passiveYield: 0.04 },
        { capital: 0, passiveYield: 0.08 },
      ]),
    ).toBe(0);
  });

  it("retorna 0 si todos los yields son 0 (ej. crypto sin staking)", () => {
    expect(
      monthlyPlanB([
        { capital: 10000, passiveYield: 0 },
        { capital: 5000, passiveYield: 0 },
      ]),
    ).toBe(0);
  });

  it("una sola posición: 100000 al 4% → 333.33/mes", () => {
    // 100000 × 0.04 = 4000/año → 4000/12 = 333.33
    expect(monthlyPlanB([{ capital: 100_000, passiveYield: 0.04 }])).toBeCloseTo(
      333.33,
      2,
    );
  });

  it("varias posiciones de distinto yield: suma ponderada correcta", () => {
    // 100k bono 4% = 4000/año
    // 200k equity 1.5% = 3000/año
    // 50k real estate 5% = 2500/año
    // total anual = 9500 → mensual = 791.67
    const planB = monthlyPlanB([
      { capital: 100_000, passiveYield: 0.04 },
      { capital: 200_000, passiveYield: 0.015 },
      { capital: 50_000, passiveYield: 0.05 },
    ]);
    expect(planB).toBeCloseTo(9500 / 12, 2);
  });

  it("cambiar capital de una posición recalcula", () => {
    const baseline = monthlyPlanB([{ capital: 100_000, passiveYield: 0.04 }]);
    const doubled = monthlyPlanB([{ capital: 200_000, passiveYield: 0.04 }]);
    expect(doubled).toBeCloseTo(baseline * 2, 6);
  });

  it("cambiar yield de una posición recalcula", () => {
    const conservative = monthlyPlanB([
      { capital: 100_000, passiveYield: 0.02 },
    ]);
    const moderate = monthlyPlanB([{ capital: 100_000, passiveYield: 0.04 }]);
    expect(moderate).toBeCloseTo(conservative * 2, 6);
  });

  it("DOCTRINA: no equivale a (portafolio total × 4%) / 12", () => {
    // El 4% es divisor del NLF, no yield de cartera. Plan B con yields
    // mixtos NO da el mismo número que multiplicar el total por 0.04.
    const positions = [
      { capital: 100_000, passiveYield: 0.04 }, // renta fija
      { capital: 100_000, passiveYield: 0.015 }, // equity
      { capital: 100_000, passiveYield: 0 }, // speculative sin staking
    ];
    const totalCapital = 300_000;
    const planB = monthlyPlanB(positions);
    const wrongCalculation = (totalCapital * 0.04) / 12; // PROHIBIDO
    expect(planB).not.toBeCloseTo(wrongCalculation, 2);
  });

  // TODO (Income module, Sprint 2 — Módulo 2):
  //   - integración: Income.planB === Investments.passiveIncome
  //   - integración: si Income tiene override manual de Plan B, gana el
  //     override sobre el valor computado.
});

describe("yearsToFinancialFreedom", () => {
  it("retorna 0 si patrimonio actual ya alcanza el NLF", () => {
    expect(yearsToFinancialFreedom(1_000_000, 500, 0.08, 900_000)).toBe(0);
  });

  it("retorna Infinity si no se llega ni en 80 años", () => {
    // $100 al mes al 1% nunca llega a $10M
    expect(yearsToFinancialFreedom(0, 100, 0.01, 10_000_000)).toBe(Infinity);
  });

  it("calcula años razonables con escenario clásico", () => {
    // PV=0, PMT=500, r=0.08, target=900k
    // Esperado: aproximadamente 32-35 años
    const years = yearsToFinancialFreedom(0, 500, 0.08, 900_000);
    expect(years).toBeGreaterThan(30);
    expect(years).toBeLessThan(40);
  });

  it("acelera con mayor aporte", () => {
    const slow = yearsToFinancialFreedom(0, 500, 0.08, 900_000);
    const fast = yearsToFinancialFreedom(0, 1500, 0.08, 900_000);
    expect(fast).toBeLessThan(slow);
  });

  it("caso lineal sin interés funciona", () => {
    // PV=0, PMT=1000, r=0, target=120000
    // Esperado: 10 años exactos (1000*12*10 = 120000)
    const years = yearsToFinancialFreedom(0, 1000, 0, 120_000);
    expect(years).toBeCloseTo(10, 1);
  });

  it("escenario realista HENRY: 50k capital, 1000/mes, 8%, target 1.5M (5k/mes en libertad)", () => {
    const years = yearsToFinancialFreedom(50_000, 1000, 0.08, 1_500_000);
    // Esperado: ~30-35 años
    expect(years).toBeGreaterThan(25);
    expect(years).toBeLessThan(40);
  });
});

describe("netWorth", () => {
  it("calcula patrimonio neto correcto", () => {
    expect(netWorth(100_000, 30_000)).toBe(70_000);
  });

  it("puede ser negativo", () => {
    expect(netWorth(10_000, 50_000)).toBe(-40_000);
  });
});

describe("savingsRate", () => {
  it("calcula tasa de ahorro correcta", () => {
    // 5000 ingreso, 3500 gastos = 30% ahorro
    expect(savingsRate(5000, 3500)).toBe(30);
  });

  it("retorna 0 con ingreso 0", () => {
    expect(savingsRate(0, 100)).toBe(0);
  });

  it("puede ser negativo si gastos > ingresos", () => {
    expect(savingsRate(1000, 1200)).toBe(-20);
  });
});

describe("realReturn", () => {
  it("calcula retorno real correcto", () => {
    // Nominal 8%, inflación 3% → real ≈ 4.85%
    const result = realReturn(0.08, 0.03);
    expect(result).toBeCloseTo(0.0485, 3);
  });

  it("retorna 0 si nominal = inflación", () => {
    expect(realReturn(0.05, 0.05)).toBeCloseTo(0, 5);
  });
});

describe("weightedDebtApr", () => {
  it("calcula APR ponderado correcto", () => {
    // $5000 al 20% + $5000 al 10% = 15% ponderado
    const result = weightedDebtApr([
      { balance: 5000, apr: 0.2 },
      { balance: 5000, apr: 0.1 },
    ]);
    expect(result).toBeCloseTo(0.15, 4);
  });

  it("retorna 0 si no hay deudas", () => {
    expect(weightedDebtApr([])).toBe(0);
  });
});

describe("debtToIncomeRatio y zonas", () => {
  it("calcula ratio correcto", () => {
    expect(debtToIncomeRatio(1500, 5000)).toBe(30);
  });

  it("clasifica zona healthy", () => {
    expect(debtRatioZone(20)).toBe("healthy");
  });

  it("clasifica zona caution", () => {
    expect(debtRatioZone(40)).toBe("caution");
  });

  it("clasifica zona critical", () => {
    expect(debtRatioZone(60)).toBe("critical");
  });

  it("límite 30% es healthy (no caution)", () => {
    expect(debtRatioZone(29)).toBe("healthy");
    expect(debtRatioZone(30)).toBe("caution");
  });
});

describe("thermostat", () => {
  it("calcula multiplicador correcto", () => {
    expect(thermostatMultiplier(2000, 4000)).toBe(2);
  });

  it("zona technical cuando multiplicador <2", () => {
    expect(thermostatZone(1.5)).toBe("technical");
  });

  it("zona mindset_parallel cuando 2-5", () => {
    expect(thermostatZone(3)).toBe("mindset_parallel");
  });

  it("zona mindset_first cuando >5", () => {
    expect(thermostatZone(6)).toBe("mindset_first");
  });
});

describe("monthlyPassiveIncome", () => {
  it("calcula renta pasiva mensual al 4%", () => {
    // 900,000 al 4% / 12 = 3000/mes
    expect(monthlyPassiveIncome(900_000)).toBe(3000);
  });

  it("retorna 0 con capital 0", () => {
    expect(monthlyPassiveIncome(0)).toBe(0);
  });
});

describe("futureValueWithContributions", () => {
  it("$10K al 8% durante 30 años se convierten en ~100K (sin aportes)", () => {
    const result = futureValueWithContributions(10000, 0, 0.08, 30);
    // 10000 * 1.08^30 ≈ 100627
    expect(result).toBeGreaterThan(100_000);
    expect(result).toBeLessThan(101_000);
  });

  it("ejemplo realista: 5000 + 500/mes al 8% por 20 años ≈ 297K (interés compuesto anual)", () => {
    const result = futureValueWithContributions(5000, 500, 0.08, 20);
    // Cálculo: 5000 × 1.08^20 + 500 × 12 × [(1.08^20 - 1) / 0.08] ≈ 297,876
    expect(result).toBeGreaterThan(295_000);
    expect(result).toBeLessThan(300_000);
  });

  it("retorno 0 = crecimiento lineal", () => {
    // 1000 * 12 * 5 = 60000 + PV 0
    expect(futureValueWithContributions(0, 1000, 0, 5)).toBe(60_000);
  });
});

describe("yearsToDouble (regla del 72)", () => {
  it("al 8% son 9 años", () => {
    expect(yearsToDouble(0.08)).toBe(9);
  });

  it("al 10% son 7.2 años", () => {
    expect(yearsToDouble(0.1)).toBeCloseTo(7.2, 1);
  });

  it("al 12% son 6 años", () => {
    expect(yearsToDouble(0.12)).toBe(6);
  });
});

describe("realCostOfExpense", () => {
  it("teléfono $1200 al 8% en 5 años cuesta ~$1763 real", () => {
    const result = realCostOfExpense(1200, 5, 0.08);
    expect(result).toBeGreaterThan(1760);
    expect(result).toBeLessThan(1770);
  });
});

describe("lifeHoursCost", () => {
  it("café de 5 con valor por hora de 20 cuesta 0.25 horas (15 min)", () => {
    expect(lifeHoursCost(5, 20)).toBe(0.25);
  });

  it("retorna 0 si hourly value es 0", () => {
    expect(lifeHoursCost(100, 0)).toBe(0);
  });
});

describe("calculateScorecard", () => {
  it("perfil saludable da score alto", () => {
    const score = calculateScorecard({
      savingsRatePct: 25,
      emergencyFundMonths: 6,
      debtToIncomeRatioPct: 10,
      portfolioDiversificationCount: 3,
      netWorth: 500_000,
      freedomNumber: 1_000_000,
    });
    expect(score.total).toBeGreaterThan(80);
    expect(score.savings).toBe(27);
    expect(score.emergencyFund).toBe(20);
    expect(score.debtRatio).toBe(20);
    expect(score.diversification).toBe(15);
    // Progreso = 500k / 1M * 15 = 7.5 ≈ 8
    expect(score.progress).toBeGreaterThanOrEqual(7);
    expect(score.progress).toBeLessThanOrEqual(8);
  });

  it("perfil en crisis da score bajo", () => {
    const score = calculateScorecard({
      savingsRatePct: 2,
      emergencyFundMonths: 0,
      debtToIncomeRatioPct: 70,
      portfolioDiversificationCount: 0,
      netWorth: 1000,
      freedomNumber: 1_000_000,
    });
    expect(score.total).toBeLessThan(20);
  });

  it("clasifica rangos correctamente", () => {
    expect(scorecardRange(95)).toBe("exceptional");
    expect(scorecardRange(80)).toBe("excellent");
    expect(scorecardRange(65)).toBe("good");
    expect(scorecardRange(45)).toBe("mediocre");
    expect(scorecardRange(25)).toBe("poor");
    expect(scorecardRange(10)).toBe("crisis");
  });
});
