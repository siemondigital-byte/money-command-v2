/**
 * Lógica del módulo Income.
 *
 * El Plan B (ingreso pasivo) consume del módulo Investments como fuente
 * única de verdad. Acá vive la regla de "qué Plan B mostrar":
 *
 *   - Si el usuario activó override manual y dejó un monto → manda el override.
 *   - Si no → manda el cálculo automático (Σ posición.capital × yield / 12).
 *
 * El override no duplica datos: el cálculo automático sigue siendo la fórmula
 * canónica. El override es solo un escape explícito por usuario (ej. su Plan B
 * real difiere por reinversión, retención fiscal, o ingresos no modelados).
 */

import { monthlyPlanB, type PortfolioPosition } from "./formulas";

export type PlanBSource = "auto" | "manual";

export interface PlanBResult {
  amount: number;
  source: PlanBSource;
  /** El cálculo automático, expuesto siempre para mostrar al usuario el contraste. */
  autoAmount: number;
}

export interface EffectivePlanBInput {
  positions: PortfolioPosition[];
  manualOverride: boolean;
  manualAmount: number | null;
}

/**
 * Resuelve el Plan B "efectivo" según override del usuario.
 *
 * Regla canónica del Sprint 2:
 *   - manualOverride === true y manualAmount válido → manual gana.
 *   - cualquier otro caso → auto desde Investments.
 *
 * Si manualOverride === true pero manualAmount es null, se devuelve manual:0
 * (forzando al usuario a setear un valor; la UI debe pedir el monto).
 */
export function effectivePlanB(input: EffectivePlanBInput): PlanBResult {
  const autoAmount = monthlyPlanB(input.positions);
  if (input.manualOverride) {
    return {
      amount: input.manualAmount ?? 0,
      source: "manual",
      autoAmount,
    };
  }
  return { amount: autoAmount, source: "auto", autoAmount };
}

/**
 * Totales del módulo Income.
 *
 * planA: suma de filas activas con plan === "A".
 * planC: suma de filas activas con plan === "C".
 * planB: viene de effectivePlanB() — NO se calcula desde Income filas.
 */
export interface IncomeRow {
  plan: string; // "A" | "C"
  amount: number;
  isActive: boolean;
}

export interface IncomeTotals {
  planA: number;
  planB: number;
  planC: number;
  total: number;
  /** Porcentaje del total que viene de Plan B (ingreso pasivo). */
  passiveShare: number;
}

export function incomeTotals(rows: IncomeRow[], planB: number): IncomeTotals {
  const planA = rows
    .filter((r) => r.isActive && r.plan === "A")
    .reduce((s, r) => s + r.amount, 0);
  const planC = rows
    .filter((r) => r.isActive && r.plan === "C")
    .reduce((s, r) => s + r.amount, 0);
  const total = planA + planB + planC;
  const passiveShare = total > 0 ? planB / total : 0;
  return { planA, planB, planC, total, passiveShare };
}

/**
 * Capital "ideal" a destinar a inversión por mes según el método preferido
 * del usuario (50/30/20, 50/25/25, 50/20/30, 40/20/40).
 *
 * El método define el porcentaje a "Libertad" (inversión + ahorro + pago
 * de deuda extra). Esta función devuelve cuánto representa eso sobre el
 * total mensual de ingresos.
 *
 * Convención del usuario: el TERCER número del método es el de Libertad.
 */
export function idealMonthlyInvestmentCapital(
  totalIncome: number,
  preferredMethod: string,
): number {
  const parts = preferredMethod.split("/").map((s) => Number(s.trim()));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) {
    return 0;
  }
  const freedomPct = parts[2]! / 100;
  return totalIncome * freedomPct;
}
