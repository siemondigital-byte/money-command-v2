"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { setActivePeriod } from "@/lib/monthly";
import { syncGoalsAndReconsolidate } from "@/lib/goal-sync";

const periodSchema = z.object({
  year: z
    .string()
    .trim()
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v >= 2000 && v <= 2100, "Año inválido"),
  month: z
    .string()
    .trim()
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v >= 1 && v <= 12, "Mes inválido"),
});

function getStr(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

/**
 * Cambia el período activo del usuario en el Profile y consolida el
 * MonthlyRecord del nuevo período desde las entidades vivas (Income,
 * Investments). Revalida toda la app para que el cambio se refleje en
 * cada página.
 *
 * Acepta opcionalmente un `next` en el formulario para redirigir al
 * usuario tras setear el período (ej. desde History → "Editar mes").
 */
export async function setActivePeriodAction(formData: FormData): Promise<void> {
  const { user } = await requireUser();

  const parsed = periodSchema.safeParse({
    year: getStr(formData, "year"),
    month: getStr(formData, "month"),
  });

  if (!parsed.success) {
    console.warn("[setActivePeriod] invalid input:", parsed.error.flatten());
    return;
  }

  const period = { year: parsed.data.year, month: parsed.data.month };

  await setActivePeriod(user.id, period);
  // Orden canónico: sync de gastos de metas del nuevo período → consolidar.
  await syncGoalsAndReconsolidate(user.id, period);

  // Refrescar toda la app (todas las páginas leen del período activo)
  revalidatePath("/", "layout");

  const next = getStr(formData, "next");
  if (next && next.startsWith("/")) {
    redirect(next);
  }
}
