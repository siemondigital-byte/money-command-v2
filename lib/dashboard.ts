/**
 * Helpers PUROS del módulo Dashboard (sin DB, sin "use server").
 *
 * El Dashboard ESPEJA: junta lo que los otros módulos ya calculan y lo presenta.
 * Estas funciones no recalculan la consolidación ni el Plan B; solo derivan las
 * métricas de presentación (termostato, distribución por canastas, número de
 * libertad con tasa ajustable, años a la libertad).
 *
 * Doctrina de esta tanda (ANEXO_Dashboard_MVP §"Doctrina"):
 *   - NO hay divisor fijo del Número de Libertad. La tasa la define el usuario;
 *     por defecto carga su rendimiento ponderado real (weightedYield). El
 *     Número de Libertad = gasto mensual × 12 / tasa.
 *   - Renta pasiva (Plan B) = monthlyPlanB existente. NO se recalcula acá.
 *
 * Todo se redondea a 2 decimales donde es monto; los porcentajes quedan crudos
 * (la UI los formatea) para no acumular error de redondeo en las barras.
 */

import { yearsToFinancialFreedom } from "./formulas";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ============================================================================
// Termostato financiero
// ============================================================================

export interface ThermostatResult {
  /** Temperatura actual: promedio de ingresos del historial. */
  current: number;
  /** Temperatura deseada: meta de ingreso a 2 años (Settings). 0 si no hay meta. */
  target: number;
  /** Brecha en monto (target - current), nunca negativa. */
  gap: number;
  /** Brecha como % sobre el actual ("te falta W%"). 0 si no hay base. */
  gapPct: number;
  /** true si ya se alcanzó (o superó) la meta. */
  reached: boolean;
}

/**
 * Compara la temperatura actual (promedio del historial de ingresos) con la
 * deseada (meta de ingreso a 2 años de Settings).
 *
 * Bordes:
 *   - sin meta (target null/<=0): gap 0, gapPct 0, reached false → la UI invita
 *     a configurar la meta.
 *   - current >= target: meta alcanzada, gap 0.
 *   - sin historial (current 0) con meta > 0: gap = target, gapPct 0 (no se
 *     divide por cero), reached false.
 */
export function thermostat(
  avgIncome: number | null | undefined,
  targetIncome: number | null | undefined,
): ThermostatResult {
  const current = avgIncome && avgIncome > 0 ? round2(avgIncome) : 0;
  const target = targetIncome && targetIncome > 0 ? round2(targetIncome) : 0;

  if (target <= 0) {
    return { current, target: 0, gap: 0, gapPct: 0, reached: false };
  }
  if (current >= target) {
    return { current, target, gap: 0, gapPct: 0, reached: true };
  }
  const gap = round2(target - current);
  const gapPct = current > 0 ? round2((gap / current) * 100) : 0;
  return { current, target, gap, gapPct, reached: false };
}

// ============================================================================
// Distribución real por canastas (Esenciales / Estilo / Libertad)
// ============================================================================

export interface BasketDistribution {
  essentials: number;
  style: number;
  freedom: number;
}

/**
 * Distribución real del usuario por canasta, como % del INGRESO del período.
 *
 * Doctrina (decisión de Andrea): invertir = destinar a la libertad. Por eso la
 * canasta Libertad incluye el APORTE MENSUAL A INVERSIÓN (`contribution`) además
 * de los gastos categorizados como "freedom". Todo se mide sobre el ingreso, así
 * el % y el monto son coherentes entre sí:
 *   - Esenciales% = gastos esenciales / ingreso
 *   - Estilo%     = gastos estilo / ingreso
 *   - Libertad%   = (gastos libertad + aporte inversión) / ingreso
 *
 * Los tres NO suman 100: lo que falta es "sin asignar" (ver unassignedAllocation).
 * Si no hay ingreso (<=0) devuelve {0,0,0} (evita div/0) y la UI degrada al preset.
 */
export function realDistribution(
  input: BasketDistribution,
  income: number,
  contribution = 0,
): BasketDistribution {
  if (income <= 0) return { essentials: 0, style: 0, freedom: 0 };
  return {
    essentials: (input.essentials / income) * 100,
    style: (input.style / income) * 100,
    freedom: ((input.freedom + contribution) / income) * 100,
  };
}

