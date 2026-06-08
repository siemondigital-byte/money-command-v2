import Link from "next/link";
import type { SerializedProfile } from "@/lib/serialize";
import { PeriodSelector } from "./PeriodSelector";
import { HeaderNav } from "./HeaderNav";
import { activePeriod } from "@/lib/monthly";

export function Header({ profile }: { profile: SerializedProfile }) {
  const period = activePeriod({
    activeYear: profile.activeYear,
    activeMonth: profile.activeMonth,
  });

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div
        className="app-header-inner mx-auto"
        style={{ maxWidth: "1100px", padding: "14px 20px" }}
      >
        {/* Logo */}
        <Link href="/dashboard" className="ah-logo logo-wordmark">
          <span className="logo-line">The Money</span>
          <span className="logo-line-accent">
            Command
            <span className="terminal-cursor" aria-hidden="true" />
          </span>
        </Link>

        {/* Período */}
        <div className="ah-period">
          <PeriodSelector activeYear={period.year} activeMonth={period.month} />
        </div>

        {/* Hamburguesa + navegación (cliente: maneja el toggle en móvil) */}
        <HeaderNav />

        {/* Brújula */}
        <div className="ah-compass">
          <CompassWhisper profile={profile} />
        </div>
      </div>
    </header>
  );
}

function CompassWhisper({ profile }: { profile: SerializedProfile }) {
  const what = profile.compassWhat?.trim();
  const year = profile.compassYear;
  const contribution = profile.compassContribution?.trim();

  if (!what && !year && !contribution) {
    return (
      <Link
        href="/settings#compass"
        className="compass-whisper"
        style={{ textDecoration: "none" }}
      >
        Definí tu brújula
      </Link>
    );
  }

  const parts: string[] = [];
  if (what) parts.push(`Estoy construyendo este patrimonio para poder ${what}`);
  if (year) parts.push(`para el año ${year}`);
  if (contribution) parts.push(`porque quiero contribuir ${contribution}`);

  return <p className="compass-whisper">{parts.join(" · ")}</p>;
}
