import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-grid">
      <div className="w-full max-w-sm fade-up">
        <Link href="/" className="block text-center mb-8">
          <div className="label mb-2">v2</div>
          <h1 className="font-display" style={{ fontSize: "1.5rem" }}>
            The Money <span style={{ color: "var(--accent)" }}>Command</span>
          </h1>
        </Link>
        <div className="card">{children}</div>
      </div>
    </main>
  );
}
