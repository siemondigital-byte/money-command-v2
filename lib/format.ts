/**
 * Formatos compartidos entre Server y Client Components.
 *
 * Este módulo es PLANO: sin "use server", sin imports server-only, sin
 * dependencias de Node. Puede importarse desde cualquier capa.
 *
 * Patrón a seguir cuando un Client Component necesita formato:
 *   1. Server pasa primitivas (locale, currency, amount).
 *   2. Client importa formatMoney y llama con esas primitivas.
 * Nunca pasar la función formatter como prop — no cruza el límite.
 */

/** Devuelve un BCP-47 locale válido a partir del campo "es" | "en" del Profile. */
export function bcp47(locale: string): string {
  return locale === "es" ? "es-AR" : "en-US";
}

export interface MoneyOptions {
  /** Máximo de decimales. Default 2. */
  maxFractionDigits?: number;
  /** Mínimo de decimales. Default 0. */
  minFractionDigits?: number;
}

/**
 * Formatea un monto como moneda según locale + currency del Profile.
 *
 * Ejemplo: formatMoney(1234.5, "es", "USD") → "US$1.234,50"
 */
export function formatMoney(
  amount: number,
  locale: string,
  currency: string,
  opts: MoneyOptions = {},
): string {
  return new Intl.NumberFormat(bcp47(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: opts.maxFractionDigits ?? 2,
    minimumFractionDigits: opts.minFractionDigits ?? 0,
  }).format(amount);
}

/**
 * Formatea un porcentaje: pasa el ratio (0.235), devuelve "23.5%".
 */
export function formatPct(
  ratio: number,
  locale: string,
  maxFractionDigits = 1,
): string {
  return new Intl.NumberFormat(bcp47(locale), {
    style: "percent",
    maximumFractionDigits: maxFractionDigits,
  }).format(ratio);
}
