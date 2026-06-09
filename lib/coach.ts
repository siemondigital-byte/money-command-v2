/**
 * Coach de Finanzas — Scorecard de salud financiera (helpers PUROS).
 *
 * Solo LEE y calcula; no toca DB, ni la consolidación, ni el flujo mensual.
 * Cinco métricas 0-100 + un total PONDERADO (Deuda y Fondo de emergencia pesan
 * el doble: son lo urgente). Todo testeable sin Prisma.
 *
 * Las canastas y categorías son las doctrinales del resto de la app
 * (essentials/style/freedom; fixed_income/equity/real_estate/speculative/other).
 */

export type CoachMetricKey =
  | "savings"
  | "debt"
  | "emergency"
  | "investing"
  | "diversification";

export interface CoachMetric {
  key: CoachMetricKey;
  label: string;
  /** Puntaje 0-100 (entero). */
  score: number;
  subtitle: string;
}

export interface Scorecard {
  metrics: CoachMetric[];
  /** Total ponderado 0-100 (entero). */
  total: number;
  /** Etiqueta cualitativa del total. */
  rangeLabel: string;
  /** Mensaje corto que prioriza lo más urgente. */
  priorityMessage: string;
}

export interface CoachDebt {
  name: string;
  balance: number;
  apr: number; // % anual (ej. 24.9)
}

export interface CoachGoal {
  name: string;
  basket: string; // "essentials" | "style" | "freedom"
  currentAmount: number;
}

export interface CoachInvestment {
  capital: number;
  monthlyContribution: number;
  category: string;
}

export interface CoachInputs {
  /** Ingreso del mes activo (consolidado). */
  incomeMonth: number;
  /** Gasto del mes activo (consolidado). */
  expenseMonth: number;
  /** Gasto mensual promedio (histórico) para el fondo de emergencia. */
  avgMonthlyExpense: number;
  debts: CoachDebt[];
  goals: CoachGoal[];
  investments: CoachInvestment[];
}

// ============================================================================
// Pesos y utilidades
// ============================================================================

/** Deuda y emergencia pesan el doble (lo urgente). */
const WEIGHTS: Record<CoachMetricKey, number> = {
  savings: 1,
  debt: 2,
  emergency: 2,
  investing: 1,
  diversification: 1,
};

const LABELS: Record<CoachMetricKey, string> = {
  savings: "Tasa de ahorro",
  debt: "Gestión de deudas",
  emergency: "Fondo de emergencia",
  investing: "Consistencia inversora",
  diversification: "Diversificación",
};

