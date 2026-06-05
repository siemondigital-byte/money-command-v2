# Contexto de desarrollo

Notas operativas para trabajar en el repo localmente. Para reglas
doctrinales y especificación del producto, leer `CLAUDE.md` y `SPEC.md`.

---

## Seed de desarrollo

Script local que crea (o re-crea) un usuario de prueba con un perfil
financiero coherente, posiciones de Investments en categorías distintas,
e Income de Plan A y Plan C. Plan B queda en modo AUTO (sin override) para
que se compute desde el portafolio.

**Solo para desarrollo. NO correr contra una base de producción.**

### Qué crea

Usuario:

```
Email:    dev-seed@money-command.local
Password: seed-password-1234
```

Contenido del perfil:

| Sección | Contenido |
|---|---|
| Profile | Brújula completa, supuestos (inflación 4.5%, gasto deseado 5000, aumento salarial 3%), método 50/30/20, moneda USD, idioma ES |
| Termostato meta | 16 000/mes |
| Investments | 5 posiciones: Bono Tesoro 10A (renta fija), VOO + SCHD (renta variable), Depto BA (bienes raíces), BTC (especulativo) |
| Income | Plan A "Salario principal" 6500/mes · Plan C "Consultoría freelance" 1200/mes |
| Plan B | AUTO, se computa desde Investments (≈ 785.42/mes) |

### Correr

```bash
npm run db:seed
```

El comando carga `.env.local` con `dotenv-cli` y corre `prisma/seed.ts`
con `tsx`. Necesita:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (la admin API la usa para crear el auth user)
- `DATABASE_URL` y `DIRECT_URL` (Prisma)

### Resetear

El mismo comando — es idempotente:

1. Borra el `User` de Postgres si existe (cascade limpia Profile,
   Investments, Incomes, MonthlyRecords, etc.)
2. Borra el auth user de Supabase si existe (`auth.admin.deleteUser`)
3. Crea un auth user nuevo
4. Repopula Postgres con datos frescos

Re-correrlo cuantas veces haga falta: el estado final siempre es el mismo.

### Borrar manualmente (sin re-poblar)

Si querés dejar la base limpia sin recrear el seed:

```bash
# 1. Borrar el auth user
# (necesitarías un script aparte o usar Supabase Dashboard → Authentication → Users)

# 2. Borrar el row de Postgres
npm run db:studio
# y borrar manualmente el user dev-seed@money-command.local
```

O usar el dashboard de Supabase directamente.

### Reglas operativas

- El seed NO toca otros usuarios. Solo el de email
  `dev-seed@money-command.local`.
- No precargamos datos de ejemplo en cuentas de usuarios reales — eso
  es decisión de onboarding del Sprint 5.
- El seed está pensado para validar UI durante desarrollo, demos
  internas, y como fixture base para Playwright cuando lleguen los E2E.

---

## Scripts útiles del proyecto

```bash
npm run dev          # Next.js dev server con .env.local
npm run build        # build de producción
npm run type-check   # tsc --noEmit
npm run test         # vitest (unit tests, fórmulas, helpers)
npm run test:e2e     # Playwright (cuando esté wireado)

npm run db:migrate   # prisma migrate dev (con .env.local)
npm run db:deploy    # prisma migrate deploy (para CI/prod)
npm run db:generate  # prisma generate
npm run db:studio    # prisma studio
npm run db:seed      # este seed
```

---

## Variables de entorno

Ver `.env.example` para el listado completo y comentarios. Resumen:

| Variable | Quién la usa | Puede commitearse |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | cliente y server | sí (es pública por contrato) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | cliente y server | sí (pública por contrato) |
| `SUPABASE_SERVICE_ROLE_KEY` | solo servidor / scripts admin | NO — secreta |
| `DATABASE_URL` | Prisma runtime (pooler 6543) | NO — contiene password |
| `DIRECT_URL` | Prisma migrate (pooler 5432) | NO — contiene password |
| `NEXT_PUBLIC_SITE_URL` | Auth callback y emails | sí |
