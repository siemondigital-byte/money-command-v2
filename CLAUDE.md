# The Money Command v2 — Instrucciones para Claude Code

> **Antes de cualquier tarea, leer [`ARQUITECTURA.md`](./ARQUITECTURA.md). Manda sobre cualquier implementación.**

> Este archivo es lo primero que Claude Code lee al arrancar en este repo. Define qué se construye, cómo se construye, y qué NO se hace nunca.

---

## Qué es este proyecto

The Money Command es una app web companion del libro "El Sistema Infalible de Riqueza" de Andrea Siemon. Es el quinto bono incluido en la compra del ebook. Reemplaza una v1 fallida que fue archivada.

**Filosofía financiera del libro (CRÍTICA, no negociable)**:
- NO es FIRE clásico (acumular y retirar).
- SÍ es: construir capital que genera flujos pasivos perpetuos SIN tocar el principal.
- Esta distinción aparece en cada fórmula, cada texto del Coach, cada mensaje en pantalla.
- El 4% es la **tasa de retiro sostenible** (divisor del NLF), NO la tasa de retorno.
- El 8% es la **tasa de retorno esperada del portafolio** (crecimiento durante acumulación), NO la tasa de retiro.
- Si en algún momento un texto, fórmula o copy mezcla estos dos conceptos, está mal y hay que corregirlo.

---

## Stack técnico (no cambiar sin discutir)

- **Framework**: Next.js 15 con App Router
- **Lenguaje**: TypeScript estricto
- **Database**: Postgres en Supabase
- **ORM**: Prisma
- **Auth**: Supabase Auth (email + Google)
- **Styling**: Tailwind CSS 4 con tokens custom
- **Charts**: Chart.js 4
- **Deploy**: Vercel
- **Node**: 20.x LTS

---

## Documentos de referencia (en este repo)

Antes de implementar cualquier módulo, leer estos archivos en orden:

1. `SPEC.md` — La especificación oficial completa de los 11 módulos, fórmulas, paleta, arquitectura. Fuente única de verdad.
2. `docs/COACH_CONTENIDO_v3.md` — Contenido textual completo del módulo Coach (53 conceptos, 28 chips, 16 retos, 35 frases, scorecard, logros).
3. `docs/REFERENCIA_4_PORCIENTO_NLF.md` — Documento maestro sobre el 4% y el NLF. Usar para CUALQUIER copy que mencione el NLF.
4. `lib/formulas.ts` — Las fórmulas oficiales ya implementadas en TypeScript. NO reimplementar, importar desde aquí.

---

## Arquitectura central

**Principio**: el `MonthlyRecord` es la tabla maestra. Cada mes es UN registro consolidado con todos los datos del usuario para ese mes.

Los módulos de carga detallada (Income, Expenses, Debts, Investments) viven encima y alimentan automáticamente al MonthlyRecord vía Server Actions que recalculan los totales.

**Flujo de datos**:
```
Usuario carga gasto en módulo Expenses
  ↓
Server Action crea Expense
  ↓
Server Action recalcula totales del MonthlyRecord del mes en curso
  ↓
Server Action actualiza MonthlyRecord
  ↓
Dashboard refleja el cambio en próximo render
```

Esto resuelve el problema raíz de v1: los módulos NO se interconectaban.

---

## Reglas de implementación

### Datos y persistencia

1. **Una sola fila por usuario/año/mes** en `MonthlyRecord`. Constraint único en (userId, year, month).
2. **Sobrescritura con confirmación**: si el usuario registra un mes que ya existe, mostrar diálogo explícito.
3. **Currency NO se convierte**: el campo `currency` en Settings solo controla símbolo y decimales. Internamente todo se guarda en la moneda del usuario.
4. **Server Actions para mutaciones**: usar Server Actions de Next.js, no API routes.
5. **Auth en cada Server Action**: usar `auth()` helper de Supabase, verificar userId al principio de cada action.

### Cálculos y fórmulas

1. **Importar desde `lib/formulas.ts`**. Nunca implementar fórmulas inline en componentes.
2. **Tasas oficiales**: 4% (retiro, divisor NLF, FIJA), 8% (retorno default, EDITABLE).
3. **Búsqueda binaria para años a libertad**: implementada en `lib/formulas.ts::yearsToFinancialFreedom()`. Usar esa.
4. **Round todo lo que se muestra en pantalla**: JS float math deja artefactos (`0.1 + 0.2 = 0.30000000000000004`). Usar `Math.round()`, `.toFixed(n)` o `Intl.NumberFormat` antes de renderizar.

### UI y estilos

1. **Paleta dark obligatoria**. Los tokens están en `app/globals.css` como variables CSS. Usar `var(--accent)`, `var(--surface)`, etc. NUNCA hardcodear colores.
2. **Sin emojis** en ningún elemento de UI. Los logros usan códigos tipográficos `[01]` a `[14]`.
3. **Tipografía contenida**: H1 máximo 2rem, KPIs grandes máximo 2.2rem. Syne para titulares, DM Mono para cuerpo.
4. **Mobile-first**: empezar mobile, escalar a desktop. Breakpoints estándar de Tailwind.
5. **Sin gradientes, sin glow excesivo, sin shadows decorativas**. El glow se reserva para focus states.
6. **Border-radius**: 8px estándar (`rounded-lg` en Tailwind), 12px tarjetas grandes, 16px containers principales.

