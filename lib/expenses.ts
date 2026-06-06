/**
 * Lógica del módulo Expenses — helpers PUROS (sin DB, sin "use server").
 *
 * Viven separados para poder importarlos desde Server o Client y testearlos
 * sin mockear Prisma. Las canastas son las doctrinales (ARQUITECTURA §9 /
 * ANEXO §2): Esenciales / Estilo / Libertad. Nunca Necesidades/Deseos.
 *
 * Todos los montos se redondean a 2 decimales para que KPI = tabla = gráfico
 * = MonthlyRecord cuadren al centavo.
 */

export type Basket = "essentials" | "style" | "freedom";
export type ExpenseType = "fixed" | "variable";

export const BASKETS: Basket[] = ["essentials", "style", "freedom"];

export const BASKET_LABELS_ES: Record<Basket, string> = {
  essentials: "Esenciales",
  style: "Estilo",
  freedom: "Libertad",
};

/** Colores del tema dark de la app (NO la paleta light del prototipo). */
export const BASKET_COLORS: Record<Basket, string> = {
  essentials: "#4dd9ff", // var(--accent-2) cian — base
  style: "#ffd166", // var(--gold) dorado — estilo de vida
  freedom: "#7fffb2", // var(--accent) verde — libertad
};

/** Categorías de gasto (etiqueta suelta; la canasta es lo que consolida). */
export const EXPENSE_CATEGORIES = [
  "vivienda",
  "comida",
  "servicios",
  "transporte",
  "salud",
  "seguros",
  "entretenimiento",
  "restaurantes",
  "viajes",
  "ropa",
  "educacion",
  "suscripciones",
  "otros",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const CATEGORY_LABELS_ES: Record<string, string> = {
  vivienda: "Vivienda",
  comida: "Comida",
  servicios: "Servicios",
  transporte: "Transporte",
  salud: "Salud",
  seguros: "Seguros",
  entretenimiento: "Entretenimiento",
  restaurantes: "Restaurantes",
  viajes: "Viajes",
  ropa: "Ropa",
  educacion: "Educación",
  suscripciones: "Suscripciones",
  otros: "Otros",
};

/**
 * Deriva la columna legacy `classification` (need|want|investment) a partir
 * de la canasta. Se usa solo para satisfacer el NOT NULL heredado; el módulo
 * nunca la lee. Limpieza futura: eliminar la columna (ver CONTEXT.md).
 */
export function classificationFromBasket(basket: Basket): string {
  if (basket === "essentials") return "need";
  if (basket === "style") return "want";
  return "investment";
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export interface ExpenseRow {
  type: string; // "fixed" | "variable"
  basket: string; // "essentials" | "style" | "freedom"
  amount: number; // real pagado
  budget: number; // presupuesto
  isActive: boolean;
  isSubscription: boolean;
}

export interface BasketTotals {
  essentials: number;
  style: number;
  freedom: number;
  total: number;
}

/** Suma del REAL pagado por canasta (solo filas activas). */
export function sumRealByBasket(rows: ExpenseRow[]): BasketTotals {
  return sumByBasket(rows, (r) => r.amount);
}

/** Suma del PRESUPUESTO por canasta (solo filas activas). */
export function sumBudgetByBasket(rows: ExpenseRow[]): BasketTotals {
  return sumByBasket(rows, (r) => r.budget);
}

function sumByBasket(
  rows: ExpenseRow[],
  pick: (r: ExpenseRow) => number,
): BasketTotals {
  const acc: BasketTotals = { essentials: 0, style: 0, freedom: 0, total: 0 };
  for (const r of rows) {
    if (!r.isActive) continue;
    if (r.basket === "essentials") acc.essentials += pick(r);
    else if (r.basket === "style") acc.style += pick(r);
    else if (r.basket === "freedom") acc.freedom += pick(r);
  }
  acc.essentials = round2(acc.essentials);
  acc.style = round2(acc.style);
  acc.freedom = round2(acc.freedom);
  acc.total = round2(acc.essentials + acc.style + acc.freedom);
  return acc;
}

export interface TypeTotals {
  fixedReal: number;
  variableReal: number;
  fixedBudget: number;
  variableBudget: number;
  /** Total real (fijos + variables) — este es el expensesTotal del mes. */
  totalReal: number;
  /** Total presupuesto (fijos + variables). */
  totalBudget: number;
}

/** Totales por tipo (Fijos / Variables), real y presupuesto. Solo activos. */
export function totalsByType(rows: ExpenseRow[]): TypeTotals {
  let fixedReal = 0;
  let variableReal = 0;
  let fixedBudget = 0;
  let variableBudget = 0;
  for (const r of rows) {
    if (!r.isActive) continue;
    if (r.type === "fixed") {
      fixedReal += r.amount;
      fixedBudget += r.budget;
    } else if (r.type === "variable") {
      variableReal += r.amount;
      variableBudget += r.budget;
    }
  }
  fixedReal = round2(fixedReal);
  variableReal = round2(variableReal);
  fixedBudget = round2(fixedBudget);
  variableBudget = round2(variableBudget);
  return {
    fixedReal,
    variableReal,
    fixedBudget,
    variableBudget,
    totalReal: round2(fixedReal + variableReal),
    totalBudget: round2(fixedBudget + variableBudget),
  };
}

export interface SubscriptionSummary {
  count: number;
  monthly: number;
  annual: number;
  /** Años de proyección usados para el "peso real". */
  projectionYears: number;
  /** Costo total si se mantienen `projectionYears` años. */
  projectionTotal: number;
}

/**
 * Resumen de suscripciones (solo filas activas con isSubscription=true).
 * Mensual = Σ real, anual = ×12, proyección = mensual × 12 × años.
 */
export function subscriptionSummary(
  rows: ExpenseRow[],
  projectionYears = 5,
): SubscriptionSummary {
  let monthly = 0;
  let count = 0;
  for (const r of rows) {
    if (!r.isActive || !r.isSubscription) continue;
    monthly += r.amount;
    count += 1;
  }
  monthly = round2(monthly);
  return {
    count,
    monthly,
    annual: round2(monthly * 12),
    projectionYears,
    projectionTotal: round2(monthly * 12 * projectionYears),
  };
}

/**
 * Estado de una fila/canasta respecto a su presupuesto, para colorear la
 * barra presupuesto-vs-real: ok (dentro), near (cerca), over (excede).
 */
export type BudgetStatus = "ok" | "near" | "over";

export function budgetStatus(real: number, budget: number): BudgetStatus {
  if (budget <= 0) return "ok"; // sin presupuesto definido, no se marca
  const ratio = real / budget;
  if (ratio > 1) return "over";
  if (ratio >= 0.9) return "near";
  return "ok";
}
