/**
 * Lógica de proyección del módulo Investments (capa A) — helpers PUROS.
 *
 * UNA SOLA TASA por activo: `passiveYield` (yield / rendimiento anual). De esa
 * tasa sale TODO: el crecimiento de la proyección, la renta proyectada y el
 * Plan B. (Decisión: yield y retorno son el mismo concepto.)
 *
 * NO toca el Plan B: `passiveYield` y `monthlyPlanB` (lib/formulas) siguen
 * siendo la fuente de verdad de la renta pasiva de HOY. Acá solo se proyecta,
 * con la misma tasa.
 *
 * Reusa `futureValueWithContributions` de lib/formulas (no se reimplementa la
 * fórmula de interés compuesto).
 */

import { futureValueWithContributions } from "./formulas";

export interface ProjectionPosition {
  capital: number;
  monthlyContribution: number;
  /** Yield / rendimiento anual como fracción (0.04 = 4%). Tasa única. */
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
 * Rendimiento ponderado por capital: Σ(capital × passiveYield) / Σ capital.
 * Devuelto como fracción (0.08). 0 si no hay capital.
 */
export function weightedYield(positions: ProjectionPosition[]): number {
  const total = positions.reduce((s, p) => s + p.capital, 0);
  if (total <= 0) return 0;
  const weighted = positions.reduce(
    (s, p) => s + p.capital * p.passiveYield,
    0,
  );
  return weighted / total;
}

/**
 * Valor proyectado del portafolio a `years` años: suma del valor futuro de
 * cada activo (capital + aportes, creciendo a su rendimiento anual).
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
          p.passiveYield,
          years,
        ),
      0,
    ),
  );
}

/**
 * Renta pasiva MENSUAL del portafolio proyectado a `years` años: por cada
 * activo, su valor futuro × su rendimiento anual / 12. Rendimientos reales por
 * posición sobre el valor proyectado (doctrina §8), no portafolio × 4%.
 */
export function projectedMonthlyPassiveIncome(
  positions: ProjectionPosition[],
  years: number,
): number {
  const annual = positions.reduce((s, p) => {
    const fv = futureValueWithContributions(
      p.capital,
      p.monthlyContribution,
      p.passiveYield,
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
