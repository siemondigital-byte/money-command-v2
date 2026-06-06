"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SerializedIncome } from "@/lib/serialize";
import {
  createIncomeAction,
  updateIncomeAction,
  type IncomeActionResult,
} from "./actions";

/**
 * Form de fila Income (Plan A/C).
 *
 * - Agregar: arranca colapsado en un botón "Agregar"; al tocarlo despliega los
 *   campos. Al guardar con éxito se vuelve a colapsar (la fila nueva aparece en
 *   la lista por la revalidación del server action).
 * - Editar: se abre vía ?edit=ID. Al guardar con éxito navega de vuelta a la
 *   lista (limpia el ?edit=), cerrándose solo sin necesidad de "Volver".
 */
export function IncomeRowForm({
  plan,
  editing,
  onDoneHref,
}: {
  plan: "A" | "C";
  editing: SerializedIncome | null;
  onDoneHref: string;
}) {
  const router = useRouter();
  const isEditing = editing != null;
  const action = isEditing ? updateIncomeAction : createIncomeAction;
  const [state, formAction, pending] = useActionState<
    IncomeActionResult,
    FormData
  >(action, {});
  const [open, setOpen] = useState(false);

  // Al guardar con éxito: editar → vuelve a la lista; agregar → colapsa.
  useEffect(() => {
    if (!state.ok) return;
    if (isEditing) router.replace(onDoneHref);
    else setOpen(false);
  }, [state, isEditing, onDoneHref, router]);

  // Agregar, colapsado: solo el botón.
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
