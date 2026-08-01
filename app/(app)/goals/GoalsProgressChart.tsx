"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  type ChartConfiguration,
} from "chart.js";
import { useChartTheme } from "@/lib/useChartTheme";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

export type GoalBar = { label: string; pct: number; color: string };

/**
 * Gráfico de barras horizontales del progreso de cada meta (0-100%).
 *
 * Reusa el mismo enfoque de Chart.js que PortfolioDonut (registro de piezas,
 * ref + destroy en cleanup, responsive). El % lo calcula lib/goals.ts; acá solo
 * se presenta. Responsive: ancho 100%, alto proporcional al número de metas,
 * con overflow contenido para que nunca se desborde en móvil.
 */
export function GoalsProgressChart({ bars }: { bars: GoalBar[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const ct = useChartTheme();

  useEffect(() => {
    if (!canvasRef.current) return;
    const cfg: ChartConfiguration<"bar", number[], string> = {
      type: "bar",
      data: {
        labels: bars.map((b) => b.label),
        datasets: [
          {
            data: bars.map((b) => b.pct),
            // Relleno translúcido + contorno brillante del color (mismo estilo
            // "delineado/glow" que el resto de los gráficos: Patrimonio, donut).
            backgroundColor: bars.map((b) => `${b.color}33`),
            borderColor: bars.map((b) => b.color),
            borderWidth: 1.5,
            borderRadius: 4,
            maxBarThickness: 22,
            hoverBackgroundColor: bars.map((b) => `${b.color}55`),
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            min: 0,
            max: 100,
            ticks: {
              color: ct.muted,
              font: { size: 10 },
              callback: (v) => `${v}%`,
            },
            grid: { color: ct.grid },
          },
          y: {
            ticks: { color: ct.text, font: { size: 11 } },
            grid: { display: false },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: ct.tooltipBg,
            borderColor: ct.tooltipBorder,
            borderWidth: 1,
            titleColor: ct.text,
            bodyColor: ct.text,
            padding: 10,
            displayColors: true,
            callbacks: {
              label: (ctx) => `${ctx.parsed.x}%`,
            },
          },
        },
      },
    };
    chartRef.current = new Chart(canvasRef.current, cfg);
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [bars, ct]);

  // Alto proporcional a la cantidad de metas (cada barra ~34px + márgenes).
  const height = Math.max(120, bars.length * 34 + 40);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "100%",
        height,
        overflow: "hidden",
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
