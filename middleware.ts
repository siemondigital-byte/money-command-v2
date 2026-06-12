import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (asset prefetch)
     * - favicon.ico, manifest.json, manifest.webmanifest, sw.js, robots.txt
     * - public assets (svg, png, jpg, jpeg, gif, webp)
     *
     * El manifest de la PWA y el service worker deben ser PÚBLICOS (el navegador
     * los pide sin sesión); si no, la app no se puede instalar.
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|manifest.webmanifest|sw.js|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