/**
 * "Sin asignar" del mes: el ingreso que no fue ni gastado ni invertido.
 *   monto = ingreso − esenciales − estilo − gastos libertad − aporte inversión
 *   pct   = monto / ingreso × 100
 *
 * Puede ser NEGATIVO (asignaste más que tu ingreso ese mes): NO se limita a 0.
 * Con esto, las tres canastas + sin asignar suman el 100% del ingreso.
 */
export function unassignedAllocation(
  income: number,
  essentials: number,
  style: number,
  freedom: number,
  contribution: number,
): { amount: number; pct: number } {
  const amount = round2(income - essentials - style - freedom - contribution);
  const pct = income > 0 ? round2((amount / income) * 100) : 0;
  return { amount, pct };
}

/**
 * Convierte una distribución en % (sobre el ingreso) en montos.
 * (income × pct / 100 por canasta). Usado por la simulación de las barras: como
 * el % ya es sobre el ingreso, el monto resultante es coherente con la barra.
 */
export function distributionAmounts(
  income: number,
  dist: BasketDistribution,
): BasketDistribution {
  const safeIncome = income > 0 ? income : 0;
  return {
    essentials: round2((safeIncome * dist.essentials) / 100),
    style: round2((safeIncome * dist.style) / 100),
    freedom: round2((safeIncome * dist.freedom) / 100),
  };
}

// ============================================================================
// Número de Libertad (tasa ajustable, sin divisor fijo)
// ============================================================================

/**
 * Capital que necesitás invertido para que su retorno pasivo cubra tus gastos.
 *
 *     NLF = gasto mensual × 12 / tasa
 *
 * @param monthlyExpense gasto mensual real
 * @param rate tasa de rendimiento como fracción (0.08 = 8%)
 * @returns capital necesario; 0 si gasto o tasa no son válidos (evita div/0)
 */
export function freedomNumber(monthlyExpense: number, rate: number): number {
  if (monthlyExpense <= 0 || rate <= 0) return 0;
  return round2((monthlyExpense * 12) / rate);
}

/**
 * Número de Libertad sobre el gasto proyectado por inflación a `years` años.
 * Útil para mostrar cuánto costaría la libertad si el costo de vida sube.
 *
 * @param monthlyExpense gasto mensual real de hoy
 * @param rate tasa de rendimiento como fracción
 * @param inflationPct inflación anual en % (ej. 4.5)
 * @param years horizonte de inflación
 */
export function freedomNumberInflated(
  monthlyExpense: number,
  rate: number,
  inflationPct: number,
  years: number,
): number {
  if (monthlyExpense <= 0 || rate <= 0) return 0;
  const safeYears = years > 0 ? years : 0;
  const inflated =
    monthlyExpense * Math.pow(1 + (inflationPct || 0) / 100, safeYears);
  return freedomNumber(inflated, rate);
}

/**
 * Años para alcanzar el Número de Libertad dado el portafolio actual, el aporte
 * mensual y la tasa. Reusa la búsqueda binaria de lib/formulas (interés
 * compuesto con aportes). NO reimplementa la fórmula.
 *
 * @returns años (con decimales), 0 si ya se alcanzó, o null si no converge en
 *          el horizonte (la UI muestra "no converge con estos números").
 */
export function yearsToFreedom(
  portfolio: number,
  monthlyContribution: number,
  annualReturn: number,
  freedomNum: number,
): number | null {
  if (freedomNum <= 0) return 0;
  if (portfolio >= freedomNum) return 0;
  const years = yearsToFinancialFreedom(
    portfolio,
    monthlyContribution,
    annualReturn,
    freedomNum,
  );
  if (!Number.isFinite(years)) return null;
  return round2(years);
}

/**
 * % de avance hacia el Número de Libertad: portafolio / NLF, tope 100.
 * 0 si el NLF no es válido.
 */
export function freedomProgress(portfolio: number, freedomNum: number): number {
  if (freedomNum <= 0) return 0;
  return Math.min(100, round2((portfolio / freedomNum) * 100));
}
