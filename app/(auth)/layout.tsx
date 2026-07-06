import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { Footer } from "@/components/Footer";
import { LoginLogo } from "./_components/LoginLogo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Pre-login no hay perfil todavía: el footer usa el idioma por defecto (es).
  const footer = getDict("es").footer;
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