const ACTIONS: Record<CoachMetricKey, string> = {
  savings: "subir tu tasa de ahorro",
  debt: "acelerar el pago de tus deudas",
  emergency: "completar tu fondo de emergencia",
  investing: "configurar aportes mensuales a tus inversiones",
  diversification: "diversificar tu portafolio",
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function score0to100(n: number): number {
  return clamp(Math.round(n), 0, 100);
}

interface MetricResult {
  score: number;
  subtitle: string;
}

// ============================================================================
// 1. Tasa de ahorro — meta 30%
// ============================================================================

export function savingsMetric(income: number, expense: number): MetricResult {
  const rate = income > 0 ? ((income - expense) / income) * 100 : 0;
  const score = score0to100((rate / 30) * 100);
  return { score, subtitle: `${rate.toFixed(0)}% actual · meta 30%` };
}

// ============================================================================
// 2. Gestión de deudas — penaliza saldo alto y APR alto; sin deudas = alto
// ============================================================================

export function debtMetric(debts: CoachDebt[], incomeMonth: number): MetricResult {
  if (debts.length === 0) {
    return { score: 100, subtitle: "Sin deudas — excelente" };
  }
  const totalBalance = debts.reduce((s, d) => s + d.balance, 0);
  const weightedApr =
    totalBalance > 0
      ? debts.reduce((s, d) => s + d.balance * d.apr, 0) / totalBalance
      : 0;

  // Penalización por tasa: APR 30% → -60 (techo). APR 24.9% ≈ -50.
  const aprPenalty = clamp((weightedApr / 30) * 60, 0, 60);

  // Penalización por saldo: relativo al ingreso anual. 1 año de ingreso en
  // deuda → -40 (techo). Sin ingreso cargado pero con deuda → penaliza pleno.
  const annualIncome = incomeMonth * 12;
  const balanceRatio =
    annualIncome > 0 ? totalBalance / annualIncome : totalBalance > 0 ? 1 : 0;
  const balancePenalty = clamp(balanceRatio * 40, 0, 40);

  const score = score0to100(100 - aprPenalty - balancePenalty);

  // Deuda más cara (mayor APR) para el subtítulo.
  const worst = debts.reduce((m, d) => (d.apr > m.apr ? d : m), debts[0]!);
  const subtitle =
    worst.apr > 0
      ? `${worst.name || "Deuda"} al ${worst.apr.toFixed(1)}% APR — acelerar`
      : `${debts.length} deuda${debts.length === 1 ? "" : "s"} sin interés`;

  return { score, subtitle };
}

// ============================================================================
// 3. Fondo de emergencia — meta de canasta Esenciales con "fondo"/"emergencia"
// ============================================================================

export function emergencyMetric(
  goals: CoachGoal[],
  avgMonthlyExpense: number,
): MetricResult {
  const goal = goals.find(
    (g) =>
      g.basket === "essentials" && /fondo|emergencia/i.test(g.name),
  );
  if (!goal) {
    return {
      score: 0,
      subtitle: "definí una meta de fondo de emergencia en Metas",
    };
  }
  if (avgMonthlyExpense <= 0) {
    return {
      score: 0,
      subtitle: "cargá tus gastos para medir los meses cubiertos",
    };
  }
  const months = goal.currentAmount / avgMonthlyExpense;
  const score = score0to100((months / 6) * 100);
  return { score, subtitle: `${months.toFixed(1)} de 6 meses completados` };
}

// ============================================================================
// 4. Consistencia inversora — posiciones con aporte mensual configurado
// ============================================================================

export function investingMetric(investments: CoachInvestment[]): MetricResult {
  if (investments.length === 0) {
    return { score: 0, subtitle: "sin posiciones de inversión" };
  }
  const withContribution = investments.filter(
    (p) => p.monthlyContribution > 0,
  ).length;
  const total = investments.length;
  const score = score0to100((withContribution / total) * 100);

  let subtitle: string;
  if (withContribution === 0) {
    subtitle = "sin aportes mensuales configurados";
  } else if (withContribution === total) {
    subtitle = "aportes mensuales regulares en todas tus posiciones";
  } else {
    subtitle = `${withContribution} de ${total} posiciones con aporte mensual`;
  }
  return { score, subtitle };
}

// ============================================================================
// 5. Diversificación — cantidad de activos y reparto entre tipos
// ============================================================================

export function diversificationMetric(
  investments: CoachInvestment[],
): MetricResult {
  const withCapital = investments.filter((p) => p.capital > 0);
  if (withCapital.length === 0) {
    return { score: 0, subtitle: "sin activos en portafolio" };
  }
  const count = withCapital.length;
  const distinctTypes = new Set(withCapital.map((p) => p.category)).size;

  // 60% del puntaje por variedad de tipos (4 tipos → pleno), 40% por cantidad
  // de activos (5+ → pleno).
  const score = score0to100(
    (distinctTypes / 4) * 60 + (Math.min(count, 5) / 5) * 40,
  );
  const subtitle = `${count} activo${count === 1 ? "" : "s"} en portafolio${
    distinctTypes > 1 ? ` · ${distinctTypes} tipos` : ""
  }`;
  return { score, subtitle };
}

// ============================================================================
// Total ponderado + etiqueta + mensaje de prioridad
// ============================================================================

export function rangeLabel(total: number): string {
  if (total >= 80) return "Salud financiera sólida";
  if (total >= 60) return "Buen progreso";
  if (total >= 40) return "En camino";
  if (total >= 20) return "Necesita atención";
  return "Punto de partida";
}

/**
 * Mensaje de prioridad: arma la acción según las métricas más bajas, ponderando
 * la urgencia (deuda y emergencia pesan el doble). Toma hasta 2.
 */
export function priorityMessage(metrics: CoachMetric[]): string {
  const concerns = metrics
    .map((m) => ({
      key: m.key,
      score: m.score,
      concern: (100 - m.score) * WEIGHTS[m.key],
    }))
    .filter((m) => m.score < 70)
    .sort((a, b) => b.concern - a.concern);

  if (concerns.length === 0) {
    return "Vas muy bien — mantené el rumbo.";
  }
  const top = concerns.slice(0, 2).map((c) => ACTIONS[c.key]);
  return `Prioriza ${top.join(" y ")}.`;
}

export function buildScorecard(input: CoachInputs): Scorecard {
  const results: Record<CoachMetricKey, MetricResult> = {
    savings: savingsMetric(input.incomeMonth, input.expenseMonth),
    debt: debtMetric(input.debts, input.incomeMonth),
    emergency: emergencyMetric(input.goals, input.avgMonthlyExpense),
    investing: investingMetric(input.investments),
    diversification: diversificationMetric(input.investments),
  };

  const order: CoachMetricKey[] = [
    "savings",
    "debt",
    "emergency",
    "investing",
    "diversification",
  ];

  const metrics: CoachMetric[] = order.map((key) => ({
    key,
    label: LABELS[key],
    score: results[key].score,
    subtitle: results[key].subtitle,
  }));

  const totalWeight = order.reduce((s, key) => s + WEIGHTS[key], 0);
  const total = score0to100(
    metrics.reduce((s, m) => s + m.score * WEIGHTS[m.key], 0) / totalWeight,
  );

  return {
    metrics,
    total,
    rangeLabel: rangeLabel(total),
    priorityMessage: priorityMessage(metrics),
  };
}
