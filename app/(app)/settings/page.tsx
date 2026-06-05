import { requireUser } from "@/lib/auth";
import { serializeProfile } from "@/lib/serialize";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Settings · The Money Command" };

export default async function SettingsPage() {
  const { profile, email } = await requireUser();

  return (
    <div className="fade-up flex flex-col gap-6">
      <header>
        <div className="label mb-1">Settings</div>
        <h1>Tu configuración</h1>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "13px",
            marginTop: "8px",
          }}
        >
          Sesión: <span style={{ color: "var(--text)" }}>{email}</span>
        </p>
      </header>

      <SettingsForm profile={serializeProfile(profile)} />
    </div>
  );
}
