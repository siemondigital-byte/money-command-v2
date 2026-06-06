"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  type ChartConfiguration,
} from "chart.js";
import { formatMoney } from "@/lib/format";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
);

/**
 * Proyección de reducción de deuda: área que muestra cómo baja el saldo total
 * mes a mes hasta 0, usando el `schedule` de la estrategia recomendada.
 *
 * Recibe sólo datos serializados (arrays de números + locale/currency como
 * strings); el formato de moneda se arma acá con formatMoney (lib), sin cruzar
 * funciones del server al cliente.
 */
export function DebtProjectionChart({
  schedule,
  locale,
  currency,
}: {
  schedule: number[];
  locale: string;
  currency: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const labels = schedule.map((_, i) => (i === 0 ? "Hoy" : `M${i}`));

    const cfg: ChartConfiguration<"line", number[], string> = {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            data: schedule,
            borderColor: "#7fffb2",
            backgroundColor: "rgba(127, 255, 178, 0.12)",
            borderWidth: 2,
            fill: true,
            tension: 0.25,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: "#7fffb2",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: "index" },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1c1c27",
            borderColor: "rgba(255,255,255,0.12)",
            borderWidth: 1,
            titleColor: "#f0f0f8",
            bodyColor: "#f0f0f8",
            padding: 10,
            callbacks: {
              label: (ctx) =>
                formatMoney(ctx.parsed.y ?? 0, locale, currency),
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: "#6b6b80",
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 8,
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(255,255,255,0.06)" },
            ticks: {
              color: "#6b6b80",
              maxTicksLimit: 5,
              callback: (value) =>
                formatMoney(Number(value), locale, currency, {
                  maxFractionDigits: 0,
                }),
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
  }, [schedule, locale, currency]);

  return (
    <div style={{ position: "relative", width: "100%", height: 240 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
