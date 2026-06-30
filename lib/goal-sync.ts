/**
 * Orquestación del sync de metas + consolidación (rediseño Metas, Etapa 3b-ii).
 *
 * Único lugar que encadena el orden CANÓNICO: primero generar/actualizar los
 * gastos de las metas automáticas del período (syncAutomaticGoalExpenses, 3b-i),
 * y DESPUÉS consolidar el MonthlyRecord una sola vez. Nunca al revés, y la
 * consolidación NUNCA llama al sync (no hay loop posible).
 *
 * Estas funciones se usan SOLO desde Server Actions (período, acciones de meta,
 * sync-on-entry). No se importan en el render de Server Components.
 *
 * No modifica la lógica de lib/goal-expenses.ts (idempotente, forward-only) ni
 * la de lib/monthly.ts (consolidación): solo las encadena.
 */

import { prisma } from "./prisma";
import {
  activePeriod,
  consolidatePeriodFromLiveEntities,
  type Period,
} from "./monthly";
import { syncAutomaticGoalExpenses } from "./goal-expenses";

/** Período activo del usuario (selector global), o null si no hay perfil. */
async function resolveActivePeriod(userId: string): Promise<Period | null> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { activeYear: true, activeMonth: true },
  });
  if (!profile) return null;
  return activePeriod(profile);
}

/**
 * Orden lineal SIEMPRE: sync (genera/actualiza gastos de metas) → consolidar.
 * Falla silenciosa: si algo del sync/consolidación falla, se loggea pero no se
 * rompe la acción del usuario.
 */
export async function syncGoalsAndReconsolidate(
  userId: string,
  period: Period,
): Promise<void> {
  try {
    await syncAutomaticGoalExpenses(userId, period);
    await consolidatePeriodFromLiveEntities(userId, period);
  } catch (err) {
    console.error("[goal-sync] failed:", err);
  }
}

/** Igual que arriba, resolviendo el período activo del usuario. */
export async function syncGoalsAndReconsolidateActivePeriod(
  userId: string,
): Promise<void> {
  const period = await resolveActivePeriod(userId);
  if (!period) return;
  await syncGoalsAndReconsolidate(userId, period);
}
