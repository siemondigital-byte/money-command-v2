import Link from "next/link";
import { LoginLogo } from "./_components/LoginLogo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-grid">
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
    </main>
  );
}
