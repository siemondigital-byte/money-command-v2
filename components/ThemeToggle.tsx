"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Switch de tema dark/white en el header (paridad con el planner).
 *
 * El tema real lo fija el script anti-parpadeo del layout raiz (data-theme en
 * <html>) ANTES de pintar, leyendo localStorage 'mc_theme' (por defecto dark).
 * Este boton solo lo alterna y persiste. Mostramos el icono de destino: en
 * oscuro el sol (pasar a claro), en claro la luna (pasar a oscuro).
 *
 * Hidratacion: el server no conoce el tema (lo pone el script en cliente), asi
 * que hasta montar renderizamos el icono por defecto (sol) igual en server y en
 * el primer render de cliente; tras montar se ajusta al tema real. El color de
 * la pagina no parpadea (de eso se encarga el script del <head>); a lo sumo el
 * icono se corrige una vez.
 */
export function ThemeToggle() {
  const t = useTranslations();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "light" ? "light" : "dark");
    setMounted(true);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("mc_theme", next);
    } catch {
      /* modo privado / storage bloqueado: se pierde solo la persistencia */
    }
  }

  const showMoon = mounted && theme === "light";

  return (
    <button
      type="button"
      onClick={toggle}
      className="ah-theme"
      aria-label={t.nav.themeToggle}
      title={t.nav.themeToggle}
      suppressHydrationWarning
    >
      {showMoon ? (
        // Luna: en claro, para volver a oscuro.
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
            fill="currentColor"
          />
        </svg>
      ) : (
        // Sol: en oscuro, para pasar a claro.
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      )}
    </button>
  );
}
