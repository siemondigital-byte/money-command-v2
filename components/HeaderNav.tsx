"use client";

import { useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/app/(auth)/actions";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/income", label: "Ingresos" },
  { href: "/expenses", label: "Gastos" },
  { href: "/investments", label: "Inversiones" },
  { href: "/debts", label: "Deudas" },
  { href: "/goals", label: "Metas" },
  { href: "/history", label: "Historial" },
  { href: "/settings", label: "Settings" },
];

/**
 * Hamburguesa + navegación del header.
 *
 * Renderiza un fragmento con DOS elementos (el botón y el <nav>), que el Header
 * coloca como hijos directos del grid `.app-header-inner` mediante sus áreas
 * (`burger` y `nav`). En desktop el botón está oculto y la nav es una fila; en
 * móvil el botón despliega la nav como panel vertical (ver globals.css).
 */
export function HeaderNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <button
        type="button"
        className="ah-burger"
        aria-label="Abrir menú de navegación"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
      >
        {menuOpen ? (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="6" y1="18" x2="18" y2="6" />
          </svg>
        ) : (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        )}
      </button>

      <nav className={`ah-nav ${menuOpen ? "open" : ""}`}>
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} onClick={closeMenu}>
            {item.label}
          </Link>
        ))}
        <form action={logoutAction} onSubmit={closeMenu}>
          <button type="submit" className="ah-logout">
            Salir
          </button>
        </form>
      </nav>
    </>
  );
}
