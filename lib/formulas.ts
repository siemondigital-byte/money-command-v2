/**
 * The Money Command v2 — Fórmulas oficiales
 *
 * Fuente única de la matemática del producto. Toda fórmula que aparezca en
 * cualquier módulo de la app debe importar desde acá. NO reimplementar.
 *
 * Alineado con:
 * - Manuscrito v30 del libro
 * - docs/REFERENCIA_4_PORCIENTO_NLF.md
 * - SPEC.md sección "Fórmulas oficiales"
 *
 * Doctrina (NO negociable):
 *   - 4% = DIVISOR del Número de Libertad. Fijo, no editable.
 *     NO es "tasa de retiro" ni "withdrawal rate". El usuario vive de FLUJOS
 *     pasivos perpetuos; el capital queda intacto y sigue creciendo.
 *   - 8% = retorno esperado del portafolio en acumulación. Editable.
 *     Es crecimiento, no retiro.
 *   - El Plan B real (ingreso pasivo) se calcula como suma de
 *     (posición × yield ponderado), NO como capital × 0.04.
 */

// ============================================================================
// Constantes oficiales
// ============================================================================

/**
 * Divisor del Número de Libertad. Fijo, no editable por usuario.
 *
 * Es la traducción matemática de "¿qué tan grande tiene que ser el capital
 * para que sus flujos pasivos cubran 1 año de gastos?". Origen histórico:
 * Trinity Study. NO representa "retiro" — el capital no se toca.
 */
export const NLF_DIVISOR = 0.04;

/** Retorno default del S&P 500 histórico, usado cuando el usuario no tiene portafolio. */
export const DEFAULT_PORTFOLIO_RETURN = 0.08;

/** Inflación default global cuando no hay dato del país del usuario. */
export const DEFAULT_INFLATION_RATE = 0.03;

/**
 * Cinco categorías doctrinales del portafolio (Sprint 2).
 *
 * Los labels en ES viven en la UI; el enum interno se mantiene en EN.
 */
export type InvestmentCategory =
  | "fixed_income"
  | "equity"
  | "real_estate"
  | "speculative"
  | "other";

export const INVESTMENT_CATEGORIES = [
  "fixed_income",
  "equity",
  "real_estate",
  "speculative",
  "other",
] as const satisfies readonly InvestmentCategory[];

/**
 * Yield pasivo default por categoría. Es el % anual que la categoría
 * entrega como FLUJO (dividendos, intereses, renta neta). Cada posición
 * puede ajustarlo; estos son sugerencias.
 *
 * NO es el retorno total esperado de la categoría — el retorno esperado
 * de cartera vive en Settings y se usa para proyección (Sprint 3).
 */
export const DEFAULT_PASSIVE_YIELDS_BY_CATEGORY: Record<
  InvestmentCategory,
  number
> = {
  fixed_income: 0.04, // bonos / plazo fijo pagan la mayoría como cupón
  equity: 0.015, // dividend yield promedio del S&P 500
  real_estate: 0.04, // renta neta típica
  speculative: 0.0, // cripto sin staking no entrega flujo
  other: 0.02, // estimación conservadora
};

/**
 * Retorno total esperado por categoría (crecimiento en acumulación).
 * Default cuando no se sabe nada del portafolio del usuario. Se usa en
 * Sprint 3 para proyección. NO se usa para calcular Plan B.
 */
export const DEFAULT_EXPECTED_RETURN_BY_CATEGORY: Record<
  InvestmentCategory,
  number
> = {
  fixed_income: 0.04,
  equity: 0.08,
  real_estate: 0.06,
  speculative: 0.12,
  other: 0.05,
};

// ============================================================================
// Número de Libertad Financiera (NLF)
// ============================================================================

/**
 * Calcula el Número de Libertad Financiera.
 *
 * Fórmula oficial: NLF = (Gasto Mensual Deseado × 12) ÷ 0.04
 * Equivalente: NLF = Gasto Mensual Deseado × 300
 *
 * Es el capital invertido que genera flujos pasivos suficientes para cubrir
 * los gastos sin tocar el principal.
 *
 * @param monthlyDesiredSpend Gasto mensual deseado en libertad
 * @returns NLF en la misma moneda
 */
