import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Prisma, type Profile, type User } from "@prisma/client";

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
 *
 * IDENTIDAD ANCLADA AL EMAIL (no al id). El `authId` de Supabase puede cambiar
 * si el usuario de Auth se recrea (p. ej. la automatización de control de
 * acceso lo regenera con un UUID nuevo). En ese caso la fila espejo de Postgres
 * conserva su id viejo —donde cuelgan TODOS los datos (Profile, Expenses, Goals,
 * MonthlyRecord, etc.)— y debe seguir siendo la identidad operativa. Por eso el
 * upsert busca por `email`: si la fila existe, la devuelve tal cual (id viejo
 * intacto, sin tocar la PK ni sus FKs en cascada); solo crea cuando el email no
 * existe todavía, usando el `authId` como id de la fila nueva.
 *
 * Que el `authId` de Supabase difiera del `user.id` de Postgres es inocuo: la
 * app usa `user.id` (Postgres) aguas abajo. El `authId` solo sirve como id
 * inicial al crear una fila nueva.
 */
async function ensureUserRow(
  authId: string,
  email: string,
): Promise<{ user: User; profile: Profile }> {
  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {}, // existe → devolver la fila tal cual (id viejo + datos intactos)
      create: { id: authId, email, profile: { create: {} } },
      include: { profile: true },
    });
    return ensureProfileFor(user);
  } catch (err) {
    // P2002 = unique constraint: otra request concurrente acaba de crear la
    // fila (la doble llamada a requireUser de AppLayout + GoalAutoSync de la
    // Etapa 3b-ii). Releemos por email y seguimos. Mismo patrón que
    // getOrCreateMonthlyRecord en lib/monthly.ts.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { profile: true },
      });
      if (user) return ensureProfileFor(user);
    }
    throw err;
  }
}

/**
 * Garantiza que la fila tenga su Profile. Cubre filas viejas creadas sin
 * profile. El upsert por `userId` (único) es resistente a carreras: si dos
 * requests concurrentes lo crean a la vez, una gana y la otra lo recupera.
 */
async function ensureProfileFor(
  user: User & { profile: Profile | null },
): Promise<{ user: User; profile: Profile }> {
  if (user.profile) return { user, profile: user.profile };
  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });
  return { user, profile };
}
