"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BASKETS,
  BASKET_COLORS,
  type Basket,
} from "@/lib/expenses";
import { normalizeCategoryKey, categoryLabel } from "./category-grouping";
import { splitMoney } from "@/lib/format";
import { useTranslations } from "@/lib/i18n/provider";
import { deleteExpenseAction } from "./actions";

/** Monto con el símbolo de moneda en chico (etiqueta), número a tamaño normal. */
function Money({
  value,
  locale,
  currency,
}: {
  value: number;
  locale: string;
  currency: string;
}) {
  const { symbol, number } = splitMoney(value, locale, currency);
  return (
    <>
      <span style={{ fontSize: "0.7em", opacity: 0.7, marginRight: "0.28em" }}>
        {symbol}
      </span>
      {number}
    </>
  );
}

/**
 * Vista de Egresos VARIABLES agrupada por categoría, con desplegables.
 *
 * SOLO presentación: reagrupa las MISMAS filas por categoría normalizada y
 * subtotaliza sumando `amount` de las filas activas. El subtotal general de la
 * pestaña lo sigue calculando el server (totalsByType); acá no se recalcula
 * nada que alimente KPIs. Editar/Eliminar operan por `id` (markup reubicado).
 */

/** Fila liviana y serializable (primitivos) que llega del Server Component. */
export interface CategoryExpenseRow {
  id: string;
  name: string;
  amount: number;
  category: string;
  basket: Basket;
  isActive: boolean;
  /** "fixed" | "variable": define a qué tab apunta el link de Editar. */
  type: string;
  /** Fecha real de compra "YYYY-MM-DD" (lector de extractos) o null. */
  purchaseDate: string | null;
}

interface Group {
  key: string;
  label: string;
  rows: CategoryExpenseRow[];
  subtotal: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Canasta a mostrar para la categoría: única, o predominante + "mixta". */
function groupBasket(rows: CategoryExpenseRow[]): {
  basket: Basket | null;
  mixed: boolean;
} {
  const sums: Record<Basket, number> = { essentials: 0, style: 0, freedom: 0 };
  for (const r of rows) if (r.isActive) sums[r.basket] += r.amount;
  const present = BASKETS.filter((b) => sums[b] > 0);
  if (present.length === 0) return { basket: null, mixed: false };
  if (present.length === 1) return { basket: present[0], mixed: false };
  const predominant = present.reduce((a, b) => (sums[b] > sums[a] ? b : a), present[0]);
  return { basket: predominant, mixed: true };
}

export function VariablesByCategory({
  rows,
  locale,
  currency,
}: {
  rows: CategoryExpenseRow[];
  locale: string;
  currency: string;
}) {
  const t = useTranslations();
  const categories = t.labels.categories;

  // Colapsadas por defecto: el estado vive en cliente (sin localStorage).
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (key: string) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, Group>();
    for (const r of rows) {
      const key = normalizeCategoryKey(r.category);
      let g = map.get(key);
      if (!g) {
        g = {
          key,
          label: categoryLabel(key, r.category, categories),
          rows: [],
          subtotal: 0,
        };
        map.set(key, g);
      }
      g.rows.push(r);
      if (r.isActive) g.subtotal += r.amount;
    }
    const arr = [...map.values()];
    for (const g of arr) g.subtotal = round2(g.subtotal);
    // La que más pesa, arriba.
    arr.sort((a, b) => b.subtotal - a.subtotal);
    return arr;
  }, [rows, categories]);

  if (groups.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        borderTop: "1px solid var(--border)",
        paddingTop: "12px",
      }}
    >
      {groups.map((g) => {
        const isOpen = open.has(g.key);
        const { basket, mixed } = groupBasket(g.rows);
        return (
          <div
            key={g.key}
            style={{
              border: "1px solid var(--border)",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            {/* Cabecera de la categoría (toggle) */}
            <button
              type="button"
              onClick={() => toggle(g.key)}
              aria-expanded={isOpen}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "12px 14px",
                background: isOpen ? "var(--surface-2)" : "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                color: "var(--text)",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  minWidth: 0,
                }}
              >
                <Caret open={isOpen} />
                <span
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    overflowWrap: "anywhere",
                  }}
                >
                  {g.label}
                </span>
                {basket && <BasketTag basket={basket} mixed={mixed} />}
                <span style={{ fontSize: "11px", color: "var(--hint)" }}>
                  {g.rows.length}
                </span>
              </span>
              <span
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "var(--accent)",
                  whiteSpace: "nowrap",
                }}
              >
                <Money value={g.subtotal} locale={locale} currency={currency} />
              </span>
            </button>

            {/* Detalle: compras individuales (comercio, monto, fecha, acciones) */}
            {isOpen && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderTop: "1px solid var(--border)",
                }}
              >
                {g.rows.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      padding: "10px 14px",
                      borderTop: "1px solid var(--border)",
                      opacity: r.isActive ? 1 : 0.55,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "13px", overflowWrap: "anywhere" }}>
                        {r.name}
                      </span>
                      {r.purchaseDate && (
                        <span style={{ fontSize: "11px", color: "var(--hint)" }}>
                          {r.purchaseDate}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <span style={{ fontSize: "13px", color: "var(--accent)", whiteSpace: "nowrap" }}>
                        <Money value={r.amount} locale={locale} currency={currency} />
                      </span>
                      <Link
                        href={`/expenses?tab=${r.type === "fixed" ? "fixed" : "variable"}&edit=${r.id}#form`}
                        style={{ color: "var(--accent-2)", fontSize: "12px" }}
                      >
                        Editar
                      </Link>
                      <DeleteButton id={r.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Caret({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        transition: "transform 120ms",
        transform: open ? "rotate(90deg)" : "rotate(0deg)",
        color: "var(--muted)",
        fontSize: "12px",
        lineHeight: 1,
      }}
    >
      ▶
    </span>
  );
}

function BasketTag({ basket, mixed }: { basket: Basket; mixed: boolean }) {
  const t = useTranslations();
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
      <span
        style={{
          display: "inline-block",
          width: 8,
          height: 8,
          borderRadius: 2,
          background: BASKET_COLORS[basket],
        }}
      />
      <span style={{ fontSize: "11px", color: "var(--muted)" }}>
        {mixed ? t.labels.mixed : t.labels.baskets[basket]}
      </span>
    </span>
  );
}

function DeleteButton({ id }: { id: string }) {
  return (
    <form action={deleteExpenseAction} style={{ display: "inline" }}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        style={{
          background: "transparent",
          border: "none",
          color: "var(--danger)",
          fontSize: "12px",
          cursor: "pointer",
          fontFamily: "DM Mono, monospace",
          padding: 0,
        }}
      >
        Eliminar
      </button>
    </form>
  );
}
