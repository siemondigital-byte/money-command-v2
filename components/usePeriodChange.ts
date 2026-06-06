"use client";

import { useTransition } from "react";
import { setActivePeriodAction } from "@/app/(app)/_actions/period";

/**
 * Helper ÚNICO para cambiar el período activo desde el cliente.
 *
 * Tanto el selector del header como el botón "Ir al mes" de History pasan
 * por acá, para que no dupliquen lógica y no se vuelvan a desincronizar: hay
 * un solo camino de mutación → `setActivePeriodAction` → `Profile.activeYear/
 * activeMonth` (fuente única de verdad, ARQUITECTURA §2/§4) → revalida toda
 * la app.
 *
 * @param next ruta opcional a la que redirigir tras cambiar el período
 *             (ej. History → "/income"). Si se omite, solo revalida en sitio.
 */
export function usePeriodChange() {
  const [pending, startTransition] = useTransition();

  function changePeriod(year: number, month: number, next?: string) {
    const fd = new FormData();
    fd.set("year", String(year));
    fd.set("month", String(month));
    if (next) fd.set("next", next);
    startTransition(() => {
      setActivePeriodAction(fd);
    });
  }

  return { changePeriod, pending };
}
