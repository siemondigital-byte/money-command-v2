import Link from "next/link";
import { recoveryAction } from "@/app/(auth)/actions";
import { AuthForm, Field } from "@/app/(auth)/_components/AuthForm";
import { getDict } from "@/lib/i18n";
import { getBrowserLocale } from "@/lib/i18n/server";

export const metadata = { title: "Recuperar contraseña · The Money Command" };

export default async function RecoveryPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  // Sin sesión todavía: el idioma sale del navegador (Accept-Language).
  const t = getDict(await getBrowserLocale()).auth;
  // Llega con ?expired=1 cuando el enlace de reset caduco/ya se uso (redirigido desde /reset).
  const { expired } = await searchParams;

  return (
    <div>
      <div className="label mb-1">{t.recoveryLabel}</div>
      <h2 className="mb-4">{t.recoveryTitle}</h2>

      {expired && (
        <p
          className="mb-4"
          style={{ color: "var(--accent-2)", fontSize: "12px", lineHeight: 1.5 }}
        >
          {t.errLinkInvalid}
        </p>
      )}

      <AuthForm
        action={recoveryAction}
        submitLabel={t.recoverySubmit}
        successMessage={t.recoverySuccess}
      >
        <Field
          label={t.email}
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
          {t.backToLogin}
        </Link>
      </p>
    </div>
  );
}