export function freedomNumber(monthlyDesiredSpend: number): number {
  if (monthlyDesiredSpend <= 0) return 0;
  return (monthlyDesiredSpend * 12) / NLF_DIVISOR;
}

// ============================================================================
// Plan B — Ingreso pasivo mensual (CONTRATO de Investments)
// ============================================================================

export interface PortfolioPosition {
  capital: number;
  passiveYield: number; // anual, como decimal (0.04 = 4%)
}

/**
 * Plan B mensual: suma de flujos pasivos del portafolio.
 *
 *     planB = Σ (posición.capital × posición.passiveYield) / 12
 *
 * Es la ÚNICA fuente de verdad para el ingreso pasivo del usuario.
 * Income consumirá este valor; si Income guarda un override manual,
 * gana el override (regla del módulo Income, no de este).
 *
 * PROHIBIDO: calcular Plan B como (portafolio × 4%) o (portafolio × 8%).
 * El 4% es divisor del NLF; el 8% es retorno de crecimiento. Plan B es
 * flujo de yields, posición por posición.
 *
 * @param positions Posiciones del portafolio del usuario
 * @returns Ingreso pasivo mensual en la misma moneda que los capitales
 */
export function monthlyPlanB(positions: PortfolioPosition[]): number {
  if (!positions || positions.length === 0) return 0;
  const annual = positions.reduce(
    (sum, p) => sum + p.capital * p.passiveYield,
    0,
  );
  return annual / 12;
}

// ============================================================================
// Retorno Esperado de Crecimiento del Portafolio (Sprint 3, no Plan B)
// ============================================================================

export interface PortfolioExpectedReturnInput {
  capital: number;
  expectedReturn: number; // crecimiento anual, decimal
}

/**
 * Retorno esperado ponderado de crecimiento del portafolio. Se usa para
 * proyección de cartera en el Freedom Calculator (Sprint 3). NO se usa
 * para Plan B.
 *
 * Si no hay posiciones cargadas, retorna DEFAULT_PORTFOLIO_RETURN (8%).
 *
 * @param positions Posiciones con capital y retorno esperado de crecimiento
 * @returns Tasa anual ponderada como decimal
 */
export function weightedExpectedReturn(
  positions: PortfolioExpectedReturnInput[],
): number {
  if (!positions || positions.length === 0) return DEFAULT_PORTFOLIO_RETURN;
  const totalCapital = positions.reduce((sum, p) => sum + p.capital, 0);
  if (totalCapital <= 0) return DEFAULT_PORTFOLIO_RETURN;
  return positions.reduce(
    (sum, p) => sum + (p.capital / totalCapital) * p.expectedReturn,
    0,
  );
}

// ============================================================================
// Años hasta la Libertad Financiera
// ============================================================================

/**
 * Calcula cuántos años faltan para alcanzar el NLF dado el estado actual.
 *
 * Resuelve la ecuación de valor futuro con aportes regulares:
 *   NLF = PV × (1+r)^n + (PMT × 12) × [((1+r)^n − 1) / r]
 *
 * Donde:
 * - PV = patrimonio actual invertido
 * - PMT = aporte mensual
 * - r = retorno anual del portafolio
 * - n = años (lo que queremos encontrar)
 *
 * Usa búsqueda binaria entre 0 y 80 años. Si el patrimonio actual ya alcanza
 * el NLF, retorna 0. Si en 80 años no llega, retorna Infinity.
 *
 * @param currentNetWorth Patrimonio actual invertido (PV)
 * @param monthlyContribution Aporte mensual a inversión (PMT)
 * @param annualReturn Retorno anual del portafolio como decimal (r)
 * @param targetAmount NLF objetivo
 * @returns Años (con decimales) hasta alcanzar el target
 */
