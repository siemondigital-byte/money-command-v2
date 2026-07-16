import Link from "next/link";
import { signupAction } from "@/app/(auth)/actions";
import { AuthForm, Field } from "@/app/(auth)/_components/AuthForm";
import { getDict } from "@/lib/i18n";
import { getBrowserLocale } from "@/lib/i18n/server";

export const metadata = { title: "Crear cuenta · The Money Command" };

export default async function SignupPage() {
  // Sin sesión todavía: el idioma sale del navegador (Accept-Language).
  const t = getDict(await getBrowserLocale()).auth;

  return (
    <div>
      <div className="label mb-1">{t.signupLabel}</div>
      <h2 className="mb-4">{t.signupTitle}</h2>

      <AuthForm action={signupAction} submitLabel={t.signupSubmit}>
        <Field
          label={t.email}
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <Field
          label={t.passwordNew}
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
        {t.haveAccount}{" "}
        <Link href="/login" style={{ color: "var(--accent)" }}>
          {t.signInLabel}
        </Link>
      </p>
    </div>
  );
}
