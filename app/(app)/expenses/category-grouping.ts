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

/** Clave de agrupamiento normalizada (solo para agrupar/mostrar). */
export function normalizeCategoryKey(category: string): string {
  return category.trim().toLowerCase();
}

/**
 * Título prolijo del grupo: la etiqueta oficial (del locale activo) si la
 * categoría es una de las predefinidas; si no (categoría libre del escáner),
 * capitaliza la cruda. `categories` es el mapa del diccionario resuelto por
 * locale (dict.labels.categories), que el llamador provee.
 */
export function categoryLabel(
  key: string,
  raw: string | undefined,
  categories: Record<string, string>,
): string {
  const known = categories[key];
  if (known) return known;
  const base = (raw ?? key).trim();
  if (base.length === 0) return "Sin categoría";
  return base.charAt(0).toUpperCase() + base.slice(1);
}

/**
 * Categorías que, por defecto, cuentan como "gasto hormiga" (panel de fugas).
 * El default es POR CATEGORÍA; cada gasto puede overridear con su checkbox
 * (ver `hormigaOverridden` en el modelo).
 */
export const LEAK_CATEGORIES = new Set([
  "suscripciones",
  "entretenimiento",
  "delivery",
  "redes sociales",
  "otros",
  "mixtos",
  "mixto",
]);

/** ¿La categoría (normalizada) es de gasto hormiga por defecto? */
export function isLeakCategory(category: string): boolean {
  return LEAK_CATEGORIES.has(normalizeCategoryKey(category));
}

/**
 * Membresía EFECTIVA en el panel de fugas: por defecto sigue la categoría; el
 * override (`hormigaOverridden`) la invierte (permite incluir gastos de otras
 * categorías o excluir uno de categoría de fuga). Fuente única, usada por el
 * panel (server) y el form (client).
 */
export function isHormiga(category: string, hormigaOverridden: boolean): boolean {
  const byCategory = isLeakCategory(category);
  return hormigaOverridden ? !byCategory : byCategory;
}
