"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { SerializedMonthlyRecord } from "@/lib/serialize";
import { useTranslations } from "@/lib/i18n/provider";
import {
  updateMonthlyRecordAction,
  type HistoryActionResult,
} from "./actions";

export function HistoryEditForm({
  record,
  onDoneHref,
}: {
  record: SerializedMonthlyRecord;
  onDoneHref: string;
}) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState<
    HistoryActionResult,
    FormData
  >(updateMonthlyRecordAction, {});
  const router = useRouter();

  // Al guardar con éxito, cerrar el editor y volver a la vista de tarjetas:
  // limpia el ?edit= de la URL. Mismo patrón que GoalForm y los otros forms.
  useEffect(() => {
    if (state.ok) router.replace(onDoneHref);
  }, [state.ok, router, onDoneHref]);

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
          <span className="label">{t.history.colMonth}</span>
          <select name="month" defaultValue={record.month}>
            {t.labels.months.map((m, i) => (
              <option key={i + 1} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">{t.history.fieldYear}</span>
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
          <span className="label">{t.history.colIncome}</span>
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
          <span className="label">{t.history.colExpenses}</span>
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
          <span className="label">{t.history.colNetWorth}</span>
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
        {t.history.formHelp}
      </p>

      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <button
          type="submit"
          className="btn-primary"
          disabled={pending}
          style={{ opacity: pending ? 0.6 : 1 }}
        >
          {pending ? "…" : t.history.save}
        </button>
        <a href={onDoneHref} style={{ color: "var(--muted)", fontSize: "12px" }}>
          {t.history.cancel}
        </a>
      </div>

      {state.error && (
        <p style={{ color: "var(--danger)", fontSize: "12px" }}>{state.error}</p>
      )}
      {state.ok && (
        <p style={{ color: "var(--accent)", fontSize: "12px" }}>
          {t.history.savedPre} <a href={onDoneHref}>{t.history.backToHistory}</a>
        </p>
      )}
    </form>
  );
}
