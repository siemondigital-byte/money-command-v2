# The Money Command v2 — Especificación Oficial

> **Antes de cualquier tarea, leer [`ARQUITECTURA.md`](./ARQUITECTURA.md). Manda sobre cualquier implementación.**

> **Versión**: 1.0 · **Estado**: Congelado para construcción · **Fecha**: 4 junio 2026
>
> Esta spec describe el **contenido** de cada módulo. `ARQUITECTURA.md` describe **cómo se conectan** los datos (MonthlyRecord como fuente única de verdad, período global, dos clases de dato). Si hay conflicto, gana ARQUITECTURA.md.
>
> Documentos satélite:
> - `docs/COACH_CONTENIDO_v3.md` — Contenido del Coach (53 conceptos, 28 chips, 16 retos, 35 frases)
> - `docs/SPEC_ADICION_v2_Termostato_Brujula_Simulador.md` — Detalle de los 3 elementos derivados de v30
> - `docs/REFERENCIA_4_PORCIENTO_NLF.md` — Maestro sobre el 4% y el NLF

---

## Resumen ejecutivo

App companion del libro "El Sistema Infalible de Riqueza" de Andrea Siemon. Quinto bono incluido en la compra del ebook. Diferenciador clave del producto vs miles de libros de finanzas personales.

v1 (Vite + localStorage) archivada por problemas estructurales: los módulos no se interconectaban. v2 se reconstruye siguiendo el SPEC central de Leo Crest (MonthlyRecord como tabla maestra) y extendiéndolo con módulos de carga detallada y análisis.

**Filosofía financiera**: NO es FIRE clásico. Es construir capital que genera flujos pasivos perpetuos SIN tocar el principal. Esta distinción es central.

---

## Stack técnico

| Capa | Tecnología | Razón |
|---|---|---|
| Framework | Next.js 15 (App Router) | Un solo repo, Server Actions, deploy directo a Vercel |
| Database | Supabase Postgres | Tier gratuito, integración nativa, escalable |
| ORM | Prisma | Type-safety, migraciones controladas |
| Auth | Supabase Auth | Email + Google, JWT incluido |
| Styling | Tailwind CSS 4 | Tokens custom, mobile-first |
| Charts | Chart.js 4 | Probado, ligero, accesible |
| Deploy | Vercel | Build pipeline, preview deployments |
| Node | 20.x LTS | Compatibilidad estable |

---

## Paleta visual oficial

Confirmada como branding del producto. Tokens definidos en `app/globals.css` y `tailwind.config.ts`.

```
Backgrounds:  --bg #0a0a0f · --surface #13131a · --surface-2 #1c1c27
Text:         --text #f0f0f8 · --muted #6b6b80 · --hint #4a4a5a
Accents:      --accent #7fffb2 (verde neón) · --accent-2 #4dd9ff (cian) · --gold #ffd166
Semantic:     --danger #ff6b6b · --warning #ffd166 · --success #7fffb2
```

**Tipografía**: Syne (titulares, 400/700/800) · DM Mono (cuerpo, 300/400/500).

**Escala contenida** (mobile-friendly):
- H1: 1.5-2rem (24-32px)
- H2: 1.1-1.3rem (18-21px)
- KPI grande: 1.8-2.2rem
- Body: 13-14px
- Label: 10-11px uppercase, letter-spacing 0.15em

**Reglas**: fondos siempre dark, sin emojis (usar códigos `[01]`-`[14]`), sin gradientes/glow excesivo, border-radius 8/12/16px.

---

## Arquitectura central

**Principio**: `MonthlyRecord` es la tabla maestra. Una fila por usuario/año/mes. Los módulos de carga detallada (Income, Expenses, Debts, Investments) alimentan automáticamente los totales del MonthlyRecord vía Server Actions.

```
User (Supabase Auth)
├── Profile (settings, brújula, supuestos, moneda, idioma)
├── MonthlyRecord[] (UNO por usuario/año/mes)
├── Income[] (Plan A, Plan C; Plan B se calcula desde Investments)
├── Expense[] (gastos con categoría, N/D, periodicidad, hormiga flag)
├── Debt[] (cada deuda con saldo, APR, pago, tipo)
├── Investment[] (cada inversión con tipo, valor, aporte, retorno)
├── Goal[] (cada meta con categoría: Necesidad/Deseo/Patrimonio)
├── Achievement[] (logros desbloqueados, no se repiten)
└── SavedScenario[] (escenarios guardados del Simulador)
```

---

