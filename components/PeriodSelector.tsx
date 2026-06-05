"use client";

import { useRef, useTransition } from "react";
import { setActivePeriodAction } from "@/app/(app)/_actions/period";

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
 * Selector de período global del header. Persiste en Profile.activeYear /
 * activeMonth via Server Action. Al cambiar revalida toda la app.
 */
export function PeriodSelector({
  activeYear,
  activeMonth,
}: {
  activeYear: number;
  activeMonth: number;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    startTransition(() => {
      setActivePeriodAction(fd);
    });
  };

  // Rango de años: desde 5 atrás hasta 1 adelante del actual
  const currentYear = new Date().getFullYear();
  const yearStart = Math.min(activeYear, currentYear - 5);
  const yearEnd = Math.max(activeYear, currentYear + 1);
  const years: number[] = [];
  for (let y = yearStart; y <= yearEnd; y++) years.push(y);

  return (
    <form
      ref={formRef}
      action={setActivePeriodAction}
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
        defaultValue={activeMonth}
        onChange={submit}
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
        defaultValue={activeYear}
        onChange={submit}
        disabled={pending}
        style={{ padding: "4px 8px", fontSize: "12px" }}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </form>
  );
}
