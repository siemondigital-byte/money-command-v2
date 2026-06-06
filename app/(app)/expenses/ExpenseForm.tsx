"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
 * activo (Fijos/Variables) y viaja como hidden.
 *
 * - Agregar: arranca colapsado en un botón "Agregar"; al guardar con éxito se
 *   vuelve a colapsar (el gasto aparece en la lista por la revalidación).
 * - Editar: se abre vía ?edit=ID; al guardar con éxito vuelve a la lista
 *   (limpia el ?edit=), cerrándose solo sin necesidad de "Volver".
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
  const router = useRouter();
  const isEditing = editing != null;
  const action = isEditing ? updateExpenseAction : createExpenseAction;
  const [state, formAction, pending] = useActionState<
    ExpenseActionResult,
    FormData
  >(action, {});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!state.ok) return;
    if (isEditing) router.replace(onDoneHref);
    else setOpen(false);
  }, [state, isEditing, onDoneHref, router]);

  if (!isEditing && !open) {
    return (
      <button
        type="button"
        className="btn-secondary"
        onClick={() => setOpen(true)}
      >
        Agregar
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {isEditing && <input type="hidden" name="id" value={editing.id} />}
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
          {pending ? "…" : isEditing ? "Guardar" : "Agregar"}
        </button>
      </div>

      <div>
        <button
          type="button"
          onClick={() =>
            isEditing ? router.replace(onDoneHref) : setOpen(false)
          }
          style={{
            background: "transparent",
            border: "none",
            color: "var(--muted)",
            fontSize: "12px",
            cursor: "pointer",
            fontFamily: "DM Mono, monospace",
            padding: 0,
          }}
        >
          Cancelar
        </button>
      </div>

      {state.error && (
        <p style={{ color: "var(--danger)", fontSize: "12px" }}>{state.error}</p>
      )}
    </form>
  );
}