export function yearsToFinancialFreedom(
  currentNetWorth: number,
  monthlyContribution: number,
  annualReturn: number,
  targetAmount: number
): number {
  // Casos borde
  if (currentNetWorth >= targetAmount) return 0;
  if (annualReturn <= 0 && monthlyContribution <= 0) return Infinity;
  if (annualReturn === 0) {
    // Caso lineal sin interés
    const remaining = targetAmount - currentNetWorth;
    const years = remaining / (monthlyContribution * 12);
    return years > 80 ? Infinity : years;
  }

  // Búsqueda binaria entre 0 y 80 años
  const futureValueAt = (n: number): number => {
    const factor = Math.pow(1 + annualReturn, n);
    return (
      currentNetWorth * factor +
      monthlyContribution * 12 * ((factor - 1) / annualReturn)
    );
  };

  let lo = 0;
  let hi = 80;
  const TOLERANCE = 0.01; // 0.01 años = ~3.6 días, suficiente precisión

  // Verificar si es alcanzable en el horizonte
  if (futureValueAt(80) < targetAmount) return Infinity;

  while (hi - lo > TOLERANCE) {
    const mid = (lo + hi) / 2;
    if (futureValueAt(mid) < targetAmount) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return (lo + hi) / 2;
}

// ============================================================================
// Patrimonio Neto
// ============================================================================

export function netWorth(totalAssets: number, totalLiabilities: number): number {
  return totalAssets - totalLiabilities;
}

// ============================================================================
// Tasa de Ahorro
// ============================================================================

/**
 * Calcula la tasa de ahorro como porcentaje del ingreso.
 *
 * @param totalIncome Ingreso total del mes
 * @param totalExpenses Gastos totales del mes
 * @returns Tasa como porcentaje (ej. 22.5 para 22.5%)
 */
export function savingsRate(totalIncome: number, totalExpenses: number): number {
  if (totalIncome <= 0) return 0;
  return ((totalIncome - totalExpenses) / totalIncome) * 100;
}

// ============================================================================
// Retorno Real (ajustado por inflación)
// ============================================================================

/**
 * Retorno Real = [(1+Nominal) / (1+Inflación)] − 1
 *
 * @param nominalReturn Retorno nominal como decimal
 * @param inflationRate Inflación anual como decimal
 * @returns Retorno real como decimal
 */
export function realReturn(nominalReturn: number, inflationRate: number): number {
  return (1 + nominalReturn) / (1 + inflationRate) - 1;
}

// ============================================================================
// APR Ponderado de Deuda
// ============================================================================

export interface DebtForApr {
  balance: number;
  apr: number; // como decimal
}

/**
 * Calcula el APR ponderado por saldo de un conjunto de deudas.
 *
 * APR Ponderado = Σ (saldo × APR) / Σ saldos
 *
 * @param debts Array de deudas con saldo y APR
 * @returns APR ponderado como decimal
 */
export function weightedDebtApr(debts: DebtForApr[]): number {
  if (!debts || debts.length === 0) return 0;
  const totalBalance = debts.reduce((sum, d) => sum + d.balance, 0);
  if (totalBalance <= 0) return 0;

  const weighted = debts.reduce((sum, d) => {
    const weight = d.balance / totalBalance;
    return sum + weight * d.apr;
  }, 0);

  return weighted;
}

// ============================================================================
// Ratio Deuda / Ingreso
// ============================================================================

/**
 * Calcula el ratio Deuda/Ingreso como porcentaje.
 *
 * @param totalMonthlyDebtPayments Suma de pagos mensuales de deuda
 * @param monthlyNetIncome Ingreso mensual neto
 * @returns Ratio como porcentaje
 */
export function debtToIncomeRatio(
  totalMonthlyDebtPayments: number,
  monthlyNetIncome: number
): number {
  if (monthlyNetIncome <= 0) return 0;
  return (totalMonthlyDebtPayments / monthlyNetIncome) * 100;
}

export type DebtRatioZone = "healthy" | "caution" | "critical";

/**
 * Clasifica el ratio deuda/ingreso en zonas (semáforo).
 *
 * @param ratio Ratio en porcentaje
 * @returns Zona: healthy (<30%) | caution (30-50%) | critical (>50%)
 */
export function debtRatioZone(ratio: number): DebtRatioZone {
  if (ratio < 30) return "healthy";
  if (ratio <= 50) return "caution";
  return "critical";
}

// ============================================================================
// Multiplicador del Termostato
// ============================================================================

/**
 * Calcula el multiplicador del termostato financiero.
 *
 * @param currentThermostat Promedio de ingreso de los últimos 12 meses
 * @param targetThermostat Meta de ingreso a 2 años
 * @returns Multiplicador (ej. 2.5 = la meta es 2.5x el actual)
 */
export function thermostatMultiplier(
  currentThermostat: number,
  targetThermostat: number
): number {
  if (currentThermostat <= 0) return 0;
  return targetThermostat / currentThermostat;
}

export type ThermostatZone = "technical" | "mindset_parallel" | "mindset_first";

/**
 * Clasifica el multiplicador del termostato en zonas del libro.
 *
 * @param multiplier Multiplicador (target/current)
 * @returns Zona según v30 del libro
 */
export function thermostatZone(multiplier: number): ThermostatZone {
  if (multiplier < 2) return "technical";
  if (multiplier <= 5) return "mindset_parallel";
  return "mindset_first";
}

// ============================================================================
// Renta Pasiva Mensual desde Portafolio
// ============================================================================

/**
 * Caudal mensual de referencia del NLF para un capital dado.
 *
 * Es el inverso matemático del Número de Libertad: si NLF = (gasto × 12) / 0.04,
 * entonces para un capital C, el caudal mensual implícito por ese mismo
 * divisor es (C × 0.04) / 12. Útil para mostrar "tu capital actual cubre X
 * de gasto mensual según el divisor de libertad".
 *
 * NO es Plan B real — el Plan B se calcula en Investments como la suma de
 * (posición × yield pasivo ponderado). Esta función es una métrica de
 * referencia, no el flujo pasivo efectivo del usuario.
 *
 * @param capital Capital invertido total
 * @returns Caudal mensual de referencia
 */
export function monthlyPassiveIncome(capital: number): number {
  if (capital <= 0) return 0;
  return (capital * NLF_DIVISOR) / 12;
}

// ============================================================================
// Interés Compuesto (proyección de capital)
// ============================================================================

/**
 * Valor futuro de un capital con aportes mensuales constantes.
 *
 * Fórmula: FV = PV × (1+r)^n + (PMT × 12) × [((1+r)^n − 1) / r]
 *
 * @param presentValue Capital inicial
 * @param monthlyContribution Aporte mensual
 * @param annualReturn Tasa anual como decimal
 * @param years Años a proyectar
 * @returns Valor futuro proyectado
 */
export function futureValueWithContributions(
  presentValue: number,
  monthlyContribution: number,
  annualReturn: number,
  years: number
): number {
  if (years <= 0) return presentValue;
  if (annualReturn === 0) {
    return presentValue + monthlyContribution * 12 * years;
  }
  const factor = Math.pow(1 + annualReturn, years);
  return (
    presentValue * factor +
    monthlyContribution * 12 * ((factor - 1) / annualReturn)
  );
}

// ============================================================================
// Regla del 72
// ============================================================================

/**
 * Años para duplicar un capital dada una tasa de retorno (regla del 72).
 *
 * @param annualReturn Tasa anual como decimal
 * @returns Años para duplicar el capital
 */
export function yearsToDouble(annualReturn: number): number {
  if (annualReturn <= 0) return Infinity;
  return 72 / (annualReturn * 100);
}

// ============================================================================
// Costo real de oportunidad de un gasto
// ============================================================================

/**
 * Costo real de un gasto = lo que ese dinero habría valido invertido.
 *
 * Ejemplo del libro: un café de $5 al 8% durante 10 años "cuesta" mucho más
 * que $5 porque es el costo de oportunidad de no invertir.
 *
 * @param expenseAmount Monto del gasto
 * @param years Horizonte de inversión alternativo
 * @param annualReturn Tasa anual asumida
 * @returns Valor futuro del gasto si se hubiera invertido
 */
export function realCostOfExpense(
  expenseAmount: number,
  years: number,
  annualReturn: number = DEFAULT_PORTFOLIO_RETURN
): number {
  return expenseAmount * Math.pow(1 + annualReturn, years);
}

// ============================================================================
// Tiempo de vida que cuesta un gasto
// ============================================================================

/**
 * Cuántas horas de vida cuesta un gasto, dado el valor por hora del usuario.
 *
 * Concepto central de v30 del libro: "el dinero es tiempo de tu vida".
 *
 * @param expenseAmount Monto del gasto
 * @param hourlyValue Valor por hora del usuario (ingreso mensual / horas trabajadas)
 * @returns Horas de vida que cuesta el gasto
 */
export function lifeHoursCost(expenseAmount: number, hourlyValue: number): number {
  if (hourlyValue <= 0) return 0;
  return expenseAmount / hourlyValue;
}

// ============================================================================
// Scorecard de Salud Financiera (0-100)
// ============================================================================

export interface ScorecardInputs {
  savingsRatePct: number;          // 0-100
  emergencyFundMonths: number;     // meses de gastos cubiertos
  debtToIncomeRatioPct: number;    // 0-100
  portfolioDiversificationCount: number; // tipos distintos con peso >5%
  netWorth: number;
  freedomNumber: number;
}

export interface ScorecardBreakdown {
  total: number;
  savings: number;
  emergencyFund: number;
  debtRatio: number;
  diversification: number;
  progress: number;
}

/**
 * Calcula el score de salud financiera 0-100.
 *
 * Composición:
 * - 30 pts tasa de ahorro
 * - 20 pts fondo de emergencia
 * - 20 pts ratio deuda/ingreso (inverso)
 * - 15 pts diversificación
 * - 15 pts progreso a NLF
 */
export function calculateScorecard(inputs: ScorecardInputs): ScorecardBreakdown {
  // Tasa de ahorro (30 pts)
  let savings = 0;
  if (inputs.savingsRatePct >= 30) savings = 30;
  else if (inputs.savingsRatePct >= 20) savings = 27;
  else if (inputs.savingsRatePct >= 10) savings = 20;
  else if (inputs.savingsRatePct >= 5) savings = 10;

  // Fondo de emergencia (20 pts)
  const emergencyFund = Math.min(20, (inputs.emergencyFundMonths / 6) * 20);

  // Ratio deuda (20 pts inverso)
  let debtRatio = 0;
  if (inputs.debtToIncomeRatioPct < 15) debtRatio = 20;
  else if (inputs.debtToIncomeRatioPct <= 30) debtRatio = 15;
  else if (inputs.debtToIncomeRatioPct <= 50) debtRatio = 10;

  // Diversificación (15 pts)
  let diversification = 0;
  if (inputs.portfolioDiversificationCount >= 3) diversification = 15;
  else if (inputs.portfolioDiversificationCount === 2) diversification = 8;
  else if (inputs.portfolioDiversificationCount === 1) diversification = 3;

  // Progreso a NLF (15 pts)
  const progress =
    inputs.freedomNumber > 0
      ? Math.min(15, (inputs.netWorth / inputs.freedomNumber) * 15)
      : 0;

  const total = Math.round(savings + emergencyFund + debtRatio + diversification + progress);

  return {
    total,
    savings: Math.round(savings),
    emergencyFund: Math.round(emergencyFund),
    debtRatio: Math.round(debtRatio),
    diversification: Math.round(diversification),
    progress: Math.round(progress),
  };
}

export type ScorecardRange =
  | "exceptional"   // 90-100
  | "excellent"     // 75-89
  | "good"          // 60-74
  | "mediocre"      // 40-59
  | "poor"          // 20-39
  | "crisis";       // 0-19

export function scorecardRange(score: number): ScorecardRange {
  if (score >= 90) return "exceptional";
  if (score >= 75) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "mediocre";
  if (score >= 20) return "poor";
  return "crisis";
}
