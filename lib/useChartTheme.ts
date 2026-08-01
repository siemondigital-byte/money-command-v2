"use client";

import { useEffect, useState } from "react";

/**
 * Colores de los graficos (Chart.js) segun el tema activo.
 *
 * Chart.js pinta en <canvas>, no lee variables CSS, asi que sus colores estaban
 * fijos en oscuro (texto casi blanco, grid blanca) y en tema claro quedaban
 * invisibles. Este hook lee las variables del tema VIVO desde <html> y fuerza
 * un re-render cuando cambia data-theme (el switch del header), para que los
 * graficos se re-dibujen con los colores correctos al alternar dark/white.
 */
export type ChartTheme = {
  text: string;
  muted: string;
  grid: string;
  tooltipBg: string;
  tooltipBorder: string;
};

const DARK: ChartTheme = {
  text: "#f0f0f8",
  muted: "#6b6b80",
  grid: "rgba(255,255,255,0.06)",
  tooltipBg: "#1c1c27",
  tooltipBorder: "rgba(255,255,255,0.12)",
};

function read(): ChartTheme {
  if (typeof window === "undefined") return DARK;
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) =>
    cs.getPropertyValue(name).trim() || fallback;
  const light =
    document.documentElement.getAttribute("data-theme") === "light";
  return {
    text: v("--text", DARK.text),
    muted: v("--muted", DARK.muted),
    // El grid y el borde del tooltip se derivan del tema (no hay variable propia
    // para ellos): lineas oscuras tenues en claro, claras tenues en oscuro.
    grid: light ? "rgba(15,15,31,0.08)" : DARK.grid,
    tooltipBg: v("--surface-2", DARK.tooltipBg),
    tooltipBorder: light ? "rgba(15,15,31,0.14)" : DARK.tooltipBorder,
  };
}

export function useChartTheme(): ChartTheme {
  const [theme, setTheme] = useState<ChartTheme>(read);

  useEffect(() => {
    setTheme(read());
    const obs = new MutationObserver(() => setTheme(read()));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => obs.disconnect();
  }, []);

  return theme;
}
