"use client";

import { useActionState, useState } from "react";
import {
  updatePlanBOverrideAction,
  type IncomeActionResult,
} from "./actions";

export function PlanBOverrideForm({
  enabled,
  amount,
  autoAmount,
  formatMoney,
}: {
  enabled: boolean;
  amount: number | null;
  autoAmount: number;
  formatMoney: (n: number) => string;
}) {
  const [state, formAction, pending] = useActionState<
    IncomeActionResult,
    FormData
  >(updatePlanBOverrideAction, {});
  const [localEnabled, setLocalEnabled] = useState(enabled);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
          color: "var(--text)",
        }}
      >
        <input
          type="checkbox"
          name="enable"
          value="true"
          defaultChecked={enabled}
          onChange={(e) => setLocalEnabled(e.currentTarget.checked)}
          style={{ width: "auto", margin: 0 }}
        />
        <span>Usar valor manual de Plan B</span>
      </label>

      {localEnabled && (
        <label className="flex flex-col gap-1">
          <span className="label">Monto mensual manual</span>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            defaultValue={amount ?? ""}
            placeholder={`auto: ${formatMoney(autoAmount)}`}
          />
          <span
            style={{
              fontSize: "11px",
              color: "var(--hint)",
              lineHeight: 1.5,
            }}
          >
            El valor automático sigue siendo {formatMoney(autoAmount)} desde
            Inversiones. Tu valor manual va a sobrescribirlo.
          </span>
        </label>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div>
          {state.error && (
            <span style={{ color: "var(--danger)", fontSize: "12px" }}>
              {state.error}
            </span>
          )}
          {state.ok && (
            <span style={{ color: "var(--accent)", fontSize: "12px" }}>
              Guardado.
            </span>
          )}
        </div>
        <button
          type="submit"
          className="btn-secondary"
          disabled={pending}
          style={{ opacity: pending ? 0.6 : 1 }}
        >
          {pending ? "Guardando…" : "Aplicar"}
        </button>
      </div>
    </form>
  );
}
