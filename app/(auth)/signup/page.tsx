import Link from "next/link";
import { signupAction } from "@/app/(auth)/actions";
import { AuthForm, Field } from "@/app/(auth)/_components/AuthForm";

export const metadata = { title: "Crear cuenta · The Money Command" };

export default function SignupPage() {
  return (
    <div>
      <div className="label mb-1">Crear cuenta</div>
      <h2 className="mb-4">Empezá tu plan</h2>

      <AuthForm action={signupAction} submitLabel="Crear cuenta">
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <Field
          label="Contraseña (8+ caracteres)"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
      </AuthForm>

      <p
        className="mt-6"
        style={{ fontSize: "12px", color: "var(--muted)" }}
      >
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" style={{ color: "var(--accent)" }}>
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
