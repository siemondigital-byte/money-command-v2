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
import { useChartTheme } from "@/lib/useChartTheme";

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
  todayLabel,
  assetFallback,
}: {
  years: number[];
  perAsset: number[][];
  labels: string[];
  colors: string[];
  locale: string;
  currency: string;
  todayLabel: string;
  assetFallback: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const ct = useChartTheme();

  useEffect(() => {
    if (!canvasRef.current) return;

    const xLabels = years.map((y) => (y === 0 ? todayLabel : `${y}a`));

    const cfg: ChartConfiguration<"line", number[], string> = {
      type: "line",
      data: {
        labels: xLabels,
        datasets: perAsset.map((band, i) => ({
          label: labels[i] ?? `${assetFallback} ${i + 1}`,
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
            backgroundColor: ct.tooltipBg,
            borderColor: ct.tooltipBorder,
            borderWidth: 1,
            titleColor: ct.text,
            bodyColor: ct.text,
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
              color: ct.muted,
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 9,
            },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: { color: ct.grid },
            ticks: {
              color: ct.muted,
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
  }, [years, perAsset, labels, colors, locale, currency, todayLabel, assetFallback, ct]);

  return (
    <div style={{ position: "relative", width: "100%", height: 280 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
