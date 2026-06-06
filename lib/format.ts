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
  /** Máximo de decimales. Si no se pasa, usa el default por moneda (ISO 4217). */
  maxFractionDigits?: number;
  /** Mínimo de decimales. Si no se pasa, usa el default por moneda (ISO 4217). */
  minFractionDigits?: number;
}

/**
 * Formatea un monto como moneda según locale + currency del Profile.
 *
 * Por default usa los decimales canónicos de cada moneda (ISO 4217):
 *   USD/EUR/MXN/ARS/BRL/PEN → 2 decimales
 *   COP/CLP                 → 0 decimales (entero)
 *
 * No convierte tasas — es puramente cosmético: símbolo y decimales según
 * la moneda elegida en Settings.
 *
 * Ejemplo: formatMoney(1234.5, "es", "USD") → "US$ 1.234,50"
 *          formatMoney(1234.5, "es", "COP") → "$ 1.235"
 */
export function formatMoney(
  amount: number,
  locale: string,
  currency: string,
  opts: MoneyOptions = {},
): string {
  const fmtOpts: Intl.NumberFormatOptions = {
    style: "currency",
    currency,
  };
  if (opts.maxFractionDigits !== undefined) {
    fmtOpts.maximumFractionDigits = opts.maxFractionDigits;
  }
  if (opts.minFractionDigits !== undefined) {
    fmtOpts.minimumFractionDigits = opts.minFractionDigits;
  }
  return new Intl.NumberFormat(bcp47(locale), fmtOpts).format(amount);
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
