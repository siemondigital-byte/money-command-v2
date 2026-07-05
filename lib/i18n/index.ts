/**
 * Capa i18n — núcleo. Diccionario propio liviano, sin dependencias nuevas.
 *
 * - `Dict` se deriva de `es` (fuente de verdad).
 * - `getDict(locale)` devuelve el diccionario resuelto para Server Components.
 *   Para "en" devuelve `es` con los overrides de `en` mergeados por encima, así
 *   cualquier clave que falte en `en` cae a español (nunca un blanco).
 * - Los Client Components consumen el dict vía el provider (./provider).
 */

import { es } from "./es";
import { en } from "./en";

export type Locale = "es" | "en";

/** Forma del diccionario (todas las claves, valores string). */
export type Dict = typeof es;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Merge profundo: `override` pisa a `base`; donde `override` no define una
 * clave, queda la de `base`. Arrays y strings se reemplazan enteros. Es lo que
 * garantiza el fallback ES ante una traducción EN parcial.
 */
function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override ?? base) as T;
  }
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(override)) {
    const b = (base as Record<string, unknown>)[key];
    const o = override[key];
    out[key] =
      isPlainObject(b) && isPlainObject(o) ? deepMerge(b, o) : (o ?? b);
  }
  return out as T;
}

// `en` mergeado sobre `es` una sola vez (al cargar el módulo).
const enResolved: Dict = deepMerge(es, en);

/**
 * Diccionario resuelto para un locale. Fallback a `es` para cualquier valor que
 * no sea exactamente "en" (incluye null/undefined si falta sesión/perfil).
 */
export function getDict(locale?: string | null): Dict {
  return locale === "en" ? enResolved : es;
}
