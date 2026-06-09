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

  useEffect(() => {
    if (!canvasRef.current) return;
    const cfg: ChartConfiguration<"bar", number[], string> = {
      type: "bar",
      data: {
        labels: bars.map((b) => b.label),
        datasets: [
          {
            data: bars.map((b) => b.pct),
            backgroundColor: bars.map((b) => b.color),
            borderRadius: 4,
            maxBarThickness: 22,
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
              color: "#6b6b80",
              font: { size: 10 },
              callback: (v) => `${v}%`,
            },
            grid: { color: "rgba(255,255,255,0.06)" },
          },
          y: {
            ticks: { color: "#f0f0f8", font: { size: 11 } },
            grid: { display: false },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1c1c27",
            borderColor: "rgba(255,255,255,0.12)",
            borderWidth: 1,
            titleColor: "#f0f0f8",
            bodyColor: "#f0f0f8",
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
  }, [bars]);

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
