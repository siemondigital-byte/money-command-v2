"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createSubscriptionAction,
  type ExpenseActionResult,
} from "./actions";

/**
 * Form para agregar una suscripción (se absorbe en Estilo con el flag dedicado
 * isSubscription). Arranca colapsado en un botón "Agregar"; al guardar con
 * éxito se vuelve a colapsar (la suscripción aparece en la lista por la
 * revalidación del server action).
 */
export function SubscriptionForm() {
  const [state, formAction, pending] = useActionState<
    ExpenseActionResult,
    FormData
  >(createSubscriptionAction, {});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state.ok) setOpen(false);
  }, [state]);

  if (!open) {
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
      <div className="form-grid">
        <label className="flex flex-col gap-1">
          <span className="label">Suscripción</span>
          <input
            name="name"
            type="text"
            maxLength={80}
            required
            placeholder="Netflix, Spotify, gym…"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">Costo / mes</span>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0.00"
          />
        </label>
        <button
          type="submit"
          className="btn-primary"
          disabled={pending}
          style={{ opacity: pending ? 0.6 : 1 }}
        >
          {pending ? "…" : "Agregar"}
        </button>
      </div>
      <input type="hidden" name="category" value="suscripciones" />

      <div>
        <button
          type="button"
          onClick={() => setOpen(false)}
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
