import Link from "next/link";
import { logoutAction } from "@/app/(auth)/actions";
import type { SerializedProfile } from "@/lib/serialize";
import { PeriodSelector } from "./PeriodSelector";
import { activePeriod } from "@/lib/monthly";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/income", label: "Ingresos" },
  { href: "/investments", label: "Inversiones" },
  { href: "/history", label: "Historial" },
  { href: "/settings", label: "Settings" },
];

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
        className="mx-auto"
        style={{
          maxWidth: "1100px",
          padding: "14px 20px",
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          columnGap: "24px",
          rowGap: "10px",
          alignItems: "center",
        }}
      >
        {/* Logo: ocupa las dos filas a la izquierda */}
        <Link
          href="/dashboard"
          className="logo-wordmark"
          style={{ gridRow: "1 / span 2", alignSelf: "center" }}
        >
          <span className="logo-line">The Money</span>
          <span className="logo-line-accent">
            Command
            <span className="terminal-cursor" aria-hidden="true" />
          </span>
        </Link>

        {/* Fila 1 derecha — Período */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <PeriodSelector
            activeYear={period.year}
            activeMonth={period.month}
          />
        </div>

        {/* Fila 2 derecha — Nav + Salir */}
        <nav
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
            justifyContent: "flex-end",
            fontSize: "12px",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            flexWrap: "wrap",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{ color: "var(--muted)" }}
            >
              {item.label}
            </Link>
          ))}
          <form action={logoutAction}>
            <button
              type="submit"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--muted)",
                fontSize: "12px",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "DM Mono, monospace",
                padding: 0,
              }}
            >
              Salir
            </button>
          </form>
        </nav>

        {/* Brújula debajo de todo, full-width */}
        <div style={{ gridColumn: "1 / -1" }}>
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
