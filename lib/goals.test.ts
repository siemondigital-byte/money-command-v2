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
  accumulated,
  remaining,
  progressReal,
  averageProgressReal,
  planMonthsFromDate,
  suggestedQuota,
  basketSharePct,
  viability,
  averageRecentContribution,
  dynamicMonthsToGoal,
  paceStatus,
  type MonthlyContribution,
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

// ============================================================================
// MODELO INTEGRADO (Etapa 2) — progreso por gastos reales vinculados
// ============================================================================

const contribs = (
  rows: Array<[number, number, number]>, // [year, month, amount]
): MonthlyContribution[] => rows.map(([year, month, amount]) => ({ year, month, amount }));

describe("accumulated", () => {
  it("suma los gastos vinculados (2 decimales)", () => {
    expect(accumulated(contribs([[2026, 1, 100], [2026, 2, 50.25], [2026, 3, 49.75]]))).toBe(200);
  });
  it("sin aportes -> 0", () => {
    expect(accumulated([])).toBe(0);
  });
});

describe("remaining", () => {
  it("objetivo - acumulado", () => {
    expect(remaining(1000, 300)).toBe(700);
  });
  it("nunca negativo (acumulado supera objetivo)", () => {
    expect(remaining(1000, 1200)).toBe(0);
  });
});

describe("progressReal", () => {
  it("acumulado / objetivo", () => {
    expect(progressReal(1000, 250)).toBe(0.25);
  });
  it("objetivo 0 -> 0 (sin dividir por cero)", () => {
    expect(progressReal(0, 500)).toBe(0);
  });
  it("se clampea a 100%", () => {
    expect(progressReal(1000, 1500)).toBe(1);
  });
});

describe("averageProgressReal", () => {
  it("promedia el progreso real de varias metas", () => {
    expect(
      averageProgressReal([
        { targetAmount: 1000, accumulated: 500 }, // 0.5
        { targetAmount: 1000, accumulated: 1000 }, // 1.0
      ]),
    ).toBe(0.75);
  });
  it("sin metas -> 0", () => {
    expect(averageProgressReal([])).toBe(0);
  });
});

describe("planMonthsFromDate", () => {
  const now = new Date("2026-01-15T00:00:00Z");
  it("sin fecha -> null", () => {
    expect(planMonthsFromDate(null, now)).toBeNull();
  });
  it("fecha futura -> meses hasta la fecha", () => {
    // ene 2026 -> nov 2026 ~ 10 meses
    expect(planMonthsFromDate("2026-11-15T00:00:00Z", now)).toBe(10);
  });
  it("fecha pasada o este mes -> 1 (lo compro ya)", () => {
    expect(planMonthsFromDate("2025-12-01T00:00:00Z", now)).toBe(1);
  });
  it("fecha inválida -> null", () => {
    expect(planMonthsFromDate("no-es-fecha", now)).toBeNull();
  });
});

describe("suggestedQuota", () => {
  it("objetivo / meses del plazo", () => {
    expect(suggestedQuota(3000, 10)).toBe(300);
  });
  it("plazo de 1 mes o menos -> monto completo (lo compro ya)", () => {
    expect(suggestedQuota(3000, 1)).toBe(3000);
  });
  it("sin plazo (null) -> monto completo", () => {
    expect(suggestedQuota(3000, null)).toBe(3000);
  });
  it("objetivo 0 -> 0", () => {
    expect(suggestedQuota(0, 10)).toBe(0);
  });
});

describe("basketSharePct", () => {
  it("cuota / gasto real de la canasta (fracción)", () => {
    expect(basketSharePct(300, 820)).toBeCloseTo(0.3659, 4);
  });
  it("canasta sin gasto -> null", () => {
    expect(basketSharePct(300, 0)).toBeNull();
  });
});

