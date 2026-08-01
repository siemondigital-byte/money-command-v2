"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/(auth)/actions";
import { useTranslations } from "@/lib/i18n/provider";
import type { Dict } from "@/lib/i18n";
import { ThemeToggle } from "./ThemeToggle";

// href + clave en dict.nav. La etiqueta se resuelve por locale en el render.
const NAV_ITEMS: { href: string; key: keyof Dict["nav"] }[] = [
  { href: "/dashboard", key: "dashboard" },
  { href: "/income", key: "income" },
  { href: "/expenses", key: "expenses" },
  { href: "/investments", key: "investments" },
  { href: "/debts", key: "debts" },
  { href: "/goals", key: "goals" },
  { href: "/coach", key: "coach" },
  { href: "/history", key: "history" },
  { href: "/settings", key: "settings" },
];

/**
 * Navegación del header.
 *
 * Desktop (>= md): fila horizontal de enlaces de texto (sin cambios).
 * Móvil (< md): la misma nav se muestra como una fila de PÍLDORAS deslizables
 * horizontalmente, sin barra de scroll visible (ver globals.css). La píldora de
 * la sección actual se marca con `.active` usando el pathname.
 */
export function HeaderNav() {
  const pathname = usePathname() ?? "";
  const t = useTranslations();

  return (
    <nav className="ah-nav">
      {NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? "active" : undefined}
          >
            {t.nav[item.key]}
          </Link>
        );
      })}
      <form action={logoutAction}>
        <button type="submit" className="ah-logout">
          {t.nav.logout}
        </button>
      </form>
      <ThemeToggle />
    </nav>
  );
}
