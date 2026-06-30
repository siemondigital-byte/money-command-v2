"use client";

import { useEffect, useRef } from "react";
import { syncOnEntryAction } from "@/app/(app)/_actions/goals-sync";

/**
 * Dispara el sync de gastos de metas del período activo UNA vez al montar
 * (sync-on-entry, Etapa 3b-ii). Cubre el rolido de mes cuando la persona no
 * toca el selector de período.
 *
 * Fire-and-forget: no bloquea la carga, no renderiza nada. El ref evita
 * dispararlo más de una vez por montaje. El sync subyacente es idempotente y
 * forward-only, así que repetirlo no genera duplicados.
 */
export function GoalAutoSync() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    // Fire-and-forget; el helper ya falla en silencio, pero igual atrapamos el
    // rechazo del action (ej. red) para no dejar una promesa sin manejar.
    syncOnEntryAction().catch(() => {});
  }, []);

  return null;
}
