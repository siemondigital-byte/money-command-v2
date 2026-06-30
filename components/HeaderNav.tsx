"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/(auth)/actions";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/income", label: "Ingresos" },
  { href: "/expenses", label: "Egresos" },
  { href: "/investments", label: "Inversiones" },
  { href: "/debts", label: "Deudas" },
  { href: "/goals", label: "Metas" },
  { href: "/coach", label: "Coach" },
  { href: "/history", label: "Historial" },
  { href: "/settings", label: "Settings" },
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
            {item.label}
          </Link>
        );
      })}
      <form action={logoutAction}>
        <button type="submit" className="ah-logout">
          Salir
        </button>
      </form>
    </nav>
  );
}
