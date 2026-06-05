"use client";

import { useActionState } from "react";
import type { SerializedIncome } from "@/lib/serialize";
import {
  createIncomeAction,
  updateIncomeAction,
  type IncomeActionResult,
} from "./actions";

export function IncomeRowForm({
  plan,
  editing,
  onDoneHref,
}: {
  plan: "A" | "C";
  editing: SerializedIncome | null;
  onDoneHref: string;
}) {
  const action = editing ? updateIncomeAction : createIncomeAction;
  const [state, formAction, pending] = useActionState<
    IncomeActionResult,
    FormData
  >(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {editing && <input type="hidden" name="id" value={editing.id} />}
      <input type="hidden" name="plan" value={plan} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr auto",
          gap: "8px",
          alignItems: "end",
        }}
      >
        <label className="flex flex-col gap-1">
          <span className="label">Nombre</span>
          <input
            name="name"
            type="text"
            maxLength={80}
            required
            defaultValue={editing?.name ?? ""}
            placeholder={
              plan === "A" ? "Salario principal" : "Freelance / proyecto"
            }
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">Monto mensual</span>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={editing ? Number(editing.amount) : ""}
          />
        </label>
        <button
          type="submit"
          className="btn-primary"
          disabled={pending}
          style={{ opacity: pending ? 0.6 : 1 }}
        >
          {pending ? "…" : editing ? "Guardar" : "Agregar"}
        </button>
      </div>

      {state.error && (
        <p style={{ color: "var(--danger)", fontSize: "12px" }}>{state.error}</p>
      )}
      {state.ok && !editing && (
        <p style={{ color: "var(--accent)", fontSize: "12px" }}>Agregado.</p>
      )}
      {state.ok && editing && (
        <p style={{ color: "var(--accent)", fontSize: "12px" }}>
          Cambios guardados. <a href={onDoneHref}>Volver</a>
        </p>
      )}
    </form>
  );
}
