"use client";

import { useActionState } from "react";
import type { SerializedExpense } from "@/lib/serialize";
import {
  BASKETS,
  BASKET_LABELS_ES,
  EXPENSE_CATEGORIES,
  CATEGORY_LABELS_ES,
} from "@/lib/expenses";
import {
  createExpenseAction,
  updateExpenseAction,
  type ExpenseActionResult,
} from "./actions";

/**
 * Form para crear/editar un gasto fijo o variable. El `type` lo fija el tab
 * activo (Fijos/Variables) y viaja como hidden. Canasta + categoría + montos
 * presupuesto/real. Importa helpers de formato/listas desde lib (nada
 * Server→Client).
 */
export function ExpenseForm({
  type,
  editing,
  onDoneHref,
}: {
  type: "fixed" | "variable";
  editing: SerializedExpense | null;
  onDoneHref: string;
}) {
  const action = editing ? updateExpenseAction : createExpenseAction;
  const [state, formAction, pending] = useActionState<
    ExpenseActionResult,
    FormData
  >(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {editing && <input type="hidden" name="id" value={editing.id} />}
      <input type="hidden" name="type" value={type} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr 1fr",
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
            placeholder={type === "fixed" ? "Renta, seguro…" : "Súper, salidas…"}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">Categoría</span>
          <select
            name="category"
            defaultValue={editing?.category ?? "vivienda"}
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS_ES[c] ?? c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">Canasta</span>
          <select name="basket" defaultValue={editing?.basket ?? "essentials"}>
            {BASKETS.map((b) => (
              <option key={b} value={b}>
                {BASKET_LABELS_ES[b]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr auto",
          gap: "8px",
          alignItems: "end",
        }}
      >
        <label className="flex flex-col gap-1">
          <span className="label">Presupuesto</span>
          <input
            name="budget"
            type="number"
            step="0.01"
            min="0"
            defaultValue={editing ? editing.budget : ""}
            placeholder="0.00"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">Real pagado</span>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={editing ? editing.amount : ""}
            placeholder="0.00"
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
