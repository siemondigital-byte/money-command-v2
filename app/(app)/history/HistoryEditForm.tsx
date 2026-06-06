"use client";

import { useActionState } from "react";
import type { SerializedMonthlyRecord } from "@/lib/serialize";
import {
  updateMonthlyRecordAction,
  type HistoryActionResult,
} from "./actions";

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

export function HistoryEditForm({
  record,
  onDoneHref,
}: {
  record: SerializedMonthlyRecord;
  onDoneHref: string;
}) {
  const [state, formAction, pending] = useActionState<
    HistoryActionResult,
    FormData
  >(updateMonthlyRecordAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={record.id} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "12px",
          alignItems: "end",
        }}
      >
        <label className="flex flex-col gap-1">
          <span className="label">Mes</span>
          <select name="month" defaultValue={record.month}>
            {MONTH_LABELS_ES.map((m, i) => (
              <option key={i + 1} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">Año</span>
          <input
            name="year"
            type="number"
            min="2000"
            max="2100"
            step="1"
            required
            defaultValue={record.year}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">Ingresos</span>
          <input
            name="incomeTotal"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={record.incomeTotal}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">Gastos</span>
          <input
            name="expenseTotal"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={record.expenseTotal}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">Patrimonio</span>
          <input
            name="netWorth"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={record.netWorth}
          />
        </label>
      </div>

      <p style={{ fontSize: "11px", color: "var(--hint)" }}>
        La tasa de ahorro se recalcula sola a partir de Ingresos y Gastos. Si
        cambiás el mes/año a uno que ya tiene registro, no se sobrescribe.
      </p>

      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <button
          type="submit"
          className="btn-primary"
          disabled={pending}
          style={{ opacity: pending ? 0.6 : 1 }}
        >
          {pending ? "…" : "Guardar"}
        </button>
        <a href={onDoneHref} style={{ color: "var(--muted)", fontSize: "12px" }}>
          Cancelar
        </a>
      </div>

      {state.error && (
        <p style={{ color: "var(--danger)", fontSize: "12px" }}>{state.error}</p>
      )}
      {state.ok && (
        <p style={{ color: "var(--accent)", fontSize: "12px" }}>
          Cambios guardados. <a href={onDoneHref}>Volver al historial</a>
        </p>
      )}
    </form>
  );
}
