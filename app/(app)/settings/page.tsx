import { requireUser } from "@/lib/auth";
import { serializeProfile } from "@/lib/serialize";
import { getDict } from "@/lib/i18n";
import { getServerDict } from "@/lib/i18n/server";
import { SettingsForm } from "./SettingsForm";

export async function generateMetadata() {
  return { title: (await getServerDict()).metadata.settings };
}

export default async function SettingsPage() {
  const { profile, email } = await requireUser();
  const s = getDict(profile.locale).settings;

  return (
    <div className="fade-up flex flex-col gap-6">
      <header>
        <div className="label mb-1">{s.pageLabel}</div>
        <h1>{s.pageTitle}</h1>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "13px",
            marginTop: "8px",
          }}
        >
          {s.session}: <span style={{ color: "var(--text)" }}>{email}</span>
        </p>
      </header>

      <SettingsForm profile={serializeProfile(profile)} />
    </div>
  );
}
