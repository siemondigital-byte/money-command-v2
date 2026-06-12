"use client";

import { useEffect } from "react";

/**
 * Registra el service worker mínimo (/sw.js) para habilitar la instalabilidad
 * de la PWA. Si el registro falla, la app sigue funcionando igual (solo no se
 * ofrece instalar). No cachea datos.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* no-op: la app funciona sin SW, solo no es instalable */
      });
    }
  }, []);
  return null;
}
