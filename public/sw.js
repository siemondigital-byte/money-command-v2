/*
 * Service worker de The Money Command (finanzas).
 *
 * Da CAPACIDAD OFFLINE real (requisito de instalabilidad PWA de Chrome) SIN
 * cachear datos del usuario. Estrategia "red primero" para las navegaciones: si
 * hay red, se sirve la página real (siempre fresca); si no hay red, se responde
 * una página propia de "sin conexión". Los datos (Supabase/API) y el resto de
 * requests SIEMPRE van a la red y NUNCA se cachean, así nunca se muestran datos
 * viejos.
 *
 * Por qué así: Chrome endureció el criterio de instalación. Antes bastaba con
 * tener un service worker con un fetch handler (aunque no hiciera nada); ahora
 * exige que responda offline. Un handler no-op ya NO hace instalable la app.
 */

const OFFLINE_HTML = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sin conexión — The Money Command</title>
<style>
  :root { color-scheme: dark; }
  html, body { margin: 0; height: 100%; }
  body {
    background: #0a0a0f; color: #f0f0f8;
    font-family: 'DM Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh; padding: 24px; text-align: center;
  }
  .wrap { max-width: 340px; }
  .dot { width: 12px; height: 12px; border-radius: 50%; background: #7fffb2;
         box-shadow: 0 0 12px rgba(127,255,178,.55); display: inline-block; margin-bottom: 20px; }
  h1 { font-family: 'Syne', system-ui, sans-serif; font-weight: 800;
       font-size: 20px; letter-spacing: -.01em; margin: 0 0 10px; }
  h1 .ac { color: #7fffb2; }
  p { color: #8a8a9a; font-size: 13px; line-height: 1.6; margin: 0 0 22px; }
  button {
    appearance: none; border: 1px solid #7fffb2; background: transparent;
    color: #7fffb2; font-family: inherit; font-size: 13px; letter-spacing: .04em;
    padding: 10px 20px; border-radius: 100px; cursor: pointer;
  }
  button:hover { background: rgba(127,255,178,.08); }
</style>
</head>
<body>
  <div class="wrap">
    <span class="dot"></span>
    <h1>The Money <span class="ac">Command</span></h1>
    <p>Estás sin conexión. Revisa tu internet y vuelve a intentarlo.<br><br>You are offline. Check your connection and try again.</p>
    <button onclick="location.reload()">Reintentar / Retry</button>
  </div>
</body>
</html>`;

self.addEventListener("install", () => {
  // Activa la nueva versión de inmediato (reemplaza el SW no-op anterior).
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Toma control de las páginas abiertas de inmediato.
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Solo las NAVEGACIONES obtienen respaldo offline. Red primero (página real y
  // fresca); si la red falla, la página de "sin conexión". Esto le da a la app la
  // capacidad offline que Chrome exige para permitir instalarla.
  if (req.method === "GET" && req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(
        () =>
          new Response(OFFLINE_HTML, {
            status: 200,
            headers: { "Content-Type": "text/html; charset=utf-8" },
          }),
      ),
    );
    return;
  }
  // Todo lo demás (Supabase, API, assets, datos): sin respondWith → red normal,
  // nada se cachea (nunca datos viejos).
});
