/**
 * Lógica del módulo Debts, CAPA 1 — helpers PUROS (sin DB, sin "use server").
 *
 * Debts es "estado actual" (ARQUITECTURA §3, como Investments): una fila por
 * deuda, con un `balance` y su fecha de corte (as-of). El saldo amortiza mes
 * a mes con el pago real y el APR, bajo el modelo confirmar-para-avanzar: el
 * saldo no baja solo, baja cuando la persona confirma el pago del mes.
 *
 * Doctrina (§2): la etiqueta consumo/inversión es educativa, no estructural.
 *
 * Todos los montos se redondean a 2 decimales (KPI = tabla = consolidado).
 */

export type DebtType =
  | "card"
  | "auto_loan"
  | "student_loan"
  | "personal_loan"
  | "mortgage"
  | "other";

export const DEBT_TYPES: DebtType[] = [
  "card",
  "auto_loan",
  "student_loan",
  "personal_loan",
  "mortgage",
  "other",
];

export const DEBT_TYPE_LABELS_ES: Record<DebtType, string> = {
  card: "Tarjeta de crédito",
  auto_loan: "Préstamo auto",
  student_loan: "Deuda estudiantil",
  personal_loan: "Préstamo personal",
  mortgage: "Hipoteca",
  other: "Otro",
};

export type DebtPurpose = "consumption" | "investment";

export const DEBT_PURPOSES: DebtPurpose[] = ["consumption", "investment"];

