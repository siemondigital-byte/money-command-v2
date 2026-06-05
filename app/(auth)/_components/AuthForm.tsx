"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/app/(auth)/actions";

type Action = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

export function AuthForm({
  action,
  submitLabel,
  children,
  successMessage,
}: {
  action: Action;
  submitLabel: string;
  children: React.ReactNode;
  successMessage?: string;
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {children}

      {state.error && (
        <p
          style={{
            color: "var(--danger)",
            fontSize: "12px",
            lineHeight: 1.5,
          }}
        >
          {state.error}
        </p>
      )}

      {state.ok && successMessage && (
        <p
          style={{
            color: "var(--accent)",
            fontSize: "12px",
            lineHeight: 1.5,
          }}
        >
          {successMessage}
        </p>
      )}

      <button
        type="submit"
        className="btn-primary mt-1"
        disabled={pending}
        style={{ opacity: pending ? 0.6 : 1 }}
      >
        {pending ? "Procesando…" : submitLabel}
      </button>
    </form>
  );
}

export function Field({
  label,
  name,
  type = "text",
  autoComplete,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="label">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        defaultValue={defaultValue}
      />
    </label>
  );
}
