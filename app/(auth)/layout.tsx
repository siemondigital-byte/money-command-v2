import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { getBrowserLocale } from "@/lib/i18n/server";
import { Footer } from "@/components/Footer";
import { LoginLogo } from "./_components/LoginLogo";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pre-login no hay perfil: resolvemos el idioma desde el navegador (Accept-Language).
  const footer = getDict(await getBrowserLocale()).footer;
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-grid">
      <div className="w-full max-w-sm fade-up">
        <Link
          href="/"
          className="flex justify-center mb-8"
          aria-label="The Money Command"
        >
          <LoginLogo />
        </Link>
        <div className="card">{children}</div>
      </div>
      <div className="w-full max-w-sm">
        <Footer footer={footer} />
      </div>
    </main>
  );
}
