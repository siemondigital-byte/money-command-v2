/**
 * Lógica de proyección del módulo Investments (capa A) — helpers PUROS.
 *
 * Proyecta el portafolio con interés compuesto: cada activo crece a su
 * `expectedReturn` (retorno TOTAL anual, apreciación + yield reinvertido)
 * sumando su `monthlyContribution`. La renta pasiva proyectada se calcula
 * con los yields reales por posición sobre el valor proyectado (NO
 * portafolio × 4%, prohibido por ARQUITECTURA §8).
 *
 * NO toca el Plan B: `passiveYield` y `monthlyPlanB` (lib/formulas) siguen
 * siendo la fuente de verdad de la renta pasiva de HOY. Acá solo se proyecta.
 *
 * Reusa `futureValueWithContributions` de lib/formulas (no se reimplementa la
 * fórmula de interés compuesto).
 */

import { futureValueWithContributions } from "./formulas";

export interface ProjectionPosition {
  capital: number;
  monthlyContribution: number;
  /** Retorno total anual como fracción (0.08 = 8%). */
  expectedReturn: number;
  /** Yield pasivo anual como fracción (0.04 = 4%). */
  passiveYield: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Capital total invertido hoy. */
export function portfolioTotal(positions: ProjectionPosition[]): number {
  return round2(positions.reduce((s, p) => s + p.capital, 0));
}

/**
 * Retorno ponderado por capital: Σ(capital × expectedReturn) / Σ capital.
 * Devuelto como fracción (0.08). 0 si no hay capital. Usa expectedReturn,
 * NUNCA el yield.
 */
export function weightedExpectedReturn(positions: ProjectionPosition[]): number {
  const total = positions.reduce((s, p) => s + p.capital, 0);
  if (total <= 0) return 0;
  const weighted = positions.reduce(
    (s, p) => s + p.capital * p.expectedReturn,
    0,
  );
  return weighted / total;
}

/**
 * Valor proyectado del portafolio a `years` años: suma del valor futuro de
 * cada activo, cada uno con su propio capital, aporte y retorno.
 */
export function projectedValue(
  positions: ProjectionPosition[],
  years: number,
): number {
  return round2(
    positions.reduce(
      (s, p) =>
        s +
        futureValueWithContributions(
          p.capital,
          p.monthlyContribution,
          p.expectedReturn,
          years,
        ),
      0,
    ),
  );
}

/**
 * Renta pasiva MENSUAL del portafolio proyectado a `years` años: por cada
 * activo, su valor futuro × su yield pasivo / 12. Yields reales por posición
 * sobre el valor proyectado (doctrina §8), no portafolio × 4%.
 */
export function projectedMonthlyPassiveIncome(
  positions: ProjectionPosition[],
  years: number,
): number {
  const annual = positions.reduce((s, p) => {
    const fv = futureValueWithContributions(
      p.capital,
      p.monthlyContribution,
      p.expectedReturn,
      years,
    );
    return s + fv * p.passiveYield;
  }, 0);
  return round2(annual / 12);
}

export interface ProjectionRow {
  years: number;
  value: number;
  monthlyIncome: number;
}

/** Tabla de proyección para los horizontes pedidos (ej. [5, 10, 20]). */
export function projectionTable(
  positions: ProjectionPosition[],
  horizons: number[],
): ProjectionRow[] {
  return horizons.map((years) => ({
    years,
    value: projectedValue(positions, years),
    monthlyIncome: projectedMonthlyPassiveIncome(positions, years),
  }));
}
