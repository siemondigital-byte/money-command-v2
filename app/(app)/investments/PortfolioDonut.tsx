"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
  type ChartConfiguration,
} from "chart.js";
import { useChartTheme } from "@/lib/useChartTheme";

Chart.register(ArcElement, DoughnutController, Tooltip, Legend);

export type DonutSlice = {
  category: string;
  label: string;
  capital: number;
  color: string;
};

export function PortfolioDonut({
  slices,
  formattedTotal,
}: {
  slices: DonutSlice[];
  formattedTotal: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const ct = useChartTheme();

  useEffect(() => {
    if (!canvasRef.current) return;
    const cfg: ChartConfiguration<"doughnut", number[], string> = {
      type: "doughnut",
      data: {
        labels: slices.map((s) => s.label),
        datasets: [
          {
            data: slices.map((s) => s.capital),
            // Relleno translúcido + contorno brillante del color, para igualar el
            // estilo "delineado/glow" de las barras de Patrimonio (uniformidad).
            backgroundColor: slices.map((s) => `${s.color}33`),
            borderColor: slices.map((s) => s.color),
            borderWidth: 1.5,
            hoverBackgroundColor: slices.map((s) => `${s.color}55`),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
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
          },
        },
      },
    };
    chartRef.current = new Chart(canvasRef.current, cfg);
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [slices, ct]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 180,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <canvas ref={canvasRef} />
      <div
        style={{
          position: "absolute",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div className="label" style={{ marginBottom: 2 }}>
          Total
        </div>
        <div
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--text)",
          }}
        >
          {formattedTotal}
        </div>
      </div>
    </div>
  );
}
