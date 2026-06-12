import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "./ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "The Money Command",
  description:
    "Construye libertad financiera con estructura, planeación y consecución de metas.",
  manifest: "/manifest.webmanifest",
  applicationName: "The Money Command",
  // Favicon de pestaña (icono redondo de la app) + icono de iOS. Usa los PNG que
  // ya existen en /public; no se regeneran.
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
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
    <html lang="es">
      <head>
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
