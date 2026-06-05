import { resetPasswordAction } from "@/app/(auth)/actions";
import { AuthForm, Field } from "@/app/(auth)/_components/AuthForm";

export const metadata = { title: "Nueva contraseña · The Money Command" };

export default function ResetPage() {
  return (
    <div>
      <div className="label mb-1">Restablecer</div>
      <h2 className="mb-4">Definí tu nueva contraseña</h2>

      <AuthForm action={resetPasswordAction} submitLabel="Guardar contraseña">
        <Field
          label="Nueva contraseña (8+ caracteres)"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
        <Field
          label="Confirmar contraseña"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
        />
      </AuthForm>
    </div>
  );
}
