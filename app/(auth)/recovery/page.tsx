import Link from "next/link";
import { recoveryAction } from "@/app/(auth)/actions";
import { AuthForm, Field } from "@/app/(auth)/_components/AuthForm";

export const metadata = { title: "Recuperar contraseña · The Money Command" };

export default function RecoveryPage() {
  return (
    <div>
      <div className="label mb-1">Recuperación</div>
      <h2 className="mb-4">Restablecer contraseña</h2>

      <AuthForm
        action={recoveryAction}
        submitLabel="Enviar link"
        successMessage="Si el email existe, te enviamos un link para restablecer la contraseña."
      >
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </AuthForm>

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
