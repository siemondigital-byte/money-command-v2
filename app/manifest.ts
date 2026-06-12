import type { MetadataRoute } from "next";

/**
 * Web App Manifest (Next 15 metadata convention → se sirve en
 * /manifest.webmanifest). Hace la app instalable en móvil y desktop.
 *
 * Los iconos ya existen en /public (NO se regeneran). El start_url es /dashboard;
 * si no hay sesión, el flujo de auth existente redirige al login.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Money Command",
    short_name: "Money Command",
    description: "App de finanzas personales y libertad financiera.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#7fffb2",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
