"use client";

import { useActionState, useState } from "react";
import type { SerializedMonthlyRecord } from "@/lib/serialize";
import { saveMonthlyAction, type MonthlyActionResult } from "./actions";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function numToStr(v: number | null | undefined): string {
  return v === null || v === undefined ? "" : String(v);
}

export function MonthlyForm({
  initialYear,
  initialMonth,
  existing,
}: {
  initialYear: number;
  initialMonth: number;
  existing: SerializedMonthlyRecord | null;
}) {
  const [state, formAction, pending] = useActionState<
    MonthlyActionResult,
    FormData
  >(saveMonthlyAction, {});
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);

  const showConfirm = state.exists && !confirmOverwrite;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error && (
        <div
          className="card"
          style={{
            borderColor: "var(--danger)",
            background: "rgba(255, 107, 107, 0.06)",
          }}
        >
          <div className="label" style={{ color: "var(--danger)" }}>
            Error al guardar
          </div>
          <p
            style={{
              color: "var(--danger)",
              fontSize: "13px",
              marginTop: "6px",
              wordBreak: "break-word",
            }}
          >
            {state.error}
          </p>
        </div>
      )}

      {state.ok && (
        <div
          className="card"
          style={{
            borderColor: "var(--accent)",
            background: "rgba(127, 255, 178, 0.06)",
          }}
        >
          <p style={{ color: "var(--accent)", fontSize: "13px" }}>
            Mes registrado correctamente.
          </p>
        </div>
      )}

      <section className="card flex flex-col gap-3">
        <div className="label">Período</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <label className="flex flex-col gap-1">
            <span className="label">Año</span>
            <input
              name="year"
              type="number"
              defaultValue={initialYear}
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="label">Mes</span>
            <select name="month" defaultValue={initialMonth}>
              {MONTHS.map((label, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <SectionGroup
        title="Ingresos"
        fields={[
          ["incomeActive", "Plan A · Activo", existing?.incomeActive],
          ["incomePassive", "Plan B · Pasivo (auto)", existing?.incomePassive],
          ["incomeSecondary", "Plan C · Secundario", existing?.incomeSecondary],
        ]}
      />

      <SectionGroup
        title="Gastos"
        fields={[
          ["expenseNeeds", "Necesidades", existing?.expenseNeeds],
          ["expenseWants", "Deseos", existing?.expenseWants],
          ["expenseInvestments", "Inversiones / Ahorro", existing?.expenseInvestments],
        ]}
      />

      <SectionGroup
        title="Pasivos (deuda)"
        fields={[
          ["liabilityCard", "Tarjetas de crédito", existing?.liabilityCard],
          ["liabilityPersonal", "Préstamos personales", existing?.liabilityPersonal],
          ["liabilityMortgage", "Hipoteca", existing?.liabilityMortgage],
          ["liabilityOther", "Otros", existing?.liabilityOther],
        ]}
      />

      <SectionGroup
        title="Activos"
        fields={[
          ["assetCash", "Efectivo / liquidez", existing?.assetCash],
          ["assetInvestments", "Inversiones", existing?.assetInvestments],
          ["assetRealEstate", "Bienes raíces", existing?.assetRealEstate],
          ["assetOther", "Otros", existing?.assetOther],
        ]}
      />

      <section className="card flex flex-col gap-3">
        <div className="label">Retorno ponderado del portafolio (%)</div>
        <input
          name="weightedReturn"
          type="number"
          step="0.01"
          defaultValue={numToStr(existing?.weightedReturn ?? 8)}
        />
        <p style={{ fontSize: "11px", color: "var(--hint)" }}>
          Default 8% si no hay portafolio. Editable.
        </p>
      </section>

      {showConfirm && (
        <div
          className="card"
          style={{
            borderColor: "var(--warning)",
            background: "rgba(255, 209, 102, 0.05)",
          }}
        >
          <p style={{ color: "var(--warning)", fontSize: "13px" }}>
            Ya existe un registro para este mes. ¿Sobrescribirlo?
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              name="overwrite"
              value="true"
              className="btn-primary"
            >
              Sí, sobrescribir
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setConfirmOverwrite(true)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {!showConfirm && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={pending}
            style={{ opacity: pending ? 0.6 : 1 }}
          >
            {pending ? "Guardando…" : existing ? "Actualizar mes" : "Registrar mes"}
          </button>
        </div>
      )}
    </form>
  );
}

function SectionGroup({
  title,
  fields,
}: {
  title: string;
  fields: [string, string, number | null | undefined][];
}) {
  return (
    <section className="card flex flex-col gap-3">
      <div className="label">{title}</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        {fields.map(([name, label, defaultValue]) => (
          <label key={name} className="flex flex-col gap-1">
            <span className="label">{label}</span>
            <input
              name={name}
              type="number"
              step="0.01"
              defaultValue={numToStr(defaultValue)}
            />
          </label>
        ))}
      </div>
    </section>
  );
}
