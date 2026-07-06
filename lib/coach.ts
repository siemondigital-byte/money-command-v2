/**
 * Coach de Finanzas — Scorecard de salud financiera (helpers PUROS).
 *
 * Solo LEE y calcula; no toca DB, ni la consolidación, ni el flujo mensual.
 * Fórmula oficial por PUNTOS FIJOS que suman 100:
 *   1. Tasa de ahorro            — 30 pts (por tramos)
 *   2. Fondo de emergencia       — 20 pts (meses cubiertos / 6)
 *   3. Ratio deuda/ingreso       — 20 pts (por tramos)
 *   4. Diversificación           — 15 pts (tipos con peso >5%)
 *   5. Progreso a libertad       — 15 pts (patrimonio neto / NLF)
 * El total es la suma (0-100). Patrimonio neto y Número de Libertad se reciben
 * ya calculados por la app (no se recalculan acá). Texto en TUTEO.
 */

export type CoachMetricKey =
  | "savings"
  | "emergency"
  | "debt"
  | "diversification"
  | "freedom";

export interface CoachMetric {
  key: CoachMetricKey;
  label: string;
  /** Puntos obtenidos (0..max). */
  score: number;
  /** Puntos máximos de esta métrica. */
  max: number;
  subtitle: string;
}

export interface Scorecard {
  metrics: CoachMetric[];
  /** Total = suma de los 5 (0-100). */
  total: number;
  /** Etiqueta cualitativa por rango (Excepcional…Es ahora o nunca). */
  rangeLabel: string;
  /** Mensaje exacto por rango. */
  message: string;
}

export interface CoachDebt {
  name: string;
  apr: number; // % anual (ej. 24.9)
  currentPayment: number; // pago mensual real
}

export interface CoachGoal {
  name: string;
  basket: string; // "essentials" | "style" | "freedom"
  currentAmount: number;
}

export interface CoachInvestment {
  capital: number;
  category: string;
}

export interface CoachInputs {
  incomeMonth: number;
  expenseMonth: number;
  avgMonthlyExpense: number;
  /** Patrimonio neto (el mismo que usa el Dashboard). */
  netWorth: number;
  /** Número de Libertad Financiera (calculado por la app). */
  nlf: number;
  debts: CoachDebt[];
  goals: CoachGoal[];
  investments: CoachInvestment[];
}

// ============================================================================
// Constantes
// ============================================================================

const MAX: Record<CoachMetricKey, number> = {
  savings: 30,
  emergency: 20,
  debt: 20,
  diversification: 15,
  freedom: 15,
};

// ----------------------------------------------------------------------------
// Textos por idioma. El cálculo (scores) NO depende del locale; solo el texto
// que se muestra (labels, subtítulos, mensajes de rango). Default "es" para que
// los tests (que llaman sin locale) sigan verdes; "en" es aditivo.
// ----------------------------------------------------------------------------

export type CoachLocale = "es" | "en";

interface Range {
  min: number;
  label: string;
  message: string;
}

interface CoachStrings {
  labels: Record<CoachMetricKey, string>;
  savings: (rate: number) => string;
  emergencyNoGoal: string;
  emergencyNoExpense: string;
  emergencyMonths: (months: number) => string;
  debtName: string;
  debtNoDebts: string;
  debtNoIncome: string;
  debtRatio: (ratioPct: number) => string;
  debtWorst: (name: string, apr: number) => string;
  diversificationNoAssets: string;
  diversification: (assets: number, types: number) => string;
  freedomNoNlf: string;
  freedomProgress: (pct: number) => string;
  ranges: Range[];
}

