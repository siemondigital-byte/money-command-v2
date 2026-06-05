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
          padding: "12px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <Link
            href="/dashboard"
            className="font-display"
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            The Money <span style={{ color: "var(--accent)" }}>Command</span>
          </Link>

          <nav
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "center",
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
            <PeriodSelector
              activeYear={period.year}
              activeMonth={period.month}
            />
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
        </div>

        <CompassWhisper profile={profile} />
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