## Los 11 módulos

1. **Dashboard** — Educación + KPIs + Triángulo + Termostato + Método (sliders) + Progreso + Logros/Prioridades
2. **Monthly Entry** — Resumen autocalculado del mes
3. **Income** — Plan A (manual), Plan B (auto), Plan C (manual)
4. **Expenses** — Gastos individuales + sección Gastos Hormiga (suscripciones + microgastos)
5. **Debts** — Tabla individual + estrategias avalancha/bola de nieve
6. **Investments** — Portafolio + retorno ponderado + simulador interés compuesto
7. **Goals** — Metas categorizadas (Necesidad/Deseo/Patrimonio)
8. **Freedom Calculator** — 5 tabs (Tu Número, Proyección, Sensibilidad, Escenarios, **Simulador**)
9. **History** — Timeline con edición de meses anteriores
10. **Coach** — Concepto, chips, retos, scorecard, frases
11. **Settings** — Perfil, brújula, supuestos, moneda, idioma

Scanner queda diferido a v3.

---

## Fórmulas oficiales

Implementadas en `lib/formulas.ts`. NO reimplementar inline en componentes.

### Número de Libertad Financiera

```
NLF = (Gasto Mensual Deseado × 12) ÷ 0.04
```

El 4% es tasa de retiro sostenible (Trinity Study). FIJA, no editable.

### Retorno Ponderado del Portafolio

```
Retorno Ponderado = Σ (% asignación × retorno esperado del tipo)
```

Calculado dinámicamente desde Investments. Default 8% si no hay portafolio.

**Retornos default por tipo** (todos editables):

| Tipo | Default |
|---|---|
| Renta Variable | 8% |
| Renta Fija | 4% |
| Liquidez | 1% |
| Bienes Raíces | 6% |
| Dividendos | 5% |
| Crypto | 12% (con warning) |
| Otros | Editable |

### Años hasta Libertad Financiera

```
Resolver para n:
NLF = PV × (1+r)^n + (PMT × 12) × [((1+r)^n − 1) / r]
```

Método: búsqueda binaria entre n=0 y n=80. Si `PV ≥ NLF`, retorna 0.

### Otras

```
Patrimonio Neto = Activos − Pasivos
Tasa Ahorro = (Ingreso − Gastos) ÷ Ingreso × 100
Retorno Real = [(1+Nominal) ÷ (1+Inflación)] − 1
APR Ponderado = Σ (saldo × APR) ÷ Σ saldos
Ratio Deuda/Ingreso = Pagos mensuales totales ÷ Ingreso mensual neto × 100
Multiplicador Termostato = Meta ÷ Actual
Renta Pasiva Mensual = Capital × 0.04 ÷ 12
```

---

## Especificación por módulo

### Módulo 1 · Dashboard

5 bloques apilados verticalmente. Header global con logo + nav + brújula como susurro.

**Bloque 1 · Educación del día**: afirmación del día, botones Siguiente/Otra cita.

**Bloque 2 · Situación + Triángulo + Termostato**: 5 KPIs (Ingreso Total, Gastos Totales, Inversión Mensual, Patrimonio Neto, Deuda Total) + Triángulo de la Riqueza + Tarjeta Termostato.

**Bloque 3 · El Método** (Distribución absorbida):
- Enunciado de lógica: Necesidades ↓ → Inversiones ↑ · Inversiones ↑ → Deseos ↓ · Deseos ↓ → Inversiones ↑
- Botones variante: 50/30/20 · 50/25/25 · 50/20/30 · 40/20/40
- Sliders ajustables (simulación temporal, no se guarda)
- Gráfica de distribución (real vs ideal vs simulada)
- Gráfica de bola de nieve

**Bloque 4 · Progreso**: barra + 3 KPIs (Número de Libertad, Renta Pasiva/Mes, Años Est.).

**Bloque 5 · Logros y Prioridades**: medallas tipográficas + cards accionables.

### Módulo 2 · Monthly Entry

Resumen del mes autocalculado. Campos consolidados (incomeTotal, expenseTotal por categoría, liabilityTotal, assetTotal, netWorth, savingsRate, weightedReturn). Botón "Registrar mes" con confirmación de sobrescritura.

### Módulo 3 · Income

Plan A (manual, editar/borrar), Plan B (AUTO desde Investments), Plan C (manual). KPIs: Total Ingresos, % pasivo, Capital posible a invertir/mes (real vs ideal según método).

### Módulo 4 · Expenses

