/**
 * Tests de la lógica pura de generación automática del gasto de una meta
 * (Etapa 3b-i). Solo `decideGoalExpense` (sin DB). El wrapper
 * `syncAutomaticGoalExpenses` toca Prisma y se valida en el cableado (3b-ii).
 *
 * Cobertura: generación normal, idempotencia (no duplica), anti-overshoot
 * (última cuota recortada + isAchieved), cambio de cuota (período activo se
 * actualiza, pasados no), pausada/completada/cuota 0 (no genera), guard de
 * período (no antes de createdAt ni en futuro).
 */

import { describe, it, expect } from "vitest";
import {
  decideGoalExpense,
  type GoalState,
  type DecideInput,
} from "./goal-expenses";

// createdAt = junio 2026 (getMonth() === 5). El período "junio" es {2026, 6}.
const CREATED_JUNE = new Date(2026, 5, 1);
const NOW_JUNE = new Date(2026, 5, 15);

function mkGoal(p: Partial<GoalState> = {}): GoalState {
  return {
    monthlyContribution: 300,
    targetAmount: 3000,
    isActive: true,
    isAchieved: false,
    createdAt: CREATED_JUNE,
    ...p,
  };
}

function decide(p: Partial<DecideInput> = {}) {
  return decideGoalExpense({
    goal: p.goal ?? mkGoal(),
    period: p.period ?? { year: 2026, month: 6 },
    now: p.now ?? NOW_JUNE,
    accumulatedOther: p.accumulatedOther ?? 0,
    existingAmount: p.existingAmount ?? null,
  });
}

describe("decideGoalExpense — generación normal", () => {
  it("crea el gasto del período con el monto de la cuota", () => {
    const d = decide();
    expect(d).toEqual({ action: "create", amount: 300, markAchieved: false });
  });
});

describe("decideGoalExpense — idempotencia", () => {
  it("si ya existe el gasto con el monto correcto, no hace nada (noop, no create)", () => {
    const d = decide({ existingAmount: 300 });
    expect(d.action).toBe("noop");
    expect(d).toEqual({ action: "noop", markAchieved: false });
  });
  it("nunca crea un segundo gasto si ya hay uno en el período", () => {
    const d = decide({ existingAmount: 300 });
    expect(d.action).not.toBe("create");
  });
});

describe("decideGoalExpense — anti-overshoot", () => {
  it("recorta la última cuota al faltante y marca la meta completada", () => {
    // faltan 100 (acumulado 2900 de 3000), cuota 300 -> genera solo 100
    const d = decide({ accumulatedOther: 2900 });
    expect(d).toEqual({ action: "create", amount: 100, markAchieved: true });
  });
  it("cuota que cierra justo el objetivo -> completada", () => {
    const d = decide({ accumulatedOther: 2700 }); // 2700 + 300 = 3000
    expect(d).toEqual({ action: "create", amount: 300, markAchieved: true });
  });
  it("ya financiada por otros períodos -> no genera, marca completada", () => {
    const d = decide({ accumulatedOther: 3000 });
    expect(d).toEqual({ action: "skip", reason: "already_funded", markAchieved: true });
  });
});

describe("decideGoalExpense — cambio de cuota (cuota pegajosa)", () => {
  it("en el período activo, reconcilia el gasto al nuevo monto", () => {
    // ya había un gasto de 300 este mes; la cuota bajó a 200 -> update a 200
    const d = decide({
      goal: mkGoal({ monthlyContribution: 200 }),
      accumulatedOther: 600, // dos meses previos ya generados, intactos
      existingAmount: 300,
    });
    expect(d).toEqual({ action: "update", amount: 200, markAchieved: false });
  });
  it("los meses anteriores no entran en la decisión del período activo", () => {
    // accumulatedOther representa los meses pasados; la decisión solo afecta
    // el período objetivo. Subir la cuota a 500 actualiza solo este mes.
    const d = decide({
      goal: mkGoal({ monthlyContribution: 500 }),
      accumulatedOther: 600,
      existingAmount: 300,
    });
    expect(d).toEqual({ action: "update", amount: 500, markAchieved: false });
  });
});

describe("decideGoalExpense — no genera", () => {
  it("meta pausada (isActive=false) -> skip paused", () => {
    const d = decide({ goal: mkGoal({ isActive: false }) });
    expect(d).toEqual({ action: "skip", reason: "paused", markAchieved: false });
  });
  it("meta completada (isAchieved=true) -> skip achieved", () => {
    const d = decide({ goal: mkGoal({ isAchieved: true }) });
    expect(d).toEqual({ action: "skip", reason: "achieved", markAchieved: false });
  });
  it("cuota 0 -> skip no_contribution", () => {
    const d = decide({ goal: mkGoal({ monthlyContribution: 0 }) });
    expect(d).toEqual({ action: "skip", reason: "no_contribution", markAchieved: false });
  });
});

describe("decideGoalExpense — guard de período (forward-only)", () => {
  it("no genera en un mes anterior a la creación de la meta", () => {
    // creada en junio; período mayo {2026,5} -> antes del inicio
    const d = decide({ period: { year: 2026, month: 5 } });
    expect(d).toEqual({ action: "skip", reason: "before_start", markAchieved: false });
  });
  it("no genera en un mes futuro respecto del calendario actual", () => {
    // now = junio; período julio {2026,7} -> futuro
    const d = decide({ period: { year: 2026, month: 7 } });
    expect(d).toEqual({ action: "skip", reason: "future", markAchieved: false });
  });
  it("genera en el mes de creación (borde inferior incluido)", () => {
    // creada en junio, período junio -> permitido
    const d = decide({ period: { year: 2026, month: 6 } });
    expect(d.action).toBe("create");
  });
});
