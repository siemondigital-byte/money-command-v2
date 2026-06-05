"use client";

import { useActionState } from "react";
import type { SerializedInvestment } from "@/lib/serialize";
import {
  createInvestmentAction,
  updateInvestmentAction,
  type InvestmentsActionResult,
} from "./actions";

type CategoryOption = { value: string; label: string; suggestedYield: number };

export function InvestmentForm({
  categories,
  editing,
}: {
  categories: CategoryOption[];
  editing: SerializedInvestment | null;
}) {
  const action = editing ? updateInvestmentAction : createInvestmentAction;
  const [state, formAction, pending] = useActionState<
    InvestmentsActionResult,
    FormData
  >(action, {});

  const defaultCategory = editing?.category ?? categories[0]!.value;
  const defaultYieldPct = editing ? Number(editing.passiveYield) * 100 : "";

  return (
    <section className="card flex flex-col gap-3" id="form">
      <div className="label">
        {editing ? "Editar posición" : "Agregar posición"}
      </div>

      {state.error && (
        <p style={{ color: "var(--danger)", fontSize: "12px" }}>{state.error}</p>
      )}
      {state.ok && !editing && (
        <p style={{ color: "var(--accent)", fontSize: "12px" }}>
          Posición agregada.
        </p>
      )}
      {state.ok && editing && (
        <p style={{ color: "var(--accent)", fontSize: "12px" }}>
          Cambios guardados.
        </p>
      )}

      <form action={formAction} className="flex flex-col gap-3">
        {editing && <input type="hidden" name="id" value={editing.id} />}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <label className="flex flex-col gap-1">
            <span className="label">Categoría</span>
            <select name="category" defaultValue={defaultCategory}>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="label">Etiqueta (opcional)</span>
            <input
              name="label"
              type="text"
              maxLength={80}
              defaultValue={editing?.label ?? ""}
              placeholder="ej. S&P 500 ETF"
            />
          </label>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <label className="flex flex-col gap-1">
            <span className="label">Capital actual</span>
            <input
              name="capital"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={editing ? Number(editing.capital) : ""}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="label">
              Yield pasivo anual (%)
            </span>
            <input
              name="passiveYieldPct"
              type="number"
              step="0.01"
              min="0"
              max="100"
              required
              defaultValue={defaultYieldPct}
              placeholder="ej. 4 para 4%"
            />
          </label>
        </div>

        <p
          style={{
            fontSize: "11px",
            color: "var(--hint)",
            lineHeight: 1.5,
          }}
        >
          El yield pasivo es el % anual que la posición entrega como flujo
          (dividendos, intereses, renta neta). NO es la apreciación del
          capital.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
            marginTop: "4px",
          }}
        >
          {editing && (
            <a href="/investments" className="btn-secondary" role="button">
              Cancelar
            </a>
          )}
          <button
            type="submit"
            className="btn-primary"
            disabled={pending}
            style={{ opacity: pending ? 0.6 : 1 }}
          >
            {pending
              ? "Guardando…"
              : editing
                ? "Guardar cambios"
                : "Agregar posición"}
          </button>
        </div>
      </form>
    </section>
  );
}
