"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";
import { getBrowserLocale } from "@/lib/i18n/server";

const emailSchema = z.string().email("Email inválido");
const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres");

export type ActionResult = { error?: string; ok?: boolean };

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/**
 * Restablecer contraseña vía la automatización propia (n8n), NO vía el correo
 * de Supabase. Motivos: el correo lleva la marca y el color de esta app, y el
 * enlace usa un token propio (60 min, un solo uso) que funciona en cualquier
 * navegador — el flujo PKCE de Supabase falla si el usuario abre el correo en
 * un dispositivo distinto al que pidió el reset.
 */
const RESET_REQUEST_URL =
  process.env.N8N_RESET_REQUEST_URL ??
  "https://hooks.siemondigital.com/webhook/password-reset-request";
const RESET_CONFIRM_URL =
  process.env.N8N_RESET_CONFIRM_URL ??
  "https://hooks.siemondigital.com/webhook/password-reset-confirm";

// ============================================================================
// Signup
// ============================================================================
export async function signupAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = z
    .object({
      email: emailSchema,
      password: passwordSchema,
    })
    .safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  });

  if (error) return { error: error.message };

  redirect("/signup/verify");
}

// ============================================================================
// Login
// ============================================================================
export async function loginAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = z
    .object({
      email: emailSchema,
      password: z.string().min(1, "Ingresa tu contraseña"),
      next: z.string().optional(),
    })
    .safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      next: formData.get("next") ?? undefined,
    });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) return { error: error.message };

  const target = parsed.data.next && parsed.data.next.startsWith("/")
    ? parsed.data.next
    : "/dashboard";
  redirect(target);
}

// ============================================================================
// Logout
// ============================================================================
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

// ============================================================================
// Recovery (envío de email)
// ============================================================================
export async function recoveryAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Email inválido" };
  }

  const t = getDict(await getBrowserLocale()).auth;
  const lang = (await getBrowserLocale()) === "en" ? "en" : "es";

  try {
    const res = await fetch(RESET_REQUEST_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: parsed.data, app: "finanzas", lang }),
    });
    if (!res.ok) throw new Error(`n8n_${res.status}`);
  } catch {
    return { error: t.errSendFailed };
  }

  // Respuesta genérica siempre (no revelar si el email existe).
  return { ok: true };
}

// ============================================================================
// Reset (set new password tras click en link de recovery)
// ============================================================================
export async function resetPasswordAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = z
    .object({
      password: passwordSchema,
      confirm: z.string().min(1),
      token: z.string().min(1),
    })
    .refine((d) => d.password === d.confirm, {
      message: "Las contraseñas no coinciden",
    })
    .safeParse({
      password: formData.get("password"),
      confirm: formData.get("confirm"),
      token: formData.get("token"),
    });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const t = getDict(await getBrowserLocale()).auth;

  // El redirect() de Next.js lanza NEXT_REDIRECT; NO puede ir dentro del try/catch
  // (el catch se lo tragaria). Por eso marcamos y redirigimos despues del bloque.
  let invalidToken = false;
  try {
    const res = await fetch(RESET_CONFIRM_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        token: parsed.data.token,
        password: parsed.data.password,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
    if (!res.ok || !data.ok) invalidToken = true;
  } catch {
    // Error transitorio de red: se queda en la pantalla y puede reintentar.
    return { error: t.errSendFailed };
  }

  // Enlace caducado / invalido / ya usado: llevar a pedir uno nuevo (paridad con mind-app).
  if (invalidToken) redirect("/recovery?expired=1");

  // Sin sesión: el usuario entra con su contraseña nueva desde el login.
  redirect("/login");
}
