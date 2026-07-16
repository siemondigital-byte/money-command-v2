import { resetPasswordAction } from "@/app/(auth)/actions";
import { AuthForm, Field } from "@/app/(auth)/_components/AuthForm";
import { getDict } from "@/lib/i18n";
import { getBrowserLocale } from "@/lib/i18n/server";

export const metadata = { title: "Nueva contraseña · The Money Command" };

export default async function ResetPage() {
  // Sin sesión todavía: el idioma sale del navegador (Accept-Language).
  const t = getDict(await getBrowserLocale()).auth;

  return (
    <div>
      <div className="label mb-1">{t.resetLabel}</div>
      <h2 className="mb-4">{t.resetTitle}</h2>

      <AuthForm action={resetPasswordAction} submitLabel={t.resetSubmit}>
        <Field
          label={t.resetNewPassword}
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
        <Field
          label={t.resetConfirmPassword}
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
        />
      </AuthForm>
    </div>
  );
}
