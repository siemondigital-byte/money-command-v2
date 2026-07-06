"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SerializedDebt } from "@/lib/serialize";
import {
  DEBT_TYPES,
  DEBT_PURPOSES,
  type DebtType,
  type DebtPurpose,
} from "@/lib/debts";
import { useTranslations } from "@/lib/i18n/provider";
import {
  createDebtAction,
  updateDebtAction,
  type DebtActionResult,
} from "./actions";

/**
 * Form de deuda o crédito.
 *
 * - Agregar: arranca colapsado en un botón "Agregar deuda o crédito"; al
 *   tocarlo despliega los campos. Al guardar con éxito se vuelve a colapsar.
 * - Editar: se abre vía ?edit=ID; al guardar vuelve a la lista (limpia el
 *   ?edit=), cerrándose solo. Mismo patrón que Income/Expenses/Investments.
 */
export function DebtForm({
  editing,
}: {
  editing: SerializedDebt | null;
}) {
  const router = useRouter();
  const t = useTranslations();
  const isEditing = editing != null;
  const action = isEditing ? updateDebtAction : createDebtAction;
  const [state, formAction, pending] = useActionState<
    DebtActionResult,
    FormData
  >(action, {});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!state.ok) return;
    if (isEditing) router.replace("/debts");
    else setOpen(false);
  }, [state, isEditing, router]);

  if (!isEditing && !open) {
    return (
      <button
        type="button"
        className="btn-secondary"
        onClick={() => setOpen(true)}
      >
        {t.debts.addDebt}
      </button>
    );
  }

  return (
    <section className="card flex flex-col gap-3" id="form">
      {isEditing && <div className="label">{t.debts.editDebt}</div>}

      {state.error && (
        <p style={{ color: "var(--danger)", fontSize: "12px" }}>{state.error}</p>
      )}

      <form action={formAction} className="flex flex-col gap-3">
        {isEditing && <input type="hidden" name="id" value={editing.id} />}

        <div className="form-grid">
          <label className="flex flex-col gap-1">
            <span className="label">{t.debts.fieldName}</span>
            <input
              name="name"
              type="text"
              maxLength={80}
              required
              defaultValue={editing?.name ?? ""}
              placeholder={t.debts.placeholderName}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="label">{t.debts.fieldType}</span>
            <select
              name="type"
              defaultValue={(editing?.type as DebtType) ?? "card"}
            >
              {DEBT_TYPES.map((dt) => (
                <option key={dt} value={dt}>
                  {t.labels.debtTypes[dt]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="label">{t.debts.fieldPurpose}</span>
            <select
              name="purpose"
              defaultValue={(editing?.purpose as DebtPurpose) ?? "consumption"}
            >
              {DEBT_PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {t.labels.debtPurposes[p]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-grid">
          <label className="flex flex-col gap-1">
            <span className="label">{t.debts.fieldBalance}</span>
            <input
              name="balance"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={editing ? editing.balance : ""}
              placeholder={t.debts.placeholderAmount}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="label">{t.debts.fieldApr}</span>
            <input
              name="apr"
              type="number"
              step="0.01"
              min="0"
              max="200"
              required
              defaultValue={editing ? editing.apr : ""}
              placeholder={t.debts.placeholderAmount}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="label">{t.debts.fieldMinPayment}</span>
            <input
              name="minPayment"
              type="number"
              step="0.01"
              min="0"
              defaultValue={editing ? editing.minPayment : ""}
              placeholder={t.debts.placeholderAmount}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="label">{t.debts.fieldCurrentPayment}</span>
            <input
              name="currentPayment"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={editing ? editing.currentPayment : ""}
              placeholder={t.debts.placeholderAmount}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1" style={{ maxWidth: "260px" }}>
          <span className="label">{t.debts.fieldTermMonths}</span>
          <input
            name="termMonths"
            type="number"
            step="1"
            min="1"
            defaultValue={editing?.termMonths ?? ""}
            placeholder={t.debts.placeholderMonths}
          />
          <span style={{ fontSize: "11px", color: "var(--hint)", marginTop: 2 }}>
            {t.debts.termMonthsHelp}
          </span>
        </label>

        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={pending}
            style={{ opacity: pending ? 0.6 : 1 }}
          >
            {pending ? t.debts.saving : isEditing ? t.debts.saveChanges : t.debts.add}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              isEditing ? router.replace("/debts") : setOpen(false)
            }
          >
            {t.debts.cancel}
          </button>
        </div>
      </form>
    </section>
  );
}