describe("viability", () => {
  it("holgado: cuota <= 30% de la canasta", () => {
    expect(viability(200, 800)).toBe("holgado"); // 25%
    expect(viability(240, 800)).toBe("holgado"); // 30% exacto (borde)
  });
  it("ajustado: entre 30% y 60%", () => {
    expect(viability(300, 820)).toBe("ajustado"); // ~37%
    expect(viability(480, 800)).toBe("ajustado"); // 60% exacto (borde)
  });
  it("inviable: más del 60% de la canasta", () => {
    expect(viability(500, 800)).toBe("inviable"); // 62.5%
    expect(viability(600, 820)).toBe("inviable"); // ~73%
  });
  it("sin gasto en la canasta -> sin_datos", () => {
    expect(viability(300, 0)).toBe("sin_datos");
  });
});

describe("averageRecentContribution", () => {
  it("promedia los últimos 3 meses consecutivos (ventana default 3)", () => {
    // 4 meses consecutivos; ventana 3 -> (200+300+250)/3 = 250
    const c = contribs([[2026, 1, 999], [2026, 2, 200], [2026, 3, 300], [2026, 4, 250]]);
    expect(averageRecentContribution(c)).toBe(250);
  });
  it("los meses SIN aporte cuentan como 0 (300, 0, 300 -> 200)", () => {
    // ene=300, feb sin aporte (hueco), mar=300; ventana 3 -> (300+0+300)/3 = 200
    const c = contribs([[2026, 1, 300], [2026, 3, 300]]);
    expect(averageRecentContribution(c)).toBe(200);
  });
  it("un hueco más largo baja más el ritmo (300, 0, 0 -> 100)", () => {
    // ene=300, feb y mar sin aporte; ventana 3 -> (300+0+0)/3 = 100
    const c = contribs([[2026, 1, 300], [2026, 3, 0]]);
    expect(averageRecentContribution(c)).toBe(100);
  });
  it("no inventa ceros antes del primer aporte (meta nueva con un mes)", () => {
    // un solo mes de aporte: ritmo = ese aporte, no se castiga con ceros previos
    const c = contribs([[2026, 4, 300]]);
    expect(averageRecentContribution(c)).toBe(300);
  });
  it("suma varios gastos dentro del mismo mes", () => {
    const c = contribs([[2026, 3, 100], [2026, 3, 200]]);
    expect(averageRecentContribution(c)).toBe(300);
  });
  it("sin aportes -> 0", () => {
    expect(averageRecentContribution([])).toBe(0);
  });
  it("respeta una ventana custom", () => {
    const c = contribs([[2026, 1, 100], [2026, 2, 400]]);
    expect(averageRecentContribution(c, 1)).toBe(400); // solo el más reciente
  });
});

describe("dynamicMonthsToGoal", () => {
  it("faltante / aporte promedio, techo", () => {
    // 900 / 300 = 3
    expect(dynamicMonthsToGoal({ remaining: 900, avgContribution: 300 })).toBe(3);
  });
  it("redondea hacia arriba", () => {
    expect(dynamicMonthsToGoal({ remaining: 1000, avgContribution: 300 })).toBe(4);
  });
  it("ya completa -> 0", () => {
    expect(dynamicMonthsToGoal({ remaining: 0, avgContribution: 300 })).toBe(0);
  });
  it("sin ritmo y falta plata -> null (no div/0)", () => {
    expect(dynamicMonthsToGoal({ remaining: 500, avgContribution: 0 })).toBeNull();
  });
});

describe("paceStatus", () => {
  it("a este ritmo llega antes -> adelantada", () => {
    expect(paceStatus(10, 7)).toBe("adelantada");
  });
  it("llega justo -> en_camino", () => {
    expect(paceStatus(10, 10)).toBe("en_camino");
  });
  it("a este ritmo llega después -> atrasada", () => {
    expect(paceStatus(10, 15)).toBe("atrasada");
  });
  it("sin plan o sin ritmo -> sin_datos", () => {
    expect(paceStatus(null, 5)).toBe("sin_datos");
    expect(paceStatus(10, null)).toBe("sin_datos");
  });
});
