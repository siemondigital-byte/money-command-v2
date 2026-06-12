/*
 * Service worker MÍNIMO: habilita la instalabilidad de la PWA SIN cachear
 * respuestas de datos/API.
 *
 * La app lee datos en vivo del usuario desde Supabase, así que el SW NO debe
 * servir datos viejos cacheados. Por eso el handler de fetch NO llama a
 * respondWith(): cada request la resuelve el navegador contra la red, como
 * siempre. No se cachea nada. El único objetivo es cumplir el requisito de
 * "tener un service worker con fetch handler" para que la app sea instalable.
 */

self.addEventListener("install", () => {
  // Activa la nueva versión del SW sin esperar a que se cierren las pestañas.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Toma control de las páginas abiertas de inmediato.
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Sin respondWith → fetch normal a la red. Nada se cachea (no datos viejos).
});
