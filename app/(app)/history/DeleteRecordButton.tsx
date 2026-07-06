"use client";

import { useState } from "react";
import { useTranslations } from "@/lib/i18n/provider";
import { deleteMonthlyRecordAction } from "./actions";

/**
 * Borrar un mes del historial con confirmación inline (sin diálogo nativo).
 * Primer click muestra "¿Borrar [mes]? Sí / No"; el "Sí" envía la acción.
 */
export function DeleteRecordButton({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  const t = useTranslations().history;
  const [confirming, setConfirming] = useState(false);

  const linkStyle = {
    background: "transparent",
    border: "none",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "DM Mono, monospace",
    padding: 0,
  } as const;

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        style={{ ...linkStyle, color: "var(--danger)" }}
      >
        {t.delete}
      </button>
    );
  }

  return (
    <span style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
      <span style={{ fontSize: "11px", color: "var(--muted)" }}>
        {t.confirmDeletePre} {label}?
      </span>
      <form action={deleteMonthlyRecordAction} style={{ display: "inline" }}>
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          style={{ ...linkStyle, color: "var(--danger)" }}
        >
          {t.yes}
        </button>
      </form>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        style={{ ...linkStyle, color: "var(--muted)" }}
      >
        {t.no}
      </button>
    </span>
  );
}
