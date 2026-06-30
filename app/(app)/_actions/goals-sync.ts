"use server";

import { requireUser } from "@/lib/auth";
import { syncGoalsAndReconsolidateActivePeriod } from "@/lib/goal-sync";

/**
 * Sync-on-entry (rediseño Metas, Etapa 3b-ii).
 *
 * Server Action que dispara el sync de gastos de metas del período activo al
 * entrar a la app. La invoca un componente cliente mínimo (GoalAutoSync) una
 * vez al montar, para cubrir el rolido natural de mes: si pasa el mes sin que la
 * persona toque el selector, este sync genera el gasto del nuevo mes.
 *
 * Es idempotente y forward-only (lib/goal-expenses). NO revalida rutas a
 * propósito: corre en segundo plano sin bloquear ni re-renderizar la página que
 * la persona está viendo (evita cualquier riesgo de loop de revalidación). El
 * gasto recién generado se refleja en la próxima navegación o al cambiar de
 * período. Los disparadores explícitos (cambio de período, crear/editar meta)
 * sí revalidan, así que los casos comunes se ven al instante.
 */
export async function syncOnEntryAction(): Promise<void> {
  const { user } = await requireUser();
  await syncGoalsAndReconsolidateActivePeriod(user.id);
}
