/**
 * Formatea los datos REALES del usuario (CoachData) como un bloque de texto
 * legible para inyectar al final del system prompt del Coach (sección "DATOS DEL
 * USUARIO"). Solo datos reales: si algo no está cargado, se indica explícitamente
 * y NUNCA se inventa un valor.
 *
 * Módulo puro (sin DB). Reusa buildScorecard para resumir la salud financiera.
 * El texto se arma en el idioma del perfil ("en" → inglés; resto → español) para
 * que coincida con el system prompt del Coach.
 */

import { buildScorecard, type CoachLocale } from "../coach";
import type { CoachData } from "../coach-data";

interface CtxStrings {
  baskets: Record<string, string>;
  categories: Record<string, string>;
  currency: string;
  income: string;
  notEntered: string;
  spending: string;
  byBasket: string; // prefijo "  Por canasta" / "  By basket"
  essentials: string;
  style: string;
  freedom: string;
  avgSpending: string;
  savingsRate: string;
  netWorth: string;
  nlfLabel: string;
  nlfReturnRate: string; // "tasa de retorno usada"
  nlfProgress: string;
  nlfNotYet: string;
  debtsActive: string;
  debtsNone: string;
  debtPayment: string; // "pago" / "payment"
  perMonth: string; // "/mes" / "/mo"
  goalsActive: string;
  goalsNone: string;
  basketWord: string; // "canasta" / "basket"
  goalSaved: string; // "acumulado" / "saved"
  investments: string;
  investmentsNone: string;
  capital: string;
  scorecardLabel: string;
}

const STR: Record<CoachLocale, CtxStrings> = {
  es: {
    baskets: { essentials: "Esenciales", style: "Estilo", freedom: "Libertad" },
    categories: {
      fixed_income: "Renta fija",
      equity: "Renta variable",
      real_estate: "Bienes raíces",
      speculative: "Cripto / Especulativo",
      other: "Otros",
    },
    currency: "Moneda",
    income: "Ingreso del mes",
    notEntered: "no cargado",
    spending: "Gasto del mes",
    byBasket: "  Por canasta",
    essentials: "Esenciales",
    style: "Estilo",
    freedom: "Libertad",
    avgSpending: "Gasto mensual promedio (histórico)",
    savingsRate: "Tasa de ahorro del mes",
    netWorth: "Patrimonio neto",
    nlfLabel: "Número de Libertad (NLF)",
    nlfReturnRate: "tasa de retorno usada",
    nlfProgress: "Progreso al NLF (patrimonio / NLF)",
    nlfNotYet:
      "Número de Libertad: no calculable todavía (falta cargar gasto). Remitir a la Calculadora de Libertad.",
    debtsActive: "Deudas activas",
    debtsNone: "Deudas activas: ninguna cargada",
    debtPayment: "pago",
    perMonth: "/mes",
    goalsActive: "Metas activas",
    goalsNone: "Metas activas: ninguna cargada",
    basketWord: "canasta",
    goalSaved: "acumulado",
    investments: "Inversiones",
    investmentsNone: "Inversiones: ninguna cargada",
    capital: "capital",
    scorecardLabel: "Scorecard de salud financiera",
  },
  en: {
    baskets: { essentials: "Essentials", style: "Style", freedom: "Freedom" },
    categories: {
      fixed_income: "Fixed income",
      equity: "Equities",
      real_estate: "Real estate",
      speculative: "Crypto / Speculative",
      other: "Other",
    },
    currency: "Currency",
    income: "Income this month",
    notEntered: "not entered",
    spending: "Spending this month",
    byBasket: "  By basket",
    essentials: "Essentials",
    style: "Style",
    freedom: "Freedom",
    avgSpending: "Average monthly spending (historical)",
    savingsRate: "Savings rate this month",
    netWorth: "Net worth",
    nlfLabel: "Freedom Number (NLF)",
    nlfReturnRate: "return rate used",
    nlfProgress: "Progress to NLF (net worth / NLF)",
    nlfNotYet:
      "Freedom Number: not computable yet (spending not entered). Refer to the Freedom Calculator.",
    debtsActive: "Active debts",
    debtsNone: "Active debts: none entered",
    debtPayment: "payment",
    perMonth: "/mo",
    goalsActive: "Active goals",
    goalsNone: "Active goals: none entered",
    basketWord: "basket",
    goalSaved: "saved",
    investments: "Investments",
    investmentsNone: "Investments: none entered",
    capital: "capital",
    scorecardLabel: "Financial-health scorecard",
  },
};

