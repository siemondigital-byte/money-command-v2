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

  useEffect(() => {
    if (!canvasRef.current) return;
    const cfg: ChartConfiguration<"doughnut", number[], string> = {
      type: "doughnut",
      data: {
        labels: slices.map((s) => s.label),
        datasets: [
          {
            data: slices.map((s) => s.capital),
            backgroundColor: slices.map((s) => s.color),
            borderColor: "#13131a",
            borderWidth: 2,
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
            backgroundColor: "#1c1c27",
            borderColor: "rgba(255,255,255,0.12)",
            borderWidth: 1,
            titleColor: "#f0f0f8",
            bodyColor: "#f0f0f8",
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
  }, [slices]);

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
