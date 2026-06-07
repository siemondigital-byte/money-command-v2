/**
 * Tests del módulo Metas (helpers puros), capa A.
 *
 * Bordes obligatorios:
 *   - progress: target 0 -> 0; > 100% se clampea a 100%
 *   - monthsToGoal: completa -> 0; sin aporte y falta plata -> null (no div/0)
 *   - goalTiming: a tiempo vs atrasado con fechas; sin fecha; no alcanzable
 *   - averageProgress: promedia bien; sin metas -> 0
 *   - nextGoal: la de menor tiempo; null si no hay
 *   - totalMonthlyContribution: suma
 */

import { describe, it, expect } from "vitest";
import {
  progress,
  monthsToGoal,
  goalTiming,
  averageProgress,
  nextGoal,
  totalMonthlyContribution,
} from "./goals";

function goal(p: {
  targetAmount?: number;
  currentAmount?: number;
  monthlyContribution?: number;
  targetDate?: string | null;
  name?: string;
}) {
  return {
    targetAmount: 0,
    currentAmount: 0,
    monthlyContribution: 0,
    targetDate: null,
    name: "Meta",
    ...p,
  };
}

describe("progress", () => {
  it("ahorro / objetivo", () => {
    expect(progress(goal({ targetAmount: 1000, currentAmount: 250 }))).toBe(0.25);
  });
  it("objetivo 0 -> 0 (sin dividir por cero)", () => {
    expect(progress(goal({ targetAmount: 0, currentAmount: 500 }))).toBe(0);
  });
  it("se clampea a 100% si el ahorro supera el objetivo", () => {
    expect(progress(goal({ targetAmount: 1000, currentAmount: 1500 }))).toBe(1);
  });
  it("nunca negativo", () => {
    expect(progress(goal({ targetAmount: 1000, currentAmount: 0 }))).toBe(0);
  });
});

describe("monthsToGoal", () => {
  it("caso normal: techo de restante / aporte", () => {
    // (1000 - 100) / 300 = 3 (ceil)
    expect(monthsToGoal(goal({ targetAmount: 1000, currentAmount: 100, monthlyContribution: 300 }))).toBe(3);
  });
  it("redondea hacia arriba", () => {
    // (1000 - 0) / 300 = 3.33 -> 4
    expect(monthsToGoal(goal({ targetAmount: 1000, monthlyContribution: 300 }))).toBe(4);
  });
  it("meta completa -> 0", () => {
    expect(monthsToGoal(goal({ targetAmount: 1000, currentAmount: 1000, monthlyContribution: 50 }))).toBe(0);
    expect(monthsToGoal(goal({ targetAmount: 1000, currentAmount: 1200, monthlyContribution: 0 }))).toBe(0);
  });
  it("sin aporte y falta plata -> null (no div/0)", () => {
    expect(monthsToGoal(goal({ targetAmount: 1000, currentAmount: 200, monthlyContribution: 0 }))).toBeNull();
  });
});

describe("goalTiming", () => {
  const now = new Date("2026-01-15T00:00:00Z");

  it("sin fecha -> no_date, con meses estimados", () => {
    const t = goalTiming(goal({ targetAmount: 1000, monthlyContribution: 100 }), now);
    expect(t.status).toBe("no_date");
    expect(t.estimatedMonths).toBe(10);
  });

  it("a tiempo: la fecha estimada cae antes de la objetivo", () => {
    // faltan 3 meses -> ~abril 2026; objetivo dic 2026 -> a tiempo
    const t = goalTiming(
      goal({ targetAmount: 1000, currentAmount: 100, monthlyContribution: 300, targetDate: "2026-12-31T00:00:00Z" }),
      now,
    );
    expect(t.status).toBe("on_track");
    expect(t.estimatedMonths).toBe(3);
  });

  it("atrasado: la fecha estimada cae después de la objetivo", () => {
    // faltan 10 meses -> ~nov 2026; objetivo marzo 2026 -> atrasado
    const t = goalTiming(
      goal({ targetAmount: 1000, monthlyContribution: 100, targetDate: "2026-03-15T00:00:00Z" }),
      now,
    );
    expect(t.status).toBe("behind");
    expect(t.monthsLate).toBeGreaterThan(0);
  });

  it("con fecha pero sin aporte -> unreachable", () => {
    const t = goalTiming(
      goal({ targetAmount: 1000, currentAmount: 200, monthlyContribution: 0, targetDate: "2026-12-31T00:00:00Z" }),
      now,
    );
    expect(t.status).toBe("unreachable");
    expect(t.estimatedMonths).toBeNull();
  });
});

describe("averageProgress", () => {
  it("promedia el progreso de todas", () => {
    const goals = [
      goal({ targetAmount: 1000, currentAmount: 500 }), // 0.5
      goal({ targetAmount: 1000, currentAmount: 1000 }), // 1.0
    ];
    expect(averageProgress(goals)).toBe(0.75);
  });
  it("sin metas -> 0", () => {
    expect(averageProgress([])).toBe(0);
  });
});

describe("nextGoal", () => {
  it("devuelve la de menor tiempo", () => {
    const a = goal({ name: "A", targetAmount: 1000, monthlyContribution: 100 }); // 10
    const b = goal({ name: "B", targetAmount: 600, monthlyContribution: 300 }); // 2
    const r = nextGoal([a, b]);
    expect(r?.goal.name).toBe("B");
    expect(r?.months).toBe(2);
  });
  it("ignora las no alcanzables (sin aporte)", () => {
    const a = goal({ name: "A", targetAmount: 1000, monthlyContribution: 0 }); // null
    const b = goal({ name: "B", targetAmount: 600, monthlyContribution: 300 }); // 2
    expect(nextGoal([a, b])?.goal.name).toBe("B");
  });
  it("sin metas -> null", () => {
    expect(nextGoal([])).toBeNull();
  });
  it("todas no alcanzables -> null", () => {
    expect(nextGoal([goal({ targetAmount: 1000, monthlyContribution: 0 })])).toBeNull();
  });
});

describe("totalMonthlyContribution", () => {
  it("suma los aportes", () => {
    expect(
      totalMonthlyContribution([
        goal({ monthlyContribution: 300 }),
        goal({ monthlyContribution: 150.5 }),
      ]),
    ).toBe(450.5);
  });
  it("sin metas -> 0", () => {
    expect(totalMonthlyContribution([])).toBe(0);
  });
});
