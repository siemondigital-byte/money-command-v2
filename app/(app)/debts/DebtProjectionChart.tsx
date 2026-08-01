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
  todayLabel,
}: {
  schedule: number[];
  locale: string;
  currency: string;
  todayLabel: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const ct = useChartTheme();

  useEffect(() => {
    if (!canvasRef.current) return;

    const labels = schedule.map((_, i) => (i === 0 ? todayLabel : `M${i}`));

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
            backgroundColor: ct.tooltipBg,
            borderColor: ct.tooltipBorder,
            borderWidth: 1,
            titleColor: ct.text,
            bodyColor: ct.text,
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
              color: ct.muted,
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 8,
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: ct.grid },
            ticks: {
              color: ct.muted,
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
  }, [schedule, locale, currency, todayLabel, ct]);

  return (
    <div style={{ position: "relative", width: "100%", height: 240 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