Gastos individuales con categoría, tipo, etiqueta N/D, periodicidad. KPIs: Total Fijos, Total Variables, Total Presupuesto, Total Real, gráfico N vs D.

**Sección Gastos Hormiga** (dentro de Expenses):
- Suscripciones (renovación automática)
- Microgastos recurrentes (unitAmount × frequencyPerMonth)

Resumen por gasto hormiga: costo mensual, anual, acumulado hasta libertad proyectada.

### Módulo 5 · Debts

Tabla: Nombre · Tipo · Saldo · APR · Mín · Pago · Meses restantes · Interés acumulado.

Tipos: tarjeta de crédito, préstamo fijo con plazo, préstamo sin interés, hipoteca, otros.

KPIs: Deuda Total, Pago Mensual, APR Ponderado, Ratio Deuda/Ingreso con semáforo (Verde <30%, Amarillo 30-50%, Rojo >50%), Libre de deudas (año/mes proyectado).

Estrategias: muestra Avalancha y Bola de Nieve. Gráfico de progreso.

### Módulo 6 · Investments

Tabla: Nombre · Tipo · Valor · Aporte/Mes · % Retorno · Valor 5A · Renta 10A.

KPIs: Valor Total, Aporte Mensual Total, Retorno Ponderado, Proyección 10A, Renta a 10A.

Gráficos: crecimiento a 30A por nombre (stacked area), distribución por tipo (donut).

**Simulador de interés compuesto** dentro del módulo:
- Modo Hipotético (cifras de prueba)
- Modo Sobre mi portafolio (datos reales)
- Toggle para cambiar

### Módulo 7 · Goals

Categorías: Necesidad, Deseo, **Patrimonio** (renombrado desde Inversión).

Campos por meta: nombre, categoría, monto objetivo, fecha objetivo, monto actual, aporte/mes.

KPIs: Metas Activas, Progreso Promedio, Próxima con ETA (fecha más cercana), Aporte Mensual Total.

Visualizaciones: gráfico Deseos vs Necesidades, barra global, timeline.

Impacto en método: cada meta muestra cuánto suma/resta a la distribución ideal.

### Módulo 8 · Freedom Calculator (5 tabs)

- **Tab 1 Tu Número**: pre-cargado con datos del usuario, sliders ajustan gasto deseado y NLF.
- **Tab 2 Proyección**: gráfico patrimonio proyectado vs NLF en el tiempo.
- **Tab 3 Sensibilidad**: tabla con variaciones de aporte/retorno/gasto.
- **Tab 4 Escenarios**: escenarios guardados desde Simulador, comparación lado a lado.
- **Tab 5 Simulador**: ver sección dedicada abajo.

Tarjeta "Tu próximo paso personalizado" siempre visible con las 7 reglas.

### Módulo 9 · History

Tabla: Mes · Ingresos · Gastos · Deuda · Invertido · Ahorro % · Patrimonio · No Realizado.

KPIs: Mejor ahorro %/mes, Tendencia Ahorro, No Realizado, Deuda Reducida.

Comportamiento: usuario agrega meses anteriores con fecha manual. Registrar mes actual sobrescribe con confirmación. Tabla edita/borra cualquier registro, incluida la fecha. Gráfico de serie temporal.

### Módulo 10 · Coach

6 bloques (orden vertical):

1. Concepto del día (53 conceptos rotando) + botones Explícamelo más / Otro concepto
2. Recordatorio del día (35 frases rotando)
3. Reto de la semana (16 retos, orden secuencial)
4. Barra Salud Financiera + Scorecard 0-100
5. KPIs: Tasa de ahorro, Renta Pasiva, Patrimonio, Inversiones
6. Chips (28 chips personalizados con datos del usuario)

Contenido completo: `docs/COACH_CONTENIDO_v3.md`. Todo mock pre-escrito, IA real va a v3.

### Módulo 11 · Settings

1. **Perfil**: Nombre, email, edad actual, edad objetivo de libertad, país
2. **Brújula** (3 campos que arman frase del header): "Estoy construyendo este patrimonio para poder ___ / para el año ___ / porque quiero contribuir ___"
3. **Termostato meta a 2 años** (campo numérico)
4. **Supuestos**: inflación anual (tabla precargada por país + "Personalizar inflación" con slider), gasto mensual de libertad, tasa aumento salarial
5. **Método preferido** (50/30/20 default)
6. **Moneda** (símbolo y decimales, SIN conversión)
7. **Idioma** (ES/EN)

---

