/**
 * Helpers de i18n para el SERVIDOR (Server Components, generateMetadata).
 *
 * `getLocale` está envuelto en React `cache()` para que resolver el locale (que
 * implica leer el perfil) ocurra UNA sola vez por request, aunque lo llamen
 * tanto `generateMetadata` como el propio componente de página.
 */

import { cache } from "react";
import { headers } from "next/headers";
import { requireUser } from "@/lib/auth";
import { getDict, type Dict, type Locale } from "./index";

/**
 * Idioma preferido del navegador a partir de `Accept-Language`.
 * Respeta los factores de calidad (q=) y solo devuelve idiomas soportados.
 * Ej.: "en-US,en;q=0.9,es;q=0.8" → "en"  ·  "es-CO,es;q=0.9" → "es".
 */
function pickFromAcceptLanguage(header: string): Locale {
  const items = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      const quality = q ? Number.parseFloat(q.split("=")[1]) : 1;
      return { tag: tag.trim().toLowerCase(), q: Number.isFinite(quality) ? quality : 0 };
    })
    .filter((i) => i.tag)
    .sort((a, b) => b.q - a.q);

  for (const item of items) {
    const base = item.tag.split("-")[0];
    if (base === "en") return "en";
    if (base === "es") return "es";
  }
  return "es";
}

/** Idioma del navegador (para rutas SIN sesión: login, signup, recovery). */
export const getBrowserLocale = cache(async (): Promise<Locale> => {
  try {
    const h = await headers();
    return pickFromAcceptLanguage(h.get("accept-language") ?? "");
  } catch {
    return "es";
  }
});

/**
 * Locale del perfil activo. Si no hay sesión (login y demás rutas públicas),
 * se usa el idioma del navegador en vez de forzar español.
 */
export const getLocale = cache(async (): Promise<string> => {
  try {
    const { profile } = await requireUser();
    return profile.locale ?? "es";
  } catch {
    return await getBrowserLocale();
  }
});

/** Diccionario resuelto para el request actual (server-side). */
export async function getServerDict(): Promise<Dict> {
  return getDict(await getLocale());
}
