import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "./ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "The Money Command",
  description:
    "Construye libertad financiera con estructura, planeación y consecución de metas.",
  // OJO: NO declarar `manifest` aquí. Con la Metadata API de Next, el
  // <link rel="manifest"> termina renderizado en el <body>, y Chrome solo lee el
  // manifest desde el <head> — con eso la PWA deja de ser INSTALABLE. Lo
  // declaramos a mano dentro del <head> (ver abajo) para garantizar que quede ahí.
  applicationName: "The Money Command",
  // Favicon de pestaña e icono de iOS los maneja la convención de archivos de
  // Next: app/icon.png (pestaña) y app/apple-icon.png (iOS). No declaramos
  // `icons` acá para no pisar esa detección automática.
  appleWebApp: {
    capable: true,
    title: "The Money Command",
    // Barra de estado oscura, acorde al tema oscuro de la app.
    statusBarStyle: "black",
  },
};

export const viewport: Viewport = {
  themeColor: "#7fffb2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Anti-parpadeo de tema: corre ANTES de pintar y fija data-theme en
            <html>. Prioridad: eleccion guardada > tema del navegador
            (prefers-color-scheme) > oscuro. Asi el acceso sigue el tema del
            explorador. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('mc_theme');if(t!=='light'&&t!=='dark'){t=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches)?'light':'dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();",
          }}
        />
        {/* Manifest declarado a MANO dentro del <head>. Es lo que hace la PWA
            instalable: la Metadata API lo dejaba en el <body> y Chrome no lo veia.
            Debe quedar dentro del <head> si o si. */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
