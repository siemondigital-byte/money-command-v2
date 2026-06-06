"use client";

import { usePeriodChange } from "@/components/usePeriodChange";

/**
 * Botón "Ir al mes" de History. Usa el helper único `usePeriodChange` (el
 * mismo que el selector del header), así no duplica la lógica de cambio de
 * período. Tras cambiarlo, redirige a /income.
 */
export function GoToPeriodButton({
  year,
  month,
}: {
  year: number;
  month: number;
}) {
  const { changePeriod, pending } = usePeriodChange();

  return (
    <button
      type="button"
      onClick={() => changePeriod(year, month, "/income")}
      disabled={pending}
      style={{
        background: "transparent",
        border: "none",
        color: "var(--accent)",
        fontSize: "12px",
        cursor: "pointer",
        fontFamily: "DM Mono, monospace",
        padding: 0,
        opacity: pending ? 0.5 : 1,
      }}
    >
      Ir al mes
    </button>
  );
}
