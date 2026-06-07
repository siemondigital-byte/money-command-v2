/**
 * Lógica del módulo Metas (capa A) — helpers PUROS (sin DB, sin "use server").
 *
 * El sistema LEE y calcula, no descuenta ni mueve plata. Metas NO toca el
 * flujo mensual ni la consolidación. Las canastas son las doctrinales
 * (essentials/style/freedom, reusadas de lib/expenses).
 *
 * Montos a 2 decimales donde se muestran; los ratios se devuelven como
 * fracción (0.5 = 50%).
 */

export interface GoalAmounts {
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Progreso de la meta: ahorro actual / monto objetivo, acotado a [0, 1].
 * Si el objetivo es 0, devuelve 0 (sin dividir por cero).
 */
export function progress(g: GoalAmounts): number {
  if (g.targetAmount <= 0) return 0;
  return clamp(g.currentAmount / g.targetAmount, 0, 1);
}

/**
 * Meses para alcanzar la meta al ritmo del aporte mensual.
 *   - Ya completa (current >= target): 0.
 *   - Falta plata y el aporte es 0 (o negativo): null (no se alcanza).
 *   - Si no: techo de (restante / aporte).
 */
export function monthsToGoal(g: GoalAmounts): number | null {
  const remaining = g.targetAmount - g.currentAmount;
  if (remaining <= 0) return 0;
  if (g.monthlyContribution <= 0) return null;
  return Math.ceil(remaining / g.monthlyContribution);
}

export type GoalTimingStatus =
  | "no_date" // sin fecha objetivo
  | "unreachable" // con fecha pero sin aporte, no se alcanza
  | "on_track" // llega antes o justo a la fecha
  | "behind"; // llega después de la fecha

export interface GoalTiming {
  status: GoalTimingStatus;
  /** Meses estimados hasta alcanzar la meta (null si no se alcanza). */
  estimatedMonths: number | null;
  /** Meses de atraso respecto a la fecha objetivo (solo si status === "behind"). */
  monthsLate?: number;
}

/** Suma `months` meses a una fecha (sin mutar la original). */
function addMonths(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  d.setMonth(d.getMonth() + months);
  return d;
}

/** Diferencia en meses (enteros, redondeo hacia arriba) entre dos fechas a >= b. */
function monthsBetween(a: Date, b: Date): number {
  const months =
    (a.getFullYear() - b.getFullYear()) * 12 + (a.getMonth() - b.getMonth());
  // Ajuste por día del mes para no subestimar el atraso.
  const adjusted = a.getDate() > b.getDate() ? months + 1 : months;
  return Math.max(0, adjusted);
}

/**
 * Estado de la meta respecto a su fecha objetivo. Solo aplica si hay
 * targetDate. `now` se inyecta para tests determinísticos.
 */
export function goalTiming(
  g: GoalAmounts & { targetDate: string | null },
  now: Date,
): GoalTiming {
  const estimatedMonths = monthsToGoal(g);

  if (!g.targetDate) {
    return { status: "no_date", estimatedMonths };
  }
  if (estimatedMonths === null) {
    return { status: "unreachable", estimatedMonths: null };
  }

  const target = new Date(g.targetDate);
  const estimatedDate = addMonths(now, estimatedMonths);

  if (estimatedDate.getTime() <= target.getTime()) {
    return { status: "on_track", estimatedMonths };
  }
  return {
    status: "behind",
    estimatedMonths,
    monthsLate: monthsBetween(estimatedDate, target),
  };
}

/** Progreso promedio de todas las metas (fracción). 0 si no hay metas. */
export function averageProgress(goals: GoalAmounts[]): number {
  if (goals.length === 0) return 0;
  const sum = goals.reduce((s, g) => s + progress(g), 0);
  return sum / goals.length;
}

/**
 * La meta que se alcanza antes (menor monthsToGoal alcanzable). Devuelve la
 * meta y sus meses. null si no hay metas alcanzables.
 */
export function nextGoal<T extends GoalAmounts>(
  goals: T[],
): { goal: T; months: number } | null {
  let best: { goal: T; months: number } | null = null;
  for (const goal of goals) {
    const months = monthsToGoal(goal);
    if (months === null) continue; // no alcanzable
    if (best === null || months < best.months) {
      best = { goal, months };
    }
  }
  return best;
}

/** Suma de los aportes mensuales a metas. */
export function totalMonthlyContribution(goals: GoalAmounts[]): number {
  return Math.round(goals.reduce((s, g) => s + g.monthlyContribution, 0) * 100) / 100;
}
