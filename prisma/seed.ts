/**
 * Seed de desarrollo — NO USAR EN PRODUCCIÓN.
 *
 * Crea (o re-crea) un usuario de prueba con un Profile coherente, posiciones
 * de Investments en categorías distintas, e Income de Plan A y Plan C. El
 * Plan B queda en modo AUTO (sin override manual) para que se compute desde
 * el portafolio.
 *
 * Idempotente: si el usuario seed ya existe, se borra de Postgres (cascade)
 * y de Supabase Auth, y se vuelve a crear desde cero.
 *
 * Comando:  npm run db:seed
 * Reset:    el mismo comando — borra y recrea.
 */

import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const SEED_EMAIL = "dev-seed@money-command.local";
const SEED_PASSWORD = "seed-password-1234";

const prisma = new PrismaClient();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error(
    "[seed] Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local",
  );
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function clearExisting(): Promise<void> {
  // Postgres primero: borrar User cascadea a Profile, Investments, Incomes, etc.
  const existing = await prisma.user.findUnique({
    where: { email: SEED_EMAIL },
  });
  if (existing) {
    await prisma.user.delete({ where: { id: existing.id } });
    console.log("[seed]   ✓ usuario anterior borrado de Postgres (cascade)");
  }

  // Supabase Auth: listar y borrar si existe (puede haber quedado huérfano).
  let page = 1;
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const match = data.users.find((u) => u.email === SEED_EMAIL);
    if (match) {
      const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(
        match.id,
      );
      if (delErr) throw delErr;
      console.log("[seed]   ✓ auth user anterior borrado de Supabase");
      return;
    }
    if (data.users.length < 200) return; // última página
    page += 1;
  }
}

async function createAuthUser(): Promise<string> {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: SEED_EMAIL,
    password: SEED_PASSWORD,
    email_confirm: true, // saltea confirmación, login directo
  });
  if (error || !data.user) {
    throw new Error(
      "[seed] No se pudo crear auth user: " + (error?.message ?? "unknown"),
    );
  }
  return data.user.id;
}

async function populatePostgres(userId: string): Promise<void> {
  // Income es flujo del mes: lo estampamos en el período activo del seed.
  // El Profile no setea activeYear/activeMonth, así que el período activo
  // por defecto es el mes calendario actual (ver activePeriod()).
  const now = new Date();
  const seedYear = now.getFullYear();
  const seedMonth = now.getMonth() + 1;

  await prisma.user.create({
    data: {
      id: userId,
      email: SEED_EMAIL,

      profile: {
        create: {
          name: "Usuario de prueba",
          ageCurrent: 35,
          ageFreedomTarget: 55,
          country: "AR",

          // Brújula coherente
          compassWhat:
            "vivir de mis flujos pasivos y enseñar a otros a hacerlo",
          compassYear: 2035,
          compassContribution:
            "educación financiera de mujeres emprendedoras",

          // Termostato meta a 2 años: doble del ingreso actual aproximado
          thermostatTarget: 16000,

          // Supuestos
          inflationRate: 4.5,
          freedomMonthlySpend: 5000,
          salaryGrowthRate: 3.0,

          preferredMethod: "50/30/20",
          currency: "USD",
          locale: "es",

          // Plan B en AUTO (sin override)
          planBManualOverride: false,
          planBManualAmount: null,
        },
      },

      investments: {
        create: [
          // Renta fija: ~$112.50/mes flujo
          {
            category: "fixed_income",
            label: "Bono Tesoro EE.UU. 10A",
            capital: 30000,
            passiveYield: 0.045,
          },
          // Renta variable de crecimiento (dividend yield bajo): ~$100/mes
          {
            category: "equity",
            label: "S&P 500 ETF (VOO)",
            capital: 80000,
            passiveYield: 0.015,
          },
          // Renta variable de dividendos: ~$72.92/mes
          {
            category: "equity",
            label: "Acciones dividendos (SCHD)",
            capital: 25000,
            passiveYield: 0.035,
          },
          // Bienes raíces (renta neta): $500/mes
          {
            category: "real_estate",
            label: "Departamento Buenos Aires",
            capital: 120000,
            passiveYield: 0.05,
          },
          // Especulativo sin staking: 0 flujo
          {
            category: "speculative",
            label: "Bitcoin (HODL)",
            capital: 8000,
            passiveYield: 0,
          },
        ],
      },

      incomes: {
        create: [
          {
            plan: "A",
            name: "Salario principal",
            amount: 6500,
            year: seedYear,
            month: seedMonth,
          },
          {
            plan: "C",
            name: "Consultoría freelance",
            amount: 1200,
            year: seedYear,
            month: seedMonth,
          },
        ],
      },
    },
  });
}

async function main() {
  console.log(`[seed] Sembrando usuario de desarrollo: ${SEED_EMAIL}`);
  console.log("[seed] Limpiando estado previo…");
  await clearExisting();

  console.log("[seed] Creando auth user en Supabase…");
  const userId = await createAuthUser();
  console.log(`[seed]   ✓ auth user creado · id=${userId}`);

  console.log("[seed] Poblando Postgres…");
  await populatePostgres(userId);
  console.log(
    "[seed]   ✓ Profile + 5 Investments + 2 Incomes (Plan A y C)",
  );

  console.log("");
  console.log("[seed] Listo. Credenciales del usuario de prueba:");
  console.log(`         Email:    ${SEED_EMAIL}`);
  console.log(`         Password: ${SEED_PASSWORD}`);
  console.log("");
  console.log("[seed] Plan B (AUTO) esperado ≈ $785.42/mes");
  console.log("[seed]   = (30000×4.5% + 80000×1.5% + 25000×3.5% + 120000×5% + 8000×0%) / 12");
  console.log("[seed]   = (1350 + 1200 + 875 + 6000 + 0) / 12 = 9425/12");
}

main()
  .catch((err) => {
    console.error("[seed] ERROR:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
