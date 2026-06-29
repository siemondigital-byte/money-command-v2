/**
 * Lógica del módulo Metas — helpers PUROS (sin DB, sin "use server").
 *
 * El sistema LEE y calcula, no descuenta ni mueve plata. Metas NO toca el
 * flujo mensual ni la consolidación. Las canastas son las doctrinales
 * (essentials/style/freedom, reusadas de lib/expenses).
 *
 * Montos a 2 decimales donde se muestran; los ratios se devuelven como
 * fracción (0.5 = 50%).
 *
 * ----------------------------------------------------------------------------
 * REDISEÑO INTEGRADO (Etapa 2) — ver docs/Diseno_Modulo_Metas_Integrado_*.md
 *
 * El progreso de una meta YA NO se lee de `currentAmount` (deprecado). Ahora el
 * aporte se registra vía GASTOS REALES vinculados (Expense.goalId) y el progreso
 * = suma de esos gastos. La capa nueva vive más abajo, bajo el rótulo
 * "MODELO INTEGRADO". Las funciones de la capa vieja (basadas en currentAmount)
 * se conservan hasta que la Etapa 3 reconecte la UI; quedan marcadas @deprecated.
 * ----------------------------------------------------------------------------
 */

export interface GoalAmounts {
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * @deprecated Capa vieja (basada en currentAmount). Usar `progressReal` con el
 * acumulado de gastos vinculados. Se mantiene hasta que la Etapa 3 reconecte la UI.
 *
 * Progreso de la meta: ahorro actual / monto objetivo, acotado a [0, 1].
 * Si el objetivo es 0, devuelve 0 (sin dividir por cero).
 */
export function progress(g: GoalAmounts): number {
  if (g.targetAmount <= 0) return 0;
  return clamp(g.currentAmount / g.targetAmount, 0, 1);
}

/**
 * @deprecated Capa vieja (currentAmount + monthlyContribution). Usar
 * `dynamicMonthsToGoal` (ritmo real) o el cálculo por plan. Se mantiene hasta
 * que la Etapa 3 reconecte la UI.
 *
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
 * @deprecated Capa vieja (currentAmount). Usar `paceStatus` (plan vs ritmo real).
 * Se mantiene hasta que la Etapa 3 reconecte la UI.
 *
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

/**
 * @deprecated Capa vieja (currentAmount). Usar `averageProgressReal`. Se
 * mantiene hasta que la Etapa 3 reconecte la UI.
 *
 * Progreso promedio de todas las metas (fracción). 0 si no hay metas.
 */
export function averageProgress(goals: GoalAmounts[]): number {
  if (goals.length === 0) return 0;
  const sum = goals.reduce((s, g) => s + progress(g), 0);
  return sum / goals.length;
}

/**
 * @deprecated Capa vieja (currentAmount). La "próxima meta" del modelo nuevo se
 * arma con `dynamicMonthsToGoal` por meta. Se mantiene hasta la Etapa 3.
 *
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

/** Suma de los aportes/cuotas mensuales planeadas a metas (cuota pegajosa). */
export function totalMonthlyContribution(goals: GoalAmounts[]): number {
  return Math.round(goals.reduce((s, g) => s + g.monthlyContribution, 0) * 100) / 100;
}

// ============================================================================
// MODELO INTEGRADO (Etapa 2) — progreso por gastos reales vinculados
//
// El aporte a una meta se registra vía Expense.goalId. El acumulado real es la
// suma de esos gastos (cada uno con su período año/mes). Sobre eso se calcula
// progreso, faltante, ritmo real y proyección dinámica. La cuota "pegajosa"
// (el plan que define la persona) se sigue guardando en Goal.monthlyContribution.
//
// Todo es presentación pura: NO toca la consolidación ni el MonthlyRecord. El
// mismo gasto se cuenta UNA sola vez en su canasta; acá solo se re-lee para
// mostrar el avance de la meta. Cero doble conteo.
// ============================================================================

/** Un aporte real a una meta = un gasto vinculado, con su período y monto. */
export interface MonthlyContribution {
  year: number;
  month: number; // 1-12
  amount: number;
}

/** Acumulado real de la meta: suma de los gastos vinculados. */
export function accumulated(contribs: MonthlyContribution[]): number {
  return round2(contribs.reduce((s, c) => s + c.amount, 0));
}

/** Faltante = monto objetivo − acumulado real (nunca negativo). */
export function remaining(targetAmount: number, acc: number): number {
  return round2(Math.max(0, targetAmount - acc));
}

/**
 * Progreso real de la meta: acumulado / objetivo, acotado a [0, 1].
 * Si el objetivo es 0, devuelve 0 (sin dividir por cero).
 */
export function progressReal(targetAmount: number, acc: number): number {
  if (targetAmount <= 0) return 0;
  return clamp(acc / targetAmount, 0, 1);
}

/** Progreso promedio real de varias metas (fracción). 0 si no hay metas. */
export function averageProgressReal(
  items: { targetAmount: number; accumulated: number }[],
): number {
  if (items.length === 0) return 0;
  const sum = items.reduce(
    (s, i) => s + progressReal(i.targetAmount, i.accumulated),
    0,
  );
  return sum / items.length;
}

/**
 * Meses de plan hasta la fecha objetivo (desde `now`). Mínimo 1.
 *   - Sin fecha: null (sin plazo, no hay "cuota sugerida" temporal).
 *   - Fecha ya pasada o este mes: 1 ("lo compro ya").
 * `now` se inyecta para tests determinísticos.
 */
export function planMonthsFromDate(
  targetDate: string | null,
  now: Date,
): number | null {
  if (!targetDate) return null;
  const target = new Date(targetDate);
  if (Number.isNaN(target.getTime())) return null;
  if (target.getTime() <= now.getTime()) return 1;
  return Math.max(1, monthsBetween(target, now));
}

/**
 * Capa A — Cuota mensual sugerida = monto objetivo ÷ meses del plazo
 * (doc §2/§4). Si el plazo es 1 mes o menos (o no hay plazo), la cuota es el
 * monto completo: es el caso "lo compro ya". Si el objetivo es 0, devuelve 0.
 */
export function suggestedQuota(
  targetAmount: number,
  planMonths: number | null,
): number {
  if (targetAmount <= 0) return 0;
  if (planMonths === null || !Number.isFinite(planMonths) || planMonths <= 1) {
    return round2(targetAmount);
  }
  return round2(targetAmount / planMonths);
}

/**
 * % de la canasta que representa la cuota, sobre el gasto REAL de esa canasta
 * en el período (doc §4). Devuelto como fracción (0.37 = 37%). Si la canasta no
 * tiene gasto (<= 0), devuelve null (no hay base contra la cual comparar).
 */
export function basketSharePct(
  quota: number,
  basketRealSpend: number,
): number | null {
  if (basketRealSpend <= 0) return null;
  return quota / basketRealSpend;
}

// Umbrales de viabilidad (fracción de la canasta que ocupa la cuota).
// DECISIÓN DE PRODUCTO (Andrea), conservador:
//   <= 30% holgado, > 30% y <= 60% ajustado (entra pero aprieta),
//   > 60% inviable / muy exigente (hay que recortar otros gastos o estirar plazo).
export const VIABILITY_HOLGADO_MAX = 0.3;
export const VIABILITY_AJUSTADO_MAX = 0.6;

export type Viability = "holgado" | "ajustado" | "inviable" | "sin_datos";

/**
 * Chequeo de viabilidad (doc §4): compara la cuota necesaria contra el gasto de
 * la canasta. "sin_datos" si la canasta no tiene gasto registrado en el período.
 */
export function viability(quota: number, basketRealSpend: number): Viability {
  if (basketRealSpend <= 0) return "sin_datos";
  const ratio = quota / basketRealSpend;
  if (ratio <= VIABILITY_HOLGADO_MAX) return "holgado";
  if (ratio <= VIABILITY_AJUSTADO_MAX) return "ajustado";
  return "inviable";
}

/**
 * Capa B — aporte promedio reciente (ritmo real). Agrupa los gastos vinculados
 * por mes calendario y promedia sobre los últimos `windowMonths` meses
 * consecutivos del período activo de la meta.
 *
 * DOCTRINA (decisión de Andrea): los meses SIN aporte dentro de la ventana
 * cuentan como CERO, no se excluyen. No aportar baja el ritmo y aleja la meta;
 * la herramienta es realista, no premia el mes vacío. Ej: 300, 0, 300 en los
 * últimos 3 meses -> 200 (no 300).
 *
 * La ventana arranca en el mes más reciente con aporte y va hacia atrás hasta
 * `windowMonths` meses, sin pasar antes del PRIMER aporte (no inventa meses en
 * cero previos a que la meta existiera). Sin aportes: 0.
 */
export function averageRecentContribution(
  contribs: MonthlyContribution[],
  windowMonths = 3,
): number {
  if (contribs.length === 0) return 0;
  const n = Math.max(1, windowMonths);

  // Índice absoluto de mes (year*12 + month-1) para razonar sobre meses
  // consecutivos y detectar los huecos.
  const byIdx = new Map<number, number>();
  for (const c of contribs) {
    const idx = c.year * 12 + (c.month - 1);
    byIdx.set(idx, (byIdx.get(idx) ?? 0) + c.amount);
  }

  const indices = [...byIdx.keys()];
  const latest = Math.max(...indices);
  const earliest = Math.min(...indices);
  // La ventana no se extiende antes del primer aporte: así una meta nueva con un
  // solo mes de aporte no se castiga con ceros previos a su existencia.
  const windowStart = Math.max(earliest, latest - (n - 1));
  const count = latest - windowStart + 1;

  let sum = 0;
  for (let idx = windowStart; idx <= latest; idx++) {
    sum += byIdx.get(idx) ?? 0; // mes sin aporte -> 0
  }
  return round2(sum / count);
}

/**
 * Tiempo estimado dinámico (doc §4) = faltante ÷ aporte promedio reciente.
 *   - Ya completa (faltante <= 0): 0.
 *   - Sin ritmo (aporte promedio <= 0): null (no se alcanza a este ritmo).
 *   - Si no: techo de (faltante / promedio).
 */
export function dynamicMonthsToGoal(input: {
  remaining: number;
  avgContribution: number;
}): number | null {
  if (input.remaining <= 0) return 0;
  if (input.avgContribution <= 0) return null;
  return Math.ceil(input.remaining / input.avgContribution);
}

export type PaceStatus =
  | "adelantada" // a este ritmo llega antes del plazo
  | "en_camino" // llega justo en el plazo
  | "atrasada" // a este ritmo llega después del plazo
  | "sin_datos"; // sin plazo o sin ritmo para comparar

/**
 * Estado vs fecha deseada (doc §4): compara el tiempo estimado dinámico con el
 * plazo del plan. "sin_datos" si falta el plan o el ritmo.
 */
export function paceStatus(
  planMonths: number | null,
  dynamicMonths: number | null,
): PaceStatus {
  if (planMonths === null || dynamicMonths === null) return "sin_datos";
  if (dynamicMonths < planMonths) return "adelantada";
  if (dynamicMonths > planMonths) return "atrasada";
  return "en_camino";
}
