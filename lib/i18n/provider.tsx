"use client";

/**
 * Provider ligero para consumir el diccionario en Client Components.
 *
 * El dict se resuelve SERVER-SIDE (desde profile.locale) en el layout autenticado
 * y se pasa por prop. Los Client Components lo leen con useTranslations(). Como
 * ya viene resuelto por locale, se consume directo: t.nav.dashboard, etc.
 */

import { createContext, useContext, type ReactNode } from "react";
import type { Dict } from "./index";

const I18nContext = createContext<Dict | null>(null);

export function I18nProvider({
  dict,
  children,
}: {
  dict: Dict;
  children: ReactNode;
}) {
  return <I18nContext.Provider value={dict}>{children}</I18nContext.Provider>;
}

/** Hook para leer el diccionario resuelto por locale. */
export function useTranslations(): Dict {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslations debe usarse dentro de <I18nProvider>.");
  }
  return ctx;
}
