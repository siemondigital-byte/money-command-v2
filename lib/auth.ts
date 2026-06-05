import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Profile, User } from "@prisma/client";

/**
 * Devuelve el usuario autenticado de Supabase + asegura que existe la fila
 * espejo en Postgres (User + Profile vacío). Si no hay sesión, redirige a /login.
 *
 * Llamar al inicio de cualquier Server Component o Server Action protegido.
 */
export async function requireUser(): Promise<{
  authId: string;
  email: string;
  user: User;
  profile: Profile;
}> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser || !authUser.email) {
    redirect("/login");
  }

  const { user, profile } = await ensureUserRow(authUser.id, authUser.email);
  return { authId: authUser.id, email: authUser.email, user, profile };
}

/**
 * Versión que no redirige: devuelve null si no hay sesión.
 * Útil para layouts que sirven tanto rutas públicas como privadas.
 */
export async function getOptionalUser() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser || !authUser.email) return null;
  const { user, profile } = await ensureUserRow(authUser.id, authUser.email);
  return { authId: authUser.id, email: authUser.email, user, profile };
}

/**
 * Crea (si no existe) la fila User + Profile en Postgres correspondiente al
 * usuario de Supabase Auth. Idempotente.
 */
async function ensureUserRow(
  authId: string,
  email: string,
): Promise<{ user: User; profile: Profile }> {
  const existing = await prisma.user.findUnique({
    where: { id: authId },
    include: { profile: true },
  });

  if (existing && existing.profile) {
    return { user: existing, profile: existing.profile };
  }

  if (existing && !existing.profile) {
    const profile = await prisma.profile.create({
      data: { userId: existing.id },
    });
    return { user: existing, profile };
  }

  const created = await prisma.user.create({
    data: {
      id: authId,
      email,
      profile: { create: {} },
    },
    include: { profile: true },
  });

  return { user: created, profile: created.profile! };
}
