import Link from "next/link";
import { loginAction } from "@/app/(auth)/actions";
import { AuthForm, Field } from "@/app/(auth)/_components/AuthForm";

export const metadata = { title: "Sign in · The Money Command" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div>
      <div className="label mb-1">Iniciar sesión</div>
      <h2 className="mb-4">Bienvenido de vuelta</h2>

      <AuthForm action={loginAction} submitLabel="Entrar">
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <Field
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {next && <input type="hidden" name="next" value={next} />}
      </AuthForm>

      <div
        className="mt-6 flex flex-col gap-2"
        style={{ fontSize: "12px", color: "var(--muted)" }}
      >
        <Link href="/recovery" style={{ color: "var(--accent-2)" }}>
          Olvidé mi contraseña
        </Link>
        <span>
          ¿No tenés cuenta?{" "}
          <Link href="/signup" style={{ color: "var(--accent)" }}>
            Crear cuenta
          </Link>
        </span>
      </div>
    </div>
  );
}
