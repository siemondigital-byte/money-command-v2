"use client";

import { useActionState } from "react";
import {
  createSubscriptionAction,
  type ExpenseActionResult,
} from "./actions";

/**
 * Form para agregar una suscripción. Se absorbe en la canasta Estilo con el
 * flag dedicado isSubscription, para alimentar el resumen mensual/anual y la
 * futura GASTOS_HORMIGA_MES del Coach.
 */
export function SubscriptionForm() {
  const [state, formAction, pending] = useActionState<
    ExpenseActionResult,
    FormData
  >(createSubscriptionAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr auto",
          gap: "8px",
          alignItems: "end",
        }}
      >
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

      {state.error && (
        <p style={{ color: "var(--danger)", fontSize: "12px" }}>{state.error}</p>
      )}
      {state.ok && (
        <p style={{ color: "var(--accent)", fontSize: "12px" }}>Agregada.</p>
      )}
    </form>
  );
}
