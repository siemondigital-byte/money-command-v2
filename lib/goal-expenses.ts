/**
 * Generación automática del gasto de una meta (rediseño Metas, Etapa 3b).
 *
 * Una meta "pegajosa" genera, cada mes, un gasto real en su canasta por el valor
 * de su cuota (monthlyContribution). Ese gasto cuenta en la canasta como
 * cualquier gasto (entra a la consolidación) y queda vinculado a la meta por
 * `goalId`. El progreso de la meta = suma de esos gastos vinculados.
 *
 * Este módulo separa, como lib/monthly.ts:
 *   - `decideGoalExpense(...)` — LÓGICA PURA (sin DB), testeable. Decide, para un
 *     período dado, si hay que crear/actualizar/saltar el gasto de la meta, con
 *     qué monto, y si la meta queda completada.
 *   - `syncAutomaticGoalExpenses(...)` — wrapper con acceso a DB que aplica la
 *     decisión. Existe para el próximo sub-paso (3b-ii) pero NO está cableado a
 *     ningún disparador todavía: nada lo llama en producción, no genera gastos.
 *
 * Reglas (decisiones de Andrea, doc §1.d / §3b):
 *   - Forward-only: solo el período pasado (mes actual / activo). El guard impide
 *     generar antes de que la meta existiera (createdAt) o en el futuro. NUNCA
 *     backfill de meses pasados no vividos.
 *   - Anti-overshoot: la última cuota se recorta al faltante y la meta se marca
 *     completada (isAchieved).
 *   - Cuota pegajosa: si cambia la cuota, en el período activo el gasto se
 *     reconcilia al nuevo monto; los meses anteriores ya generados NO se tocan.
 *   - Cuota 0 / meta pausada (isActive=false) / completada (isAchieved): no genera.
 *
 * NO toca lib/monthly.ts (consolidación) ni lib/expenses.ts. La consolidación
 * levanta el gasto generado por el flujo normal (mismo basket/year/month/amount).
 */

import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { classificationFromBasket, type Basket } from "./expenses";
import type { Period } from "./monthly";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Índice absoluto de mes (year*12 + (mes-1)) para comparar períodos. */
function monthIndex(year: number, month1to12: number): number {
  return year * 12 + (month1to12 - 1);
}

/** Índice absoluto de mes de una fecha (getMonth() ya es 0-based). */
function monthIndexOfDate(d: Date): number {
  return d.getFullYear() * 12 + d.getMonth();
}

// ============================================================================
// Lógica pura de decisión (testeable, sin DB)
// ============================================================================

export interface GoalState {
  monthlyContribution: number;
  targetAmount: number;
  isActive: boolean;
  isAchieved: boolean;
  /** Fecha de creación de la meta: ancla el primer mes que puede generar. */
  createdAt: Date;
}

export interface DecideInput {
  goal: GoalState;
  /** Período objetivo (mes activo / actual). */
  period: Period;
  /** Mes calendario actual (tope superior del guard). Inyectable para tests. */
  now: Date;
  /**
   * Acumulado real de la meta en OTROS períodos (suma de gastos vinculados que
   * NO son del período objetivo). El gasto del período objetivo, si existe, va
   * por separado en `existingAmount`, para reconciliar sin doble contar.
   */
  accumulatedOther: number;
  /** Monto del gasto-meta ya existente en el período objetivo, o null si no hay. */
  existingAmount: number | null;
}

export type SkipReason =
  | "paused" // isActive = false
  | "achieved" // isAchieved = true
  | "no_contribution" // cuota <= 0
  | "before_start" // período anterior al mes de creación de la meta
  | "future" // período posterior al mes calendario actual
  | "already_funded"; // el acumulado ya alcanza el objetivo

export type GoalExpenseDecision =
  | { action: "skip"; reason: SkipReason; markAchieved: boolean }
  | { action: "create"; amount: number; markAchieved: boolean }
  | { action: "update"; amount: number; markAchieved: boolean }
  | { action: "noop"; markAchieved: boolean };

/**
 * Decide qué hacer con el gasto de una meta para un período. Pura: no toca DB.
 */
