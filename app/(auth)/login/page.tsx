import Link from "next/link";
import { loginAction } from "@/app/(auth)/actions";
import { AuthForm, Field } from "@/app/(auth)/_components/AuthForm";
import { getDict } from "@/lib/i18n";
import { getBrowserLocale } from "@/lib/i18n/server";

export const metadata = { title: "Sign in · The Money Command" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // Sin sesión todavía: el idioma sale del navegador (Accept-Language).
  const t = getDict(await getBrowserLocale()).auth;

  return (
    <div>
      <div className="label mb-4">{t.signInLabel}</div>

      <AuthForm action={loginAction} submitLabel={t.signInSubmit}>
        <Field
          label={t.email}
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <Field
          label={t.password}
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
          {t.forgotPassword}
        </Link>
        <span>
          {t.noAccount}{" "}
          <Link href="/signup" style={{ color: "var(--accent)" }}>
            {t.createAccount}
          </Link>
        </span>
      </div>
    </div>
  );
}
