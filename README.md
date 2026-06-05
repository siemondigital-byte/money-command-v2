# The Money Command v2

App companion del libro "El Sistema Infalible de Riqueza" de Andrea Siemon.

## Stack

Next.js 15 (App Router) · Supabase · Prisma · Tailwind CSS 4 · Chart.js · TypeScript estricto · Vercel.

## Documentos clave (lee primero)

1. [`CLAUDE.md`](./CLAUDE.md) — Instrucciones para Claude Code. Reglas del proyecto.
2. [`SPEC.md`](./SPEC.md) — Especificación oficial completa. Fuente única de verdad.
3. [`docs/COACH_CONTENIDO_v3.md`](./docs/COACH_CONTENIDO_v3.md) — Contenido textual del módulo Coach.
4. [`docs/REFERENCIA_4_PORCIENTO_NLF.md`](./docs/REFERENCIA_4_PORCIENTO_NLF.md) — Documento maestro sobre el 4% y el NLF.
5. [`lib/formulas.ts`](./lib/formulas.ts) — Fórmulas oficiales en TypeScript.

## Setup local

### 1. Prerequisitos

- Node.js 20.x LTS o superior
- Cuenta en Supabase (tier gratuito alcanza para desarrollo)
- Cuenta en Vercel (para deploy)

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com).
2. Ir a Settings > API y copiar:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, secreta)
3. Ir a Settings > Database y copiar el connection string para `DATABASE_URL`.

### 4. Variables de entorno

```bash
cp .env.example .env.local
# Editar .env.local con tus valores reales
```

### 5. Migración inicial de la base de datos

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Arrancar dev server

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Arranca dev server con hot reload |
| `npm run build` | Build de producción |
| `npm run start` | Arranca server de producción |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript check sin emit |
| `npm run test` | Vitest (unit tests, incluye formulas) |
| `npm run test:e2e` | Playwright E2E |
| `npm run db:migrate` | Aplicar migración Prisma |
| `npm run db:generate` | Regenerar cliente Prisma |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run db:seed` | Seed inicial (cuando esté implementado) |

## Orden de construcción

Ver `CLAUDE.md` sección "Orden de construcción (sprints)" para el roadmap completo.

Resumen:

- **Sprint 1** (semana 1-2): Foundation + Auth + Settings + Monthly Entry
- **Sprint 2** (semana 3): Income + Expenses + Debts + Investments
- **Sprint 3** (semana 4): Dashboard + Freedom Calculator
- **Sprint 4** (semana 5): History + Goals + Coach + Logros
- **Sprint 5** (semana 6): Deploy + Validación

## Deploy

Deploy a Vercel:

```bash
# Primer deploy
npx vercel

# Conectar variables de entorno desde el dashboard de Vercel
# Después, cada push a main hace auto-deploy
```

## Notas

- **El proyecto v1** (Vite + localStorage) está archivado en otro repo y NO se reutiliza código.
- **La filosofía financiera** del libro está documentada en `CLAUDE.md` y debe respetarse en cada copy y fórmula.
- **No usar emojis** en ningún elemento de UI. Los logros usan códigos tipográficos `[01]` a `[14]`.
