"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SerializedInvestment } from "@/lib/serialize";
import {
  createInvestmentAction,
  updateInvestmentAction,
  type InvestmentsActionResult,
} from "./actions";

type CategoryOption = { value: string; label: string; suggestedYield: number };

/**
 * Form de posición de inversión.
 *
 * - Agregar: arranca colapsado en un botón "Agregar posición"; al tocarlo
 *   despliega los campos. Al guardar con éxito se vuelve a colapsar (la
 *   posición aparece en la lista por la revalidación del server action).
 * - Editar: se abre vía ?edit=ID; al guardar con éxito vuelve a la lista
 *   (limpia el ?edit=), cerrándose solo. Mismo patrón que Income y Expenses.
 */
export function InvestmentForm({
  categories,
  editing,
}: {
  categories: CategoryOption[];
  editing: SerializedInvestment | null;
}) {
  const router = useRouter();
  const isEditing = editing != null;
  const action = isEditing ? updateInvestmentAction : createInvestmentAction;
  const [state, formAction, pending] = useActionState<
    InvestmentsActionResult,
    FormData
  >(action, {});
  const [open, setOpen] = useState(false);

  // Al guardar con éxito: editar → vuelve a la lista; agregar → colapsa.
  useEffect(() => {
    if (!state.ok) return;
    if (isEditing) router.replace("/investments");
    else setOpen(false);
  }, [state, isEditing, router]);

  // Agregar, colapsado: solo el botón.
  if (!isEditing && !open) {
    return (
      <button
        type="button"
        className="btn-secondary"
        onClick={() => setOpen(true)}
      >
        Agregar posición
      </button>
    );
  }

  const defaultCategory = editing?.category ?? categories[0]!.value;
  const defaultYieldPct = editing ? Number(editing.passiveYield) * 100 : "";

  return (
    <section className="card flex flex-col gap-3" id="form">
      {isEditing && <div className="label">Editar posición</div>}

      {state.error && (
        <p style={{ color: "var(--danger)", fontSize: "12px" }}>{state.error}</p>
      )}

      <form action={formAction} className="flex flex-col gap-3">
        {isEditing && <input type="hidden" name="id" value={editing.id} />}

        <div className="form-grid">
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

        <div className="form-grid">
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
              Yield / Rendimiento anual (%)
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

        <label className="flex flex-col gap-1" style={{ maxWidth: "260px" }}>
          <span className="label">Aporte mensual</span>
          <input
            name="monthlyContribution"
            type="number"
            step="0.01"
            min="0"
            defaultValue={editing ? Number(editing.monthlyContribution) : ""}
            placeholder="0.00"
          />
        </label>

        <p
          style={{
            fontSize: "11px",
            color: "var(--hint)",
            lineHeight: 1.5,
          }}
        >
          La tasa anual de la posición. Se usa para tu renta pasiva y para
          proyectar su crecimiento.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
            marginTop: "4px",
          }}
        >
          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              isEditing ? router.replace("/investments") : setOpen(false)
            }
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={pending}
            style={{ opacity: pending ? 0.6 : 1 }}
          >
            {pending
              ? "Guardando…"
              : isEditing
                ? "Guardar cambios"
                : "Agregar posición"}
          </button>
        </div>
      </form>
    </section>
  );
}
