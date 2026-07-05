"use client";

import { useActionState } from "react";
import type { SerializedProfile } from "@/lib/serialize";
import { useTranslations } from "@/lib/i18n/provider";
import {
  updateSettingsAction,
  type SettingsActionResult,
} from "./actions";

const METHODS = ["50/30/20", "50/25/25", "50/20/30", "40/20/40"];
const CURRENCIES = ["USD", "EUR", "ARS", "MXN", "COP", "CLP", "PEN", "BRL"];

function numToStr(v: number | null | undefined): string {
  return v === null || v === undefined ? "" : String(v);
}

export function SettingsForm({ profile }: { profile: SerializedProfile }) {
  const s = useTranslations().settings;
  const [state, formAction, pending] = useActionState<
    SettingsActionResult,
    FormData
  >(updateSettingsAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Section title={s.sectionProfile} anchor="profile">
        <Row>
          <Field label={s.name} name="name" defaultValue={profile.name ?? ""} />
          <Field
            label={s.country}
            name="country"
            defaultValue={profile.country ?? ""}
            maxLength={2}
          />
        </Row>
        <Row>
          <Field
            label={s.ageCurrent}
            name="ageCurrent"
            type="number"
            defaultValue={profile.ageCurrent?.toString() ?? ""}
          />
          <Field
            label={s.ageFreedomTarget}
            name="ageFreedomTarget"
            type="number"
            defaultValue={profile.ageFreedomTarget?.toString() ?? ""}
          />
        </Row>
      </Section>

      <Section title={s.sectionCompass} anchor="compass">
        <p className="compass-whisper" style={{ marginBottom: "8px" }}>
          {s.compassHint}
        </p>
        <Field
          label={s.compassWhat}
          name="compassWhat"
          defaultValue={profile.compassWhat ?? ""}
          maxLength={80}
        />
        <Row>
          <Field
            label={s.compassYear}
            name="compassYear"
            type="number"
            defaultValue={profile.compassYear?.toString() ?? ""}
          />
          <Field
            label={s.compassContribution}
            name="compassContribution"
            defaultValue={profile.compassContribution ?? ""}
            maxLength={80}
          />
        </Row>
      </Section>

      <Section title={s.sectionThermostat} anchor="thermostat">
        <Field
          label={s.thermostatTarget}
          name="thermostatTarget"
          type="number"
          step="0.01"
          defaultValue={numToStr(profile.thermostatTarget)}
        />
      </Section>

      <Section title={s.sectionAssumptions} anchor="assumptions">
        <Row>
          <Field
            label={s.inflationRate}
            name="inflationRate"
            type="number"
            step="0.01"
            defaultValue={numToStr(profile.inflationRate)}
          />
          <Field
            label={s.salaryGrowthRate}
            name="salaryGrowthRate"
            type="number"
            step="0.01"
            defaultValue={numToStr(profile.salaryGrowthRate)}
          />
        </Row>
        <Field
          label={s.freedomMonthlySpend}
          name="freedomMonthlySpend"
          type="number"
          step="0.01"
          defaultValue={numToStr(profile.freedomMonthlySpend)}
        />
      </Section>

      <Section title={s.sectionMethod} anchor="method">
        <Select
          label={s.preferredMethod}
          name="preferredMethod"
          options={METHODS}
          defaultValue={profile.preferredMethod}
        />
      </Section>

      <Section title={s.sectionLocale} anchor="locale">
        <Row>
          <Select
            label={s.currency}
            name="currency"
            options={CURRENCIES}
            defaultValue={profile.currency}
          />
          <Select
            label={s.language}
            name="locale"
            options={["es", "en"]}
            defaultValue={profile.locale}
          />
        </Row>
        <p style={{ fontSize: "11px", color: "var(--hint)", marginTop: "8px" }}>
          {s.localeHelp}
        </p>
      </Section>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          paddingTop: "8px",
        }}
      >
        <div>
          {state.error && (
            <span style={{ color: "var(--danger)", fontSize: "12px" }}>
              {state.error}
            </span>
          )}
          {state.ok && (
            <span style={{ color: "var(--accent)", fontSize: "12px" }}>
              {s.saved}
            </span>
          )}
        </div>
        <button
          type="submit"
          className="btn-primary"
          disabled={pending}
          style={{ opacity: pending ? 0.6 : 1 }}
        >
          {pending ? s.saving : s.save}
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  anchor,
  children,
}: {
  title: string;
  anchor: string;
  children: React.ReactNode;
}) {
  return (
    <section id={anchor} className="card flex flex-col gap-3">
      <div className="label">{title}</div>
      {children}
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gap: "12px",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      }}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  step,
  maxLength,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  step?: string;
  maxLength?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="label">{label}</span>
      <input
        name={name}
        type={type}
        step={step}
        maxLength={maxLength}
        defaultValue={defaultValue}
      />
    </label>
  );
}

function Select({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: string[];
  defaultValue: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="label">{label}</span>
      <select name={name} defaultValue={defaultValue}>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
