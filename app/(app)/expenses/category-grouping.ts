/**
 * Helpers PUROS de agrupamiento por categoría — SOLO presentación.
 *
 * Reorganizan cómo se listan los gastos (agrupar/mostrar), NUNCA cambian
 * cálculos ni tocan la DB. Los totales/subtotales siguen saliendo de los
 * helpers de lib/expenses.ts (totalsByType, sumRealByBasket, …).
 *
 * La categoría en la DB es un string libre (el escáner puede sugerir etiquetas
 * propias y el case puede variar). Para agrupar sin fragmentar ("Transporte" vs
 * "transporte"), normalizamos una CLAVE de display; el valor guardado no cambia.
 */

import { CATEGORY_LABELS_ES } from "@/lib/expenses";

/** Clave de agrupamiento normalizada (solo para agrupar/mostrar). */
export function normalizeCategoryKey(category: string): string {
  return category.trim().toLowerCase();
}

/**
 * Título prolijo del grupo: la etiqueta oficial si la categoría es una de las
 * predefinidas; si no (categoría libre del escáner), capitaliza la cruda.
 */
export function categoryLabel(key: string, raw?: string): string {
  const known = CATEGORY_LABELS_ES[key];
  if (known) return known;
  const base = (raw ?? key).trim();
  if (base.length === 0) return "Sin categoría";
  return base.charAt(0).toUpperCase() + base.slice(1);
}