/** Construye el bloque de DATOS DEL USUARIO. `currency` es el código ISO (ej. USD). */
export function formatCoachContext(
  data: CoachData,
  currency: string,
  locale: CoachLocale = "es",
): string {
  const { inputs } = data;
  const S = STR[locale];

  const money = (n: number) =>
    `${currency} ${new Intl.NumberFormat("en-US").format(Math.round(n))}`;
  const pct = (n: number) => `${Math.round(n)}%`;

  const lines: string[] = [];
  lines.push(`${S.currency}: ${currency}`);

  lines.push(
    inputs.incomeMonth > 0
      ? `${S.income}: ${money(inputs.incomeMonth)}`
      : `${S.income}: ${S.notEntered}`,
  );

  if (inputs.expenseMonth > 0) {
    lines.push(`${S.spending}: ${money(inputs.expenseMonth)}`);
    lines.push(
      `${S.byBasket}: ${S.essentials} ${money(data.essentials)} | ${S.style} ${money(
        data.style,
      )} | ${S.freedom} ${money(data.freedom)}`,
    );
  } else {
    lines.push(`${S.spending}: ${S.notEntered}`);
  }

  if (inputs.avgMonthlyExpense > 0) {
    lines.push(`${S.avgSpending}: ${money(inputs.avgMonthlyExpense)}`);
  }

  if (inputs.incomeMonth > 0) {
    lines.push(`${S.savingsRate}: ${pct(data.savingsRatePct)}`);
  }

  lines.push(`${S.netWorth}: ${money(inputs.netWorth)}`);

  if (inputs.nlf > 0) {
    lines.push(
      `${S.nlfLabel}: ${money(inputs.nlf)} (${S.nlfReturnRate}: ${pct(
        data.freedomRate * 100,
      )})`,
    );
    if (inputs.netWorth > 0) {
      const progress = Math.min(100, (inputs.netWorth / inputs.nlf) * 100);
      lines.push(`${S.nlfProgress}: ${pct(progress)}`);
    }
  } else {
    lines.push(S.nlfNotYet);
  }

  // Deudas
  if (inputs.debts.length > 0) {
    lines.push(`${S.debtsActive}:`);
    for (const d of inputs.debts) {
      lines.push(
        `  - ${d.name}: APR ${pct(d.apr)}, ${S.debtPayment} ${money(
          d.currentPayment,
        )}${S.perMonth}`,
      );
    }
  } else {
    lines.push(S.debtsNone);
  }

  // Metas
  if (inputs.goals.length > 0) {
    lines.push(`${S.goalsActive}:`);
    for (const g of inputs.goals) {
      const basket = S.baskets[g.basket] ?? g.basket;
      lines.push(
        `  - ${g.name} (${S.basketWord} ${basket}): ${S.goalSaved} ${money(
          g.currentAmount,
        )}`,
      );
    }
  } else {
    lines.push(S.goalsNone);
  }

  // Inversiones
  if (inputs.investments.length > 0) {
    lines.push(`${S.investments}:`);
    for (const p of inputs.investments) {
      const cat = S.categories[p.category] ?? p.category;
      lines.push(`  - ${cat}: ${S.capital} ${money(p.capital)}`);
    }
  } else {
    lines.push(S.investmentsNone);
  }

  // Scorecard de salud financiera (mismo cálculo que la página del Coach)
  const sc = buildScorecard(inputs, locale);
  lines.push(`${S.scorecardLabel}: ${sc.total}/100 (${sc.rangeLabel})`);
  for (const m of sc.metrics) {
    lines.push(
      `  - ${m.label}: ${m.score}/${m.max}${m.subtitle ? ` (${m.subtitle})` : ""}`,
    );
  }

  return lines.join("\n");
}
