/**
 * Helpers de i18n para el SERVIDOR (Server Components, generateMetadata).
 *
 * `getLocale` está envuelto en React `cache()` para que resolver el locale (que
 * implica leer el perfil) ocurra UNA sola vez por request, aunque lo llamen
 * tanto `generateMetadata` como el propio componente de página.
 */

import { cache } from "react";
import { requireUser } from "@/lib/auth";
import { getDict, type Dict } from "./index";

/** Locale del perfil activo. Fallback "es" si no hay sesión/perfil. */
export const getLocale = cache(async (): Promise<string> => {
  try {
    const { profile } = await requireUser();
    return profile.locale ?? "es";
  } catch {
    return "es";
  }
});

/** Diccionario resuelto para el request actual (server-side). */
export async function getServerDict(): Promise<Dict> {
  return getDict(await getLocale());
}
