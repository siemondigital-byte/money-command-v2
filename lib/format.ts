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
 * Por default se muestra SIN decimales (redondeado al entero más cercano), en
 * toda la app. Si hiciera falta, se pueden pedir decimales vía opts.
 *
 * No convierte tasas — es puramente cosmético: símbolo y decimales según
 * la moneda elegida en Settings.
 *
 * Ejemplo: formatMoney(1234.5, "es", "USD") → "US$ 1.235"
 *          formatMoney(1234.5, "es", "COP") → "$ 1.235"
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
    // Default: 0 decimales (entero). opts puede pedir decimales si se necesita.
    maximumFractionDigits: opts.maxFractionDigits ?? 0,
    minimumFractionDigits: opts.minFractionDigits ?? 0,
  }).format(amount);
}

/**
 * Separa un monto formateado en su SÍMBOLO de moneda y el NÚMERO, para poder
 * mostrar el símbolo (ej. "US$") más chico que el número y que no se coma el
 * ancho de la tarjeta. Sin decimales por default, igual que formatMoney.
 *
 * Ejemplo: splitMoney(432000, "es", "USD") → { symbol: "US$", number: "432.000" }
 */
export function splitMoney(
  amount: number,
  locale: string,
  currency: string,
  opts: MoneyOptions = {},
): { symbol: string; number: string } {
  const parts = new Intl.NumberFormat(bcp47(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: opts.maxFractionDigits ?? 0,
    minimumFractionDigits: opts.minFractionDigits ?? 0,
  }).formatToParts(amount);

  let symbol = "";
  let number = "";
  for (const p of parts) {
    if (p.type === "currency") {
      symbol += p.value;
    } else if (p.type === "literal" && p.value.trim() === "") {
      // espacio entre símbolo y número: lo reemplazamos por el margen del span
      continue;
    } else {
      number += p.value;
    }
  }
  return { symbol, number };
}

/**
 * Formatea un porcentaje: pasa el ratio (0.235), devuelve "24%".
 * Por default sin decimales.
 */
export function formatPct(
  ratio: number,
  locale: string,
  maxFractionDigits = 0,
): string {
  return new Intl.NumberFormat(bcp47(locale), {
    style: "percent",
    maximumFractionDigits: maxFractionDigits,
  }).format(ratio);
}

/**
 * Formato compacto SOLO para millones: abrevia con "M" (un decimal si aporta)
 * los montos de 1.000.000 o más. Los menores se muestran completos, con
 * separador de miles y SIN decimales (igual que formatMoney).
 *
 * Pensado para el Dashboard (tarjetas KPI, barras del método, termostato,
 * Calculadora de Libertad), donde los montos grandes no deben desbordar.
 *
 *   formatMoneyShort(1_200_000, "es", "USD") → "US$ 1,2M"
 *   formatMoneyShort(2_000_000, "es", "USD") → "US$ 2M"
 *   formatMoneyShort(955_882,   "es", "USD") → "US$ 955.882"
 *   formatMoneyShort(14_516,    "en", "USD") → "$14,516"
 */
export function formatMoneyShort(
  amount: number,
  locale: string,
  currency: string,
): string {
  if (Math.abs(amount) >= 1_000_000) {
    const millions = Math.round((amount / 1_000_000) * 10) / 10;
    const hasFraction = millions % 1 !== 0;
    const num = new Intl.NumberFormat(bcp47(locale), {
      style: "currency",
      currency,
      minimumFractionDigits: hasFraction ? 1 : 0,
      maximumFractionDigits: 1,
    }).format(millions);
    return `${num}M`;
  }
  return formatMoney(amount, locale, currency);
}

/**
 * Igual que formatMoneyShort pero separando símbolo y número (para MoneyAmount,
 * que muestra el símbolo más chico). Para millones el número incluye la "M".
 *
 *   splitMoneyShort(1_200_000, "es", "USD") → { symbol: "US$", number: "1,2M" }
 *   splitMoneyShort(14_516,    "es", "USD") → { symbol: "US$", number: "14.516" }
 */
export function splitMoneyShort(
  amount: number,
  locale: string,
  currency: string,
): { symbol: string; number: string } {
  if (Math.abs(amount) >= 1_000_000) {
    const millions = Math.round((amount / 1_000_000) * 10) / 10;
    const hasFraction = millions % 1 !== 0;
    const parts = new Intl.NumberFormat(bcp47(locale), {
      style: "currency",
      currency,
      minimumFractionDigits: hasFraction ? 1 : 0,
      maximumFractionDigits: 1,
    }).formatToParts(millions);

    let symbol = "";
    let number = "";
    for (const p of parts) {
      if (p.type === "currency") {
        symbol += p.value;
      } else if (p.type === "literal" && p.value.trim() === "") {
        continue;
      } else {
        number += p.value;
      }
    }
    return { symbol, number: `${number}M` };
  }
  return splitMoney(amount, locale, currency);
}