export function decideGoalExpense(input: DecideInput): GoalExpenseDecision {
  const { goal, period, now, accumulatedOther, existingAmount } = input;

  if (!goal.isActive) return { action: "skip", reason: "paused", markAchieved: false };
  if (goal.isAchieved) return { action: "skip", reason: "achieved", markAchieved: false };
  if (goal.monthlyContribution <= 0)
    return { action: "skip", reason: "no_contribution", markAchieved: false };

  const pIdx = monthIndex(period.year, period.month);
  const startIdx = monthIndexOfDate(goal.createdAt);
  const nowIdx = monthIndexOfDate(now);
  if (pIdx < startIdx) return { action: "skip", reason: "before_start", markAchieved: false };
  if (pIdx > nowIdx) return { action: "skip", reason: "future", markAchieved: false };

  const remaining = round2(goal.targetAmount - accumulatedOther);
  // Ya financiada por otros períodos: no generar, y marcar completada.
  if (remaining <= 0) return { action: "skip", reason: "already_funded", markAchieved: true };

  // Anti-overshoot: la cuota nunca supera el faltante.
  const amount = round2(Math.min(goal.monthlyContribution, remaining));
  // Esta cuota completa la meta si el acumulado + este aporte llega al objetivo.
  const markAchieved = round2(accumulatedOther + amount) >= goal.targetAmount;

  if (existingAmount === null) {
    return { action: "create", amount, markAchieved };
  }
  // Idempotencia: si el gasto del período ya tiene el monto correcto, no tocar.
  if (round2(existingAmount) === amount) {
    return { action: "noop", markAchieved };
  }
  // Cambio de cuota en el período activo: reconciliar al nuevo monto.
  return { action: "update", amount, markAchieved };
}

// ============================================================================
// Wrapper con acceso a DB (NO cableado a ningún disparador en 3b-i)
// ============================================================================

function dec(n: number): Prisma.Decimal {
  return new Prisma.Decimal(round2(n));
}

export interface SyncResult {
  created: number;
  updated: number;
  achieved: number;
}

/**
 * Asegura el gasto de cada meta automática para `period`, idempotente.
 *
 * IMPORTANTE (3b-i): esta función EXISTE pero todavía no la invoca nada en
 * producción. El cableado a disparadores (cambio de período, acciones de meta,
 * sync-on-entry) es el sub-paso 3b-ii. No mutar desde el render de Server
 * Components: usar solo desde Server Actions.
 *
 * `now` se inyecta para tests / determinismo (tope del guard forward-only).
 */
export async function syncAutomaticGoalExpenses(
  userId: string,
  period: Period,
  now: Date = new Date(),
): Promise<SyncResult> {
  const goals = await prisma.goal.findMany({
    where: { userId, isActive: true, isAchieved: false },
  });

  const result: SyncResult = { created: 0, updated: 0, achieved: 0 };

  for (const g of goals) {
    const linked = await prisma.expense.findMany({
      where: { userId, goalId: g.id, isActive: true },
      select: { id: true, year: true, month: true, amount: true },
    });

    const inPeriod =
      linked.find((e) => e.year === period.year && e.month === period.month) ?? null;
    const accumulatedOther = linked
      .filter((e) => !(e.year === period.year && e.month === period.month))
      .reduce((s, e) => s + Number(e.amount), 0);

    const decision = decideGoalExpense({
      goal: {
        monthlyContribution: Number(g.monthlyContribution),
        targetAmount: Number(g.targetAmount),
        isActive: g.isActive,
        isAchieved: g.isAchieved,
        createdAt: g.createdAt,
      },
      period,
      now,
      accumulatedOther,
      existingAmount: inPeriod ? Number(inPeriod.amount) : null,
    });

    if (decision.action === "create") {
      await prisma.expense.create({
        data: {
          userId,
          name: g.name,
          category: "meta",
          type: "fixed",
          basket: g.basket,
          // Columna legacy NOT NULL, derivada del basket (consistencia con Expenses).
          classification: classificationFromBasket(g.basket as Basket),
          periodicity: "monthly",
          budget: dec(decision.amount),
          amount: dec(decision.amount),
          year: period.year,
          month: period.month,
          goalId: g.id,
        },
      });
      result.created++;
    } else if (decision.action === "update" && inPeriod) {
      await prisma.expense.update({
        where: { id: inPeriod.id },
        data: { amount: dec(decision.amount), budget: dec(decision.amount) },
      });
      result.updated++;
    }

    if (decision.markAchieved) {
      await prisma.goal.update({
        where: { id: g.id },
        data: { isAchieved: true, achievedAt: now },
      });
      result.achieved++;
    }
  }

  return result;
}
