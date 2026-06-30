/**
 * Formatea los datos REALES del usuario (CoachData) como un bloque de texto
 * legible para inyectar al final del system prompt del Coach (sección "DATOS DEL
 * USUARIO"). Solo datos reales: si algo no está cargado, se indica explícitamente
 * y NUNCA se inventa un valor.
 *
 * Módulo puro (sin DB). Reusa buildScorecard para resumir la salud financiera.
 */

import { buildScorecard } from "../coach";
import type { CoachData } from "../coach-data";

const BASKET_ES: Record<string, string> = {
  essentials: "Esenciales",
  style: "Estilo",
  freedom: "Libertad",
};

const CATEGORY_ES: Record<string, string> = {
  fixed_income: "Renta fija",
  equity: "Renta variable",
  real_estate: "Bienes raíces",
  speculative: "Cripto / Especulativo",
  other: "Otros",
};

/** Construye el bloque de DATOS DEL USUARIO. `currency` es el código ISO (ej. USD). */
export function formatCoachContext(data: CoachData, currency: string): string {
  const { inputs } = data;

  const money = (n: number) =>
    `${currency} ${new Intl.NumberFormat("en-US").format(Math.round(n))}`;
  const pct = (n: number) => `${Math.round(n)}%`;

  const lines: string[] = [];
  lines.push(`Moneda: ${currency}`);

  lines.push(
    inputs.incomeMonth > 0
      ? `Ingreso del mes: ${money(inputs.incomeMonth)}`
      : `Ingreso del mes: no cargado`,
  );

  if (inputs.expenseMonth > 0) {
    lines.push(`Gasto del mes: ${money(inputs.expenseMonth)}`);
    lines.push(
      `  Por canasta: Esenciales ${money(data.essentials)} | Estilo ${money(
        data.style,
      )} | Libertad ${money(data.freedom)}`,
    );
  } else {
    lines.push(`Gasto del mes: no cargado`);
  }

  if (inputs.avgMonthlyExpense > 0) {
    lines.push(
      `Gasto mensual promedio (histórico): ${money(inputs.avgMonthlyExpense)}`,
    );
  }

  if (inputs.incomeMonth > 0) {
    lines.push(`Tasa de ahorro del mes: ${pct(data.savingsRatePct)}`);
  }

  lines.push(`Patrimonio neto: ${money(inputs.netWorth)}`);

  if (inputs.nlf > 0) {
    lines.push(
      `Número de Libertad (NLF): ${money(inputs.nlf)} (tasa de retorno usada: ${pct(
        data.freedomRate * 100,
      )})`,
    );
    if (inputs.netWorth > 0) {
      const progress = Math.min(100, (inputs.netWorth / inputs.nlf) * 100);
      lines.push(`Progreso al NLF (patrimonio / NLF): ${pct(progress)}`);
    }
  } else {
    lines.push(
      `Número de Libertad: no calculable todavía (falta cargar gasto). Remitir a la Calculadora de Libertad.`,
    );
  }

  // Deudas
  if (inputs.debts.length > 0) {
    lines.push(`Deudas activas:`);
    for (const d of inputs.debts) {
      lines.push(
        `  - ${d.name}: APR ${pct(d.apr)}, pago ${money(d.currentPayment)}/mes`,
      );
    }
  } else {
    lines.push(`Deudas activas: ninguna cargada`);
  }

  // Metas
  if (inputs.goals.length > 0) {
    lines.push(`Metas activas:`);
    for (const g of inputs.goals) {
      const basket = BASKET_ES[g.basket] ?? g.basket;
      lines.push(
        `  - ${g.name} (canasta ${basket}): acumulado ${money(g.currentAmount)}`,
      );
    }
  } else {
    lines.push(`Metas activas: ninguna cargada`);
  }

  // Inversiones
  if (inputs.investments.length > 0) {
    lines.push(`Inversiones:`);
    for (const p of inputs.investments) {
      const cat = CATEGORY_ES[p.category] ?? p.category;
      lines.push(`  - ${cat}: capital ${money(p.capital)}`);
    }
  } else {
    lines.push(`Inversiones: ninguna cargada`);
  }

  // Scorecard de salud financiera (mismo cálculo que la página del Coach)
  const sc = buildScorecard(inputs);
  lines.push(`Scorecard de salud financiera: ${sc.total}/100 (${sc.rangeLabel})`);
  for (const m of sc.metrics) {
    lines.push(`  - ${m.label}: ${m.score}/${m.max}${m.subtitle ? ` (${m.subtitle})` : ""}`);
  }

  return lines.join("\n");
}
