"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SerializedExpense } from "@/lib/serialize";
import { BASKETS, EXPENSE_CATEGORIES } from "@/lib/expenses";
import { useTranslations } from "@/lib/i18n/provider";
import { isLeakCategory, isHormiga } from "./category-grouping";
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
  const t = useTranslations();
  const isEditing = editing != null;
  const action = isEditing ? updateExpenseAction : createExpenseAction;
  const [state, formAction, pending] = useActionState<
    ExpenseActionResult,
    FormData
  >(action, {});
  const [open, setOpen] = useState(false);

  // Categoría controlada + checkbox "Es gasto hormiga" (membresía efectiva).
  // El checkbox sigue el default por categoría hasta que la persona lo toca; a
  // partir de ahí manda su elección. El key del form (editing.id) reinicia esto.
  const initialCategory = editing?.category ?? "vivienda";
  const [category, setCategory] = useState(initialCategory);
  const [userToggledHormiga, setUserToggledHormiga] = useState(false);
  const [hormiga, setHormiga] = useState(() =>
    isHormiga(initialCategory, editing?.hormigaOverridden ?? false),
  );

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
        {t.expenses.form.add}
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {isEditing && <input type="hidden" name="id" value={editing.id} />}
      <input type="hidden" name="type" value={type} />

      <div className="form-grid">
        <label className="flex flex-col gap-1">
          <span className="label">{t.expenses.form.fieldName}</span>
          <input
            name="name"
            type="text"
            maxLength={80}
            required
            defaultValue={editing?.name ?? ""}
            placeholder={
              type === "fixed"
                ? t.expenses.form.placeholderNameFixed
                : t.expenses.form.placeholderNameVariable
            }
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">{t.expenses.form.fieldCategory}</span>
          <select
            name="category"
            value={category}
            onChange={(e) => {
              const v = e.target.value;
              setCategory(v);
              // Hasta que la persona toque el checkbox, seguir el default por
              // categoría (ej. elegir "suscripciones" lo marca como hormiga).
              if (!userToggledHormiga) setHormiga(isLeakCategory(v));
            }}
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t.labels.categories[c] ?? c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">{t.expenses.form.fieldBasket}</span>
          <select name="basket" defaultValue={editing?.basket ?? "essentials"}>
            {BASKETS.map((b) => (
              <option key={b} value={b}>
                {t.labels.baskets[b]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-grid">
        <label className="flex flex-col gap-1">
          <span className="label">{t.expenses.form.fieldBudget}</span>
          <input
            name="budget"
            type="number"
            step="0.01"
            min="0"
            defaultValue={editing ? editing.budget : ""}
            placeholder={t.expenses.form.placeholderAmount}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">{t.expenses.form.fieldRealPaid}</span>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={editing ? editing.amount : ""}
            placeholder={t.expenses.form.placeholderAmount}
          />
        </label>
        <button
          type="submit"
          className="btn-primary"
          disabled={pending}
          style={{ opacity: pending ? 0.6 : 1 }}
        >
          {pending
            ? "…"
            : isEditing
              ? t.expenses.form.save
              : t.expenses.form.add}
        </button>
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "12px",
          color: "var(--muted)",
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          name="isHormiga"
          checked={hormiga}
          onChange={(e) => {
            setHormiga(e.target.checked);
            setUserToggledHormiga(true);
          }}
        />
        {t.expenses.leaks.hormigaCheckbox}
      </label>

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
          {t.expenses.form.cancel}
        </button>
      </div>

      {state.error && (
        <p style={{ color: "var(--danger)", fontSize: "12px" }}>{state.error}</p>
      )}
    </form>
  );
}