const STRINGS: Record<CoachLocale, CoachStrings> = {
  es: {
    labels: {
      savings: "Tasa de ahorro",
      emergency: "Fondo de emergencia",
      debt: "Ratio deuda/ingreso",
      diversification: "Diversificación de portafolio",
      freedom: "Progreso a libertad financiera",
    },
    savings: (rate) => `${rate.toFixed(0)}% actual · meta 30%`,
    emergencyNoGoal: "define una meta de fondo de emergencia en Metas",
    emergencyNoExpense: "carga tus egresos para medir los meses cubiertos",
    emergencyMonths: (m) => `${m} de 6 meses completados`,
    debtName: "Deuda",
    debtNoDebts: "Sin deudas — ratio 0%",
    debtNoIncome: "carga tus ingresos para medir el ratio deuda/ingreso",
    debtRatio: (r) => `Ratio deuda/ingreso: ${r}%`,
    debtWorst: (name, apr) => ` · ${name} al ${apr}% — acelerar`,
    diversificationNoAssets: "sin activos en portafolio",
    diversification: (a, t) =>
      `${a} activo${a === 1 ? "" : "s"} · ${t} tipo${t === 1 ? "" : "s"}`,
    freedomNoNlf: "carga tus egresos para calcular tu Número de Libertad",
    freedomProgress: (pct) => `${pct}% del camino a tu Número de Libertad`,
    ranges: [
      {
        min: 90,
        label: "Excepcional",
        message:
          "Tu salud financiera es excepcional. Estás en el 1% que aplica el sistema con consistencia. Mantén el ritmo y acelera las palancas que ya dominas.",
      },
      {
        min: 75,
        label: "Vas en serio",
        message:
          "Salud financiera excelente. Tienes los cimientos firmes. Tu próximo nivel está en optimizar la palanca con menor puntaje individual.",
      },
      {
        min: 60,
        label: "Bien, pero te falta",
        message:
          "Salud financiera buena. Estás avanzando, pero hay áreas claras de mejora. Identifica la palanca más débil y enfócate ahí este mes.",
      },
      {
        min: 40,
        label: "Te estás quedando corto",
        message:
          "Tu salud financiera necesita atención. No es crisis, pero estás dejando años de libertad sobre la mesa. Prioridad: completar fondo de emergencia y subir tasa de ahorro al 20%.",
      },
      {
        min: 20,
        label: "Así no llegas",
        message:
          "Estás en zona de alerta. Esto se soluciona con sistema, no con suerte. Empieza por reducir deuda de consumo y construir fondo de emergencia. No mires el largo plazo todavía, enfócate en estabilizar.",
      },
      {
        min: 0,
        label: "Es ahora o nunca",
        message:
          "Estás en crisis financiera. Necesitas actuar esta semana. Pasos: 1) Lista todas tus deudas y sus APR. 2) Corta cualquier egreso no esencial. 3) Busca ingreso adicional inmediato. El sistema funciona, pero hay que empezar por la base.",
      },
    ],
  },
  en: {
    labels: {
      savings: "Savings rate",
      emergency: "Emergency fund",
      debt: "Debt-to-income ratio",
      diversification: "Portfolio diversification",
      freedom: "Progress to financial freedom",
    },
    savings: (rate) => `${rate.toFixed(0)}% current · target 30%`,
    emergencyNoGoal: "set an emergency-fund goal in Goals",
    emergencyNoExpense: "load your expenses to measure the months covered",
    emergencyMonths: (m) => `${m} of 6 months completed`,
    debtName: "Debt",
    debtNoDebts: "No debt — 0% ratio",
    debtNoIncome: "load your income to measure the debt-to-income ratio",
    debtRatio: (r) => `Debt-to-income ratio: ${r}%`,
    debtWorst: (name, apr) => ` · ${name} at ${apr}% — accelerate`,
    diversificationNoAssets: "no assets in portfolio",
    diversification: (a, t) =>
      `${a} asset${a === 1 ? "" : "s"} · ${t} type${t === 1 ? "" : "s"}`,
    freedomNoNlf: "load your expenses to calculate your Freedom Number",
    freedomProgress: (pct) => `${pct}% of the way to your Freedom Number`,
    ranges: [
      {
        min: 90,
        label: "Exceptional",
        message:
          "Your financial health is exceptional. You're in the 1% who apply the system consistently. Keep the pace and accelerate the levers you already master.",
      },
      {
        min: 75,
        label: "You mean business",
        message:
          "Excellent financial health. Your foundations are solid. Your next level is optimizing the single lowest-scoring lever.",
      },
      {
        min: 60,
        label: "Good, but not there yet",
        message:
          "Good financial health. You're making progress, but there are clear areas to improve. Identify your weakest lever and focus there this month.",
      },
      {
        min: 40,
        label: "Falling short",
        message:
          "Your financial health needs attention. It's not a crisis, but you're leaving years of freedom on the table. Priority: complete your emergency fund and raise your savings rate to 20%.",
      },
      {
        min: 20,
        label: "This won't get you there",
        message:
          "You're in the warning zone. This is fixed with a system, not luck. Start by cutting consumer debt and building an emergency fund. Don't look at the long term yet — focus on stabilizing.",
      },
      {
        min: 0,
        label: "It's now or never",
        message:
          "You're in a financial crisis. You need to act this week. Steps: 1) List all your debts and their APRs. 2) Cut any non-essential expense. 3) Find immediate extra income. The system works, but you have to start from the base.",
      },
    ],
  },
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/** APR al entero más cercano para mostrar sin decimales (24.9 → 25). */
function fmtApr(apr: number): number {
  return Math.round(apr);
}

interface MetricResult {
  score: number;
  subtitle: string;
}

// ============================================================================
// 1. Tasa de ahorro — 30 pts (por tramos)
// ============================================================================

export function savingsMetric(
  income: number,
  expense: number,
  locale: CoachLocale = "es",
): MetricResult {
  const rate = income > 0 ? ((income - expense) / income) * 100 : 0;
  let score: number;
  if (rate >= 30) score = 30;
  else if (rate >= 20) score = 27;
  else if (rate >= 10) score = 20;
  else if (rate >= 5) score = 10;
  else score = 0;
  return { score, subtitle: STRINGS[locale].savings(rate) };
}

// ============================================================================
// 2. Fondo de emergencia — 20 pts (meses cubiertos / 6)
// ============================================================================

export function emergencyMetric(
  goals: CoachGoal[],
  avgMonthlyExpense: number,
  locale: CoachLocale = "es",
): MetricResult {
  const S = STRINGS[locale];
  const goal = goals.find(
    (g) =>
      g.basket === "essentials" && /fondo|emergencia|emergency/i.test(g.name),
  );
  if (!goal) {
    return { score: 0, subtitle: S.emergencyNoGoal };
  }
  if (avgMonthlyExpense <= 0) {
    return { score: 0, subtitle: S.emergencyNoExpense };
  }
  const months = goal.currentAmount / avgMonthlyExpense;
  const score = Math.round(clamp((months / 6) * 20, 0, 20));
  return { score, subtitle: S.emergencyMonths(Math.round(months)) };
}

// ============================================================================
// 3. Ratio deuda/ingreso — 20 pts (por tramos)
// ============================================================================

export function debtMetric(
  debts: CoachDebt[],
  incomeMonth: number,
  locale: CoachLocale = "es",
): MetricResult {
  const S = STRINGS[locale];
  const payments = debts.reduce((s, d) => s + d.currentPayment, 0);

  if (incomeMonth <= 0) {
    if (payments <= 0) {
      return { score: 20, subtitle: S.debtNoDebts };
    }
    return { score: 0, subtitle: S.debtNoIncome };
  }

  const ratio = (payments / incomeMonth) * 100;
  let score: number;
  if (ratio >= 50) score = 0;
  else if (ratio >= 30) score = 10;
  else if (ratio >= 15) score = 15;
  else score = 20;

  if (debts.length === 0) {
    return { score, subtitle: S.debtNoDebts };
  }

  let subtitle = S.debtRatio(Math.round(ratio));
  const worst = debts.reduce((m, d) => (d.apr > m.apr ? d : m), debts[0]!);
  if (worst.apr > 0) {
    subtitle += S.debtWorst(worst.name || S.debtName, fmtApr(worst.apr));
  }
  return { score, subtitle };
}

// ============================================================================
// 4. Diversificación — 15 pts (tipos distintos con peso >5%)
// ============================================================================

export function diversificationMetric(
  investments: CoachInvestment[],
  locale: CoachLocale = "es",
): MetricResult {
  const S = STRINGS[locale];
  const withCapital = investments.filter((p) => p.capital > 0);
  const portfolio = withCapital.reduce((s, p) => s + p.capital, 0);
  if (portfolio <= 0) {
    return { score: 0, subtitle: S.diversificationNoAssets };
  }

  const byType = new Map<string, number>();
  for (const p of withCapital) {
    byType.set(p.category, (byType.get(p.category) ?? 0) + p.capital);
  }
  const significantTypes = [...byType.values()].filter(
    (c) => c / portfolio > 0.05,
  ).length;

  let score: number;
  if (significantTypes >= 3) score = 15;
  else if (significantTypes === 2) score = 8;
  else if (significantTypes === 1) score = 3;
  else score = 0;

  const subtitle = S.diversification(withCapital.length, significantTypes);
  return { score, subtitle };
}

// ============================================================================
// 5. Progreso a libertad financiera — 15 pts (patrimonio neto / NLF)
// ============================================================================

export function freedomMetric(
  netWorth: number,
  nlf: number,
  locale: CoachLocale = "es",
): MetricResult {
  const S = STRINGS[locale];
  if (nlf <= 0) {
    return { score: 0, subtitle: S.freedomNoNlf };
  }
  const score = Math.round(clamp((netWorth / nlf) * 15, 0, 15));
  const pct = clamp(Math.round((netWorth / nlf) * 100), 0, 100);
  return { score, subtitle: S.freedomProgress(pct) };
}

// ============================================================================
// Rango (etiqueta + mensaje exacto) y armado del scorecard
// ============================================================================

export function scorecardRange(
  total: number,
  locale: CoachLocale = "es",
): { label: string; message: string } {
  const ranges = STRINGS[locale].ranges;
  const r = ranges.find((x) => total >= x.min) ?? ranges[ranges.length - 1]!;
  return { label: r.label, message: r.message };
}

export function buildScorecard(
  input: CoachInputs,
  locale: CoachLocale = "es",
): Scorecard {
  const results: Record<CoachMetricKey, MetricResult> = {
    savings: savingsMetric(input.incomeMonth, input.expenseMonth, locale),
    emergency: emergencyMetric(input.goals, input.avgMonthlyExpense, locale),
    debt: debtMetric(input.debts, input.incomeMonth, locale),
    diversification: diversificationMetric(input.investments, locale),
    freedom: freedomMetric(input.netWorth, input.nlf, locale),
  };

  const order: CoachMetricKey[] = [
    "savings",
    "emergency",
    "debt",
    "diversification",
    "freedom",
  ];

  const metrics: CoachMetric[] = order.map((key) => ({
    key,
    label: STRINGS[locale].labels[key],
    score: results[key].score,
    max: MAX[key],
    subtitle: results[key].subtitle,
  }));

  const total = clamp(
    Math.round(metrics.reduce((s, m) => s + m.score, 0)),
    0,
    100,
  );

  const range = scorecardRange(total, locale);
  return { metrics, total, rangeLabel: range.label, message: range.message };
}
