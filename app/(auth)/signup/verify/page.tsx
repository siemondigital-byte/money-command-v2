import Link from "next/link";

export const metadata = { title: "Verificá tu email · The Money Command" };

export default function VerifyPage() {
  return (
    <div>
      <div className="label mb-1">Verificación</div>
      <h2 className="mb-4">Revisá tu email</h2>
      <p style={{ color: "var(--muted)", fontSize: "13px", lineHeight: 1.6 }}>
        Te enviamos un link de confirmación. Hacé click ahí para activar la
        cuenta y volver a iniciar sesión.
      </p>
      <p
        className="mt-6"
        style={{ fontSize: "12px", color: "var(--muted)" }}
      >
        <Link href="/login" style={{ color: "var(--accent)" }}>
          Volver al login
        </Link>
      </p>
    </div>
  );
}
