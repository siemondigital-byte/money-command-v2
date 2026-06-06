"use client";

import { useEffect, useState } from "react";
import { usePeriodChange } from "./usePeriodChange";

const MONTH_LABELS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

/**
 * Selector de período global del header.
 *
 * Es un ESPEJO de `Profile.activeYear / activeMonth` (fuente única de verdad):
 * los `<select>` están CONTROLADOS por `value`, no por `defaultValue`. El
 * estado local se siembra de las props del servidor y se re-sincroniza cada
 * vez que esas props cambian — incluso si el período cambió por otra vía (el
 * botón "Ir al mes" de History, un redirect, etc.). Así el selector SIEMPRE
 * muestra el mismo mes que usan las páginas; no puede quedar desfasado.
 *
 * El cambio se aplica vía el helper único `usePeriodChange`, compartido con
 * History.
 */
export function PeriodSelector({
  activeYear,
  activeMonth,
}: {
  activeYear: number;
  activeMonth: number;
}) {
  const { changePeriod, pending } = usePeriodChange();

  // Estado local controlado, sembrado del servidor…
  const [month, setMonth] = useState(activeMonth);
  const [year, setYear] = useState(activeYear);

  // …y re-sincronizado cuando el servidor cambia el período por cualquier vía.
  useEffect(() => {
    setMonth(activeMonth);
  }, [activeMonth]);
  useEffect(() => {
    setYear(activeYear);
  }, [activeYear]);

  // Rango de años: desde 5 atrás hasta 1 adelante del actual
  const currentYear = new Date().getFullYear();
  const yearStart = Math.min(year, currentYear - 5);
  const yearEnd = Math.max(year, currentYear + 1);
  const years: number[] = [];
  for (let y = yearStart; y <= yearEnd; y++) years.push(y);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        opacity: pending ? 0.5 : 1,
      }}
    >
      <span
        style={{
          fontSize: "10px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        Período
      </span>
      <select
        name="month"
        value={month}
        onChange={(e) => {
          const m = Number(e.target.value);
          setMonth(m);
          changePeriod(year, m);
        }}
        disabled={pending}
        style={{ padding: "4px 8px", fontSize: "12px" }}
      >
        {MONTH_LABELS_ES.map((label, idx) => (
          <option key={idx + 1} value={idx + 1}>
            {label}
          </option>
        ))}
      </select>
      <select
        name="year"
        value={year}
        onChange={(e) => {
          const y = Number(e.target.value);
          setYear(y);
          changePeriod(y, month);
        }}
        disabled={pending}
        style={{ padding: "4px 8px", fontSize: "12px" }}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
