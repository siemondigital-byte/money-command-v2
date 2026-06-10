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
 * Crecimiento por interés compuesto a 30 años, ÁREA APILADA por activo.
 *
 * Recibe sólo datos serializados (arrays de números + colores/nombres +
 * locale/currency como strings); el formato de moneda se arma acá con
 * formatMoney (lib), sin cruzar funciones del server al cliente. Cada banda
 * crece con la tasa y el aporte de su activo; la altura total a cada año es el
 * valor del portafolio completo.
 */
export function GrowthChart({
  years,
  perAsset,
  labels,
  colors,
  locale,
  currency,
}: {
  years: number[];
  perAsset: number[][];
  labels: string[];
  colors: string[];
  locale: string;
  currency: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const xLabels = years.map((y) => (y === 0 ? "Hoy" : `${y}a`));

    const cfg: ChartConfiguration<"line", number[], string> = {
      type: "line",
      data: {
        labels: xLabels,
        datasets: perAsset.map((band, i) => ({
          label: labels[i] ?? `Activo ${i + 1}`,
          data: band,
          borderColor: colors[i] ?? "#7fffb2",
          backgroundColor: (colors[i] ?? "#7fffb2") + "55", // ~33% alpha
          borderWidth: 1.5,
          fill: true,
          tension: 0.25,
          pointRadius: 0,
          pointHoverRadius: 3,
        })),
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
                `${ctx.dataset.label}: ${formatMoney(ctx.parsed.y ?? 0, locale, currency)}`,
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: {
              color: "#6b6b80",
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 9,
            },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: { color: "rgba(255,255,255,0.06)" },
            ticks: {
              color: "#6b6b80",
              maxTicksLimit: 5,
              callback: (value) =>
                new Intl.NumberFormat(locale, {
                  style: "currency",
                  currency,
                  notation: "compact",
                  maximumFractionDigits: 0,
                }).format(Number(value)),
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
  }, [years, perAsset, labels, colors, locale, currency]);

  return (
    <div style={{ position: "relative", width: "100%", height: 280 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