## Termostato Financiero (detalle)

Ver `docs/SPEC_ADICION_v2_Termostato_Brujula_Simulador.md`. Resumen:

- Ubicación: Dashboard, Bloque 2, cuarta tarjeta
- Cálculo automático del actual: promedio de ingreso neto de últimos 12 meses
- Meta a 2 años: input manual en Settings
- Multiplicador: meta ÷ actual
- Zonas: <2x (sistema técnico alcanza), 2-5x (mentalidad en paralelo), >5x (mentalidad primero)
- Gráfico de evolución temporal (promedio móvil 12 meses)
- Logro `[13]` Termostato +1 al cruzar umbrales

---

## Brújula del usuario (detalle)

- Settings: 3 campos (max 80 char cada uno) + año
- Header global: frase como susurro liviano debajo del logo en TODAS las pantallas
- Estilo: 11-13px, peso 300-400, color `--muted` opacity 0.7
- Si vacía: link "Definí tu brújula"
- Recordatorio del Coach si no completa en 14 días
- Indicador "Tu meta está a [X] meses" cuando `compass_year` está a <12 meses

---

## Simulador (Freedom Calculator Tab 5)

Sliders (todos parten de valores reales del usuario):

| Variable | Mín | Máx | Paso |
|---|---|---|---|
| Aporte mensual | 0 | Ingreso × 1.5 | 50 |
| Retorno ponderado anual | 1% | 15% | 0.5% |
| Reducción de Deseos | 0% | 50% | 5% |
| Aumento de ingreso simulado | 0% | 100% | 5% |
| Capital inicial extra | 0 | ∞ | 1000 |

Outputs en tiempo real: años a libertad, patrimonio proyectado, renta pasiva, diferencia vs base.

Gráfica: dos líneas superpuestas (actual sólida, simulado diferenciado), intersección con NLF marcada.

Botones: Reset, Guardar como escenario, Aplicar a mi plan.

---

## Scorecard, Logros, Prioridades

### Scorecard 0-100

| Componente | Puntos | Cálculo |
|---|---|---|
| Tasa de ahorro | 30 | <5%=0, 5-10%=10, 10-20%=20, 20-30%=27, >30%=30 |
| Fondo emergencia | 20 | (meses ÷ 6) × 20, máx 20 |
| Ratio deuda/ingreso | 20 | >50%=0, 30-50%=10, 15-30%=15, <15%=20 |
| Diversificación | 15 | 1 tipo>5%=3, 2 tipos=8, 3+ tipos=15 |
| Progreso NLF | 15 | (Patrimonio ÷ NLF) × 15, máx 15 |

Mensajes por rango (Excepcional 90-100, Excelente 75-89, etc.): ver `docs/COACH_CONTENIDO_v3.md` sección 5.

### Logros (14, sin emojis)

`[01]` Primer Ahorro · `[02]` Constructor · `[03]` Base Firme · `[04]` Inversor · `[05]` Cinco Cifras · `[06]` Curva Visible · `[07]` Seis Cifras · `[08]` Avalancha 25 · `[09]` Avalancha 50 · `[10]` Avalancha 75 · `[11]` Libre · `[12]` Número · `[13]` Termostato +1 · `[14]` Triángulo Equilibrado.

Triggers detallados: ver `docs/COACH_CONTENIDO_v3.md` sección 6.

### Prioridades sugeridas (orden de evaluación)

1. Deuda de consumo APR >15% → pagar antes de invertir
2. Fondo emergencia <3 meses → completar 6 meses prioridad
3. Tasa ahorro <10% → revisar gastos hormiga
4. Deseos >35% → identificar automáticos
5. N suscripciones por >X → revisar uso
6. Portafolio concentrado en 1 tipo → diversificar
7. Sin movimiento History >45 días → registrar
8. Termostato no actualizado >12 meses → recalibrar

---

## Roadmap de construcción

| Sprint | Semana | Entregables |
|---|---|---|
| 1 | 1-2 | Foundation + Auth + Settings + Monthly Entry |
| 2 | 3 | Income + Expenses + Debts + Investments |
| 3 | 4 | Dashboard + Freedom Calculator + Próximo paso |
| 4 | 5 | History + Goals + Coach + Logros + Tests |
| 5 | 6 | Deploy + Validación Andrea + Demo afiliados |

Total: 6 semanas hasta deploy listo para afiliados.

---

*Documento congelado. Cualquier cambio que toque arquitectura, fórmulas o módulos vuelve a este documento antes de tocar código.*