### Componentes

1. **Componentes funcionales con TypeScript**. Sin clases.
2. **Server Components por default**. Client Components solo cuando hay interactividad real (sliders, formularios, gráficos).
3. **Shadcn/ui para primitivos**: usar Shadcn para botones, inputs, selects, dialogs. Customizar con la paleta dark.
4. **Tabler Icons** para iconografía (outline only). NUNCA emojis.

### Testing

1. **Playwright para E2E** de los flujos críticos: registrar mes, calcular NLF, agregar deuda, simular escenario.
2. **Vitest para unit tests** de las fórmulas en `lib/formulas.ts`. Estos tests son OBLIGATORIOS.
3. **Tests de accesibilidad** con axe-core en cada página principal.

---

## Lo que NUNCA se hace

1. **Nunca mezclar 4% y 8%** como si fueran lo mismo. Son tasas distintas con propósitos distintos.
2. **Nunca usar emojis** en logros, prioridades o cualquier elemento de UI.
3. **Nunca convertir monedas**. El campo currency es cosmético.
4. **Nunca permitir que un MonthlyRecord exista sin userId asociado**. Constraint y validación en Server Action.
5. **Nunca hardcodear textos del Coach en componentes**. Importar desde `lib/coach-content.ts`.
6. **Nunca implementar IA real en v2**. Todos los chips del Coach son mock pre-escritos con placeholders personalizables. IA real es v3.
7. **Nunca decir "retirás el 4% del capital"**. La narrativa correcta es "vivís de los flujos, el capital queda intacto". Ver `docs/REFERENCIA_4_PORCIENTO_NLF.md`.
8. **Nunca mostrar la sección del Scanner**. Está diferida a v3.

---

## Orden de construcción (sprints)

### Sprint 1 (Semana 1-2) — Foundation
- Setup Supabase (proyecto, DB, Auth con email + Google)
- Migración inicial de Prisma con todos los modelos
- Layout principal con header (logo + nav + brújula como susurro)
- Auth flow completo (signup, login, logout, recovery)
- Settings completo (perfil, brújula, supuestos, moneda, idioma, termostato meta)
- Monthly Entry básico (estructura del MonthlyRecord, botón registrar/sobrescribir)

### Sprint 2 (Semana 3) — Módulos de carga
- Income (Plan A manual, Plan B auto desde Investments, Plan C manual)
- Expenses con sección Gastos Hormiga (suscripciones + microgastos)
- Debts (tabla individual + estrategias avalancha/bola de nieve)
- Investments (tabla + retorno ponderado + simulador interés compuesto)

### Sprint 3 (Semana 4) — Análisis
- Dashboard completo (5 bloques + tarjeta Termostato)
- Freedom Calculator (4 tabs primero, después Simulador)
- Tarjeta "Próximo paso personalizado" con las 7 reglas

### Sprint 4 (Semana 5) — Historial, Goals, Coach
- History (timeline + edición de meses anteriores)
- Goals (categorías Necesidad/Deseo/Patrimonio + impacto en método)
- Coach completo (concepto, chips, retos, scorecard, frases)
- Logros y Prioridades del Dashboard
- Tests E2E + accesibilidad + responsive mobile

### Sprint 5 (Semana 6) — Deploy y validación
- Deploy a Vercel
- Connectar Supabase production
- Variables de entorno y secrets
- Demo a Andrea para validación interna (1 semana con datos reales)
- Fix de issues encontrados
- Demo a 2-3 afiliados de confianza

---

## Setup local inicial

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar .env.example a .env.local y llenar
cp .env.example .env.local

# 3. Crear proyecto en Supabase y obtener:
#    - DATABASE_URL (Postgres connection string)
#    - NEXT_PUBLIC_SUPABASE_URL
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY
#    - SUPABASE_SERVICE_ROLE_KEY (server only)

# 4. Aplicar migración inicial de Prisma
npx prisma migrate dev --name init

# 5. Generar cliente Prisma
npx prisma generate

# 6. Arrancar dev server
npm run dev
```

---

## Notas finales

- **El SPEC manda**. Si encontrás una contradicción entre el SPEC y este CLAUDE.md, el SPEC gana. Si la contradicción es real, levantala a Andrea antes de implementar.
- **Los tests de fórmulas son obligatorios**. La matemática del NLF y los años a libertad es la columna vertebral del producto. Si esos cálculos están mal, la app entera pierde credibilidad.
- **La brújula NO es decoración**. Es un susurro persistente. Tamaño chico, peso liviano, color muted.
- **Mobile primero**. La mayoría de los compradores HENRY van a abrir la app desde el celular.