export const PURPOSE_LABELS_ES: Record<DebtPurpose, string> = {
  consumption: "Consumo",
  investment: "Inversión",
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ============================================================================
// Amortización del saldo (la única matemática financiera de la capa 1)
// ============================================================================

/** Interés de un mes: saldo × (APR anual / 12). */
export function monthlyInterest(balance: number, aprPct: number): number {
  return round2((balance * (aprPct / 100)) / 12);
}

/**
 * Saldo del mes siguiente aplicando un pago: saldo + interés − pago, nunca
 * por debajo de 0.
 */
export function nextBalance(
  balance: number,
  aprPct: number,
  payment: number,
): number {
  const interest = (balance * (aprPct / 100)) / 12;
  return round2(Math.max(0, balance + interest - payment));
}

/**
 * Avanza el saldo `months` meses aplicando el mismo pago. Corta en 0. Si el
 * pago no cubre el interés, el saldo no baja (no entra en bucle infinito:
 * está acotado por `months`).
 */
export function advanceBalance(
  balance: number,
  aprPct: number,
  payment: number,
  months: number,
): number {
  let b = balance;
  for (let i = 0; i < months; i++) {
    if (b <= 0) return 0;
    b = nextBalance(b, aprPct, payment);
  }
  return round2(b);
}

// ============================================================================
// Período / detección de confirmación pendiente
// ============================================================================

export type Period = { year: number; month: number };

/** Índice lineal del período para comparar y restar meses. */
export function periodIndex(p: Period): number {
  return p.year * 12 + (p.month - 1);
}

/** Meses transcurridos entre el as-of del saldo y el período activo (>= 0). */
export function monthsElapsed(asOf: Period, active: Period): number {
  return Math.max(0, periodIndex(active) - periodIndex(asOf));
}

export interface DebtAsOf {
  balanceAsOfYear: number;
  balanceAsOfMonth: number;
  isActive: boolean;
}

/** ¿Hay deudas activas cuyo saldo quedó en un período anterior al activo? */
export function hasDebtsBehind(debts: DebtAsOf[], active: Period): boolean {
  const activeIdx = periodIndex(active);
  return debts.some(
    (d) =>
      d.isActive &&
      periodIndex({ year: d.balanceAsOfYear, month: d.balanceAsOfMonth }) <
        activeIdx,
  );
}

// ============================================================================
// KPIs del módulo
// ============================================================================

export interface DebtRow {
  balance: number;
  apr: number;
  currentPayment: number;
  purpose: string;
  isActive: boolean;
}

/** Deuda total = suma de saldos activos. */
export function sumBalances(debts: DebtRow[]): number {
  return round2(
    debts.filter((d) => d.isActive).reduce((s, d) => s + d.balance, 0),
  );
}

/** Pago mensual = suma de pagos reales activos. */
export function sumMonthlyPayments(debts: DebtRow[]): number {
  return round2(
    debts.filter((d) => d.isActive).reduce((s, d) => s + d.currentPayment, 0),
  );
}

/** APR ponderado por saldo: Σ(balance × apr) / Σ balance. 0 si no hay saldo. */
export function weightedApr(debts: DebtRow[]): number {
  const active = debts.filter((d) => d.isActive);
  const totalBalance = active.reduce((s, d) => s + d.balance, 0);
  if (totalBalance <= 0) return 0;
  const weighted = active.reduce((s, d) => s + d.balance * d.apr, 0);
  return round2(weighted / totalBalance);
}

/** Ratio deuda/ingreso = pago mensual / ingreso mensual (fracción). 0 si no hay ingreso. */
export function debtToIncomeRatio(
  monthlyPayment: number,
  monthlyIncome: number,
): number {
  if (monthlyIncome <= 0) return 0;
  return monthlyPayment / monthlyIncome;
}

export type DtiStatus = "healthy" | "warning" | "danger";

/**
 * Umbral de salud financiera. <36% saludable (estándar), 36-43% atención,
 * >=43% riesgo. `ratio` es fracción (0.36 = 36%).
 */
export function dtiStatus(ratio: number): DtiStatus {
  if (ratio < 0.36) return "healthy";
  if (ratio < 0.43) return "warning";
  return "danger";
}

export interface PurposeSplit {
  consumption: number;
  investment: number;
}

/** Desglose de la deuda total por etiqueta consumo/inversión (saldos activos). */
export function splitByPurpose(debts: DebtRow[]): PurposeSplit {
  const acc: PurposeSplit = { consumption: 0, investment: 0 };
  for (const d of debts) {
    if (!d.isActive) continue;
    if (d.purpose === "investment") acc.investment += d.balance;
    else acc.consumption += d.balance;
  }
  return {
    consumption: round2(acc.consumption),
    investment: round2(acc.investment),
  };
}

// ============================================================================
// CAPA 2 — Estrategias de pago (Avalancha / Bola de Nieve) con rollover
// ============================================================================

export type Strategy = "avalanche" | "snowball";

export interface DebtForPayoff {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minPayment: number;
  currentPayment: number;
}

export interface PayoffResult {
  /** Meses hasta quedar libre de deudas (0 si no hay deuda). */
  months: number;
  /** Interés total pagado en el camino. */
  totalInterest: number;
  /** Presupuesto mensual = suma de pagos reales (igual en ambas estrategias). */
  budget: number;
  /** false si no se salda dentro del tope de seguridad (pago no cubre interés). */
  converges: boolean;
  /** Orden de ataque de las deudas. */
  order: { id: string; name: string }[];
  /** Saldo total mes a mes para el gráfico. schedule[0] = hoy. */
  schedule: number[];
}

/** Tope de seguridad: 50 años. Evita colgar si la deuda no converge. */
export const PAYOFF_MAX_MONTHS = 600;

function orderForStrategy<T extends { apr: number; balance: number }>(
  debts: T[],
  strategy: Strategy,
): T[] {
  const copy = [...debts];
  if (strategy === "avalanche") {
    // Mayor APR primero; desempate por menor saldo.
    copy.sort((a, b) => b.apr - a.apr || a.balance - b.balance);
  } else {
    // Menor saldo primero; desempate por mayor APR.
    copy.sort((a, b) => a.balance - b.balance || b.apr - a.apr);
  }
  return copy;
}

/**
 * Simula el pago mes a mes hasta saldar todas las deudas, con el método del
 * rollover: el presupuesto total (suma de pagos reales) es constante; cada
 * mes se aplica interés, se pagan los mínimos, y el sobrante ataca íntegro a
 * la deuda objetivo (la primera del orden con saldo). Cuando una deuda llega
 * a 0, su pago se libera y engrosa el ataque a la siguiente (rollover, que
 * acá emerge solo de mantener el presupuesto constante y redirigir el
 * sobrante).
 */
export function simulatePayoff(
  debts: DebtForPayoff[],
  strategy: Strategy,
): PayoffResult {
  const work = debts.map((d) => ({
    id: d.id,
    name: d.name,
    balance: round2(d.balance),
    apr: d.apr,
    minPayment: d.minPayment,
  }));
  const budget = round2(debts.reduce((s, d) => s + d.currentPayment, 0));

  const order = orderForStrategy(work, strategy);
  const orderMeta = order.map((d) => ({ id: d.id, name: d.name }));

  const initialTotal = round2(work.reduce((s, d) => s + Math.max(0, d.balance), 0));
  const schedule: number[] = [initialTotal];

  if (work.length === 0 || initialTotal <= 0) {
    return {
      months: 0,
      totalInterest: 0,
      budget,
      converges: true,
      order: orderMeta,
      schedule,
    };
  }

  let totalInterest = 0;
  let months = 0;

  while (months < PAYOFF_MAX_MONTHS) {
    if (work.every((d) => d.balance <= 0)) break;
    months++;

    // 1. Interés del mes
    for (const d of work) {
      if (d.balance <= 0) continue;
      const interest = round2((d.balance * (d.apr / 100)) / 12);
      d.balance = round2(d.balance + interest);
      totalInterest = round2(totalInterest + interest);
    }

    let available = budget;

    // 2. Pagar los mínimos (acotado por el presupuesto disponible)
    for (const d of work) {
      if (d.balance <= 0 || available <= 0) continue;
      const pay = Math.min(d.minPayment, d.balance, available);
      d.balance = round2(d.balance - pay);
      available = round2(available - pay);
    }

    // 3. El sobrante ataca a la deuda objetivo, cascadeando si se salda
    for (const d of order) {
      if (available <= 0) break;
      if (d.balance <= 0) continue;
      const pay = Math.min(available, d.balance);
      d.balance = round2(d.balance - pay);
      available = round2(available - pay);
    }

    schedule.push(round2(work.reduce((s, d) => s + Math.max(0, d.balance), 0)));
  }

  const converges = work.every((d) => d.balance <= 0);
  return { months, totalInterest, budget, converges, order: orderMeta, schedule };
}

export interface StrategyComparison {
  avalanche: PayoffResult;
  snowball: PayoffResult;
  /** Interés que ahorra la avalancha vs la bola de nieve (>= 0 normalmente). */
  interestSaved: number;
  recommended: Strategy;
  budget: number;
}

/**
 * Corre ambas estrategias y las compara. La avalancha es la recomendada por
 * defecto (paga menos interés); la bola de nieve da victorias más rápidas.
 */
export function compareStrategies(debts: DebtForPayoff[]): StrategyComparison {
  const avalanche = simulatePayoff(debts, "avalanche");
  const snowball = simulatePayoff(debts, "snowball");
  const interestSaved = round2(snowball.totalInterest - avalanche.totalInterest);
  return {
    avalanche,
    snowball,
    interestSaved,
    recommended: "avalanche",
    budget: avalanche.budget,
  };
}
