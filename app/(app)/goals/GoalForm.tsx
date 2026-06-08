"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SerializedGoal } from "@/lib/serialize";
import { BASKETS, BASKET_LABELS_ES } from "@/lib/expenses";
import { createGoalAction, updateGoalAction, type GoalActionResult } from "./actions";

/**
 * Form de meta.
 *
 * - Agregar: arranca colapsado en un botón "Agregar meta"; al tocarlo
 *   despliega los campos. Al guardar con éxito se vuelve a colapsar.
 * - Editar: se abre vía ?edit=ID; al guardar vuelve a la lista (limpia el
 *   ?edit=), cerrándose solo. Mismo patrón que los otros módulos.
 *
 * Canasta: desplegable de una sola opción (excluyente), sin recomendación
 * automática.
 */
export function GoalForm({ editing }: { editing: SerializedGoal | null }) {
  const router = useRouter();
  const isEditing = editing != null;
  const action = isEditing ? updateGoalAction : createGoalAction;
  const [state, formAction, pending] = useActionState<GoalActionResult, FormData>(
    action,
    {},
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!state.ok) return;
    if (isEditing) router.replace("/goals");
    else setOpen(false);
  }, [state, isEditing, router]);

  if (!isEditing && !open) {
    return (
      <button
        type="button"
        className="btn-secondary"
        onClick={() => setOpen(true)}
      >
        Agregar meta
      </button>
    );
  }

  // targetDate viene como ISO; el input date espera YYYY-MM-DD.
  const defaultDate = editing?.targetDate
    ? editing.targetDate.slice(0, 10)
    : "";

  return (
    <section className="card flex flex-col gap-3" id="form">
      {isEditing && <div className="label">Editar meta</div>}

      {state.error && (
        <p style={{ color: "var(--danger)", fontSize: "12px" }}>{state.error}</p>
      )}

      <form action={formAction} className="flex flex-col gap-3">
        {isEditing && <input type="hidden" name="id" value={editing.id} />}

        <div className="form-grid">
          <label className="flex flex-col gap-1">
            <span className="label">Nombre</span>
            <input
              name="name"
              type="text"
              maxLength={80}
              required
              defaultValue={editing?.name ?? ""}
              placeholder="ej. Fondo de emergencia"
            />
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

        <div className="form-grid">
          <label className="flex flex-col gap-1">
            <span className="label">Monto objetivo</span>
            <input
              name="targetAmount"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={editing ? editing.targetAmount : ""}
              placeholder="0.00"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="label">Ahorro actual</span>
            <input
              name="currentAmount"
              type="number"
              step="0.01"
              min="0"
              defaultValue={editing ? editing.currentAmount : ""}
              placeholder="0.00"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="label">Aporte mensual</span>
            <input
              name="monthlyContribution"
              type="number"
              step="0.01"
              min="0"
              defaultValue={editing ? editing.monthlyContribution : ""}
              placeholder="0.00"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1" style={{ maxWidth: "260px" }}>
          <span className="label">Fecha objetivo (opcional)</span>
          <input name="targetDate" type="date" defaultValue={defaultDate} />
          <span style={{ fontSize: "11px", color: "var(--hint)", marginTop: 2 }}>
            Pon una fecha para medir si vas atrasado o a tiempo.
          </span>
        </label>

        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={pending}
            style={{ opacity: pending ? 0.6 : 1 }}
          >
            {pending ? "Guardando…" : isEditing ? "Guardar cambios" : "Agregar"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => (isEditing ? router.replace("/goals") : setOpen(false))}
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
