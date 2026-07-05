/**
 * Diccionario EN — STUB.
 *
 * Arranca como copia de `es` (mismas claves, mismos valores en español) para
 * tener el tipo COMPLETO sin romper nada. A medida que se traduzca, se van
 * reemplazando secciones por su versión en inglés. Cualquier clave que falte en
 * `en` cae automáticamente a español vía el merge de ./index.ts.
 *
 * TODO EN: traducir sección por sección (nav, metadata, settings, labels…).
 * Ejemplo de override futuro:
 *   export const en: typeof es = {
 *     ...es,
 *     nav: { ...es.nav, dashboard: "Dashboard", income: "Income", ... },
 *   };
 */

import { es } from "./es";

export const en: typeof es = {
  // TODO EN: por ahora, copia de `es` (fallback a español).
  ...es,
};
