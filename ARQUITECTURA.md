# ARQUITECTURA: The Money Command (money-command-v2)

> Documento ley. Manda sobre cualquier implementacion. Todo modulo se construye
> contra este modelo. Si un modulo no consolida en MonthlyRecord, esta mal hecho,
> aunque sus tests internos pasen. Esta seccion describe COMO se conectan los
> datos. El mapeo de 12 puntos (SPEC) describe el CONTENIDO de cada modulo. El
> prototipo HTML es la referencia VISUAL de como se ve cada modulo resuelto. Los
> tres juntos son la fuente de verdad, en ese orden de prioridad cuando hay
> conflicto: doctrina del libro > esta arquitectura > prototipo visual.

---

## 0. Reglas de trabajo para Claude Code (leer antes de tocar codigo)

1. El proyecto es `~/Documents/money-command-v2` (Next.js 15 + Supabase + Prisma).
   NUNCA trabajar en `~/Documents/money-on-command` (es la v1 vieja en Vite,
   archivada). Confirmar el directorio antes de empezar cualquier tarea.
2. Despues de cualquier cambio en `schema.prisma`, correr `prisma generate`
   ANTES de usar el cliente. Un cliente desincronizado produce
   `PrismaClientValidationError`.
3. NUNCA pasar funciones como prop de un Server Component a un Client Component
   (error "Functions cannot be passed directly to Client Components"). Las
   funciones de formato y calculo (`formatMoney`, `fv`, etc.) viven en modulos
   util planos en `lib/` y se importan directo dentro del Client Component que
   las use. No marcar funciones puras de formato con `"use server"`.
4. Todo valor monetario se muestra con 2 decimales consistentes. El KPI grande y
   el subtotal de la misma cifra tienen que cuadrar al centavo.
5. Cada tarea termina con: type-check, vitest, commit local, y PARA. No encadenar
   modulos sin luz verde explicita de Andrea.
6. Validar SIEMPRE en cuenta limpia (registrarse con un email nuevo, sin seed),
   nunca en `dev-seed@money-command.local`. El seed trae datos que el usuario no
   cargo y confunde la validacion.

---

## 1. Principio rector

El usuario NUNCA carga el mismo dato dos veces. Cada dato financiero se ingresa
una sola vez, en su modulo, y el sistema lo consolida solo. Si en algun flujo el
usuario tiene que re-ingresar algo que ya puso en otro modulo, es un bug de
arquitectura, no una decision de diseno.

---

## 2. Periodo global (mes / ano)

- Selector de mes/ano persistente en el header, visible en toda la app.
- Por defecto: mes actual. El usuario puede elegir cualquier mes/ano para
  registrar, ver o editar, incluidos meses anteriores al uso de la app.
- TODO lo que se carga o se ve esta filtrado por el Periodo activo.
- Reescritura permitida: registrar sobre un mes existente sobrescribe con
  confirmacion y recalcula todas las metricas derivadas.

---

## 3. Dos clases de dato

| Clase | Modulos | Comportamiento |
|---|---|---|
| Flujo del mes | Income (A/C), Expenses | Numeros que cambian mes a mes. Se asocian al Periodo activo. |
| Estado actual | Investments, Debts, Goals, Profile | No son "de un mes". Son el estado de hoy. Al cerrar un mes el sistema toma un SNAPSHOT de sus totales hacia el MonthlyRecord. No se recargan cada mes. |

- Plan B NO es un dato que se carga: es computado desde Investments
  (`monthlyPlanB`), ya implementado. Income lo consume, no lo duplica.
- Para meses pasados (sin estado vivo en ese momento), los campos snapshot
  (deuda total, valor de portafolio, patrimonio) son editables a mano.

---

## 4. MonthlyRecord: fuente unica de verdad

Una fila por usuario/mes. Es de donde leen Dashboard, History, Coach, los KPIs
globales y la barra de libertad. NADIE lee de listas sueltas de los modulos para
metricas globales.

Campos (derivados de la tabla de History del mapeo, punto 9):

- `period` (ano, mes)
- `incomeTotal` = Plan A + Plan B (computado desde Investments) + Plan C
- `expensesTotal`, y por canasta: `essentials` / `style` / `freedom`
- `savingsRate` % = (incomeTotal - expensesTotal) / incomeTotal
- `debtTotal` (snapshot)
- `investedThisMonth`, `portfolioValue` (snapshot)
- `netWorth` (snapshot) = activos - pasivos
- `notRealized` ("No realizado": ahorro potencial no concretado)

Regla: las paginas de modulo, filtradas por Periodo, ESCRIBEN al MonthlyRecord
de ese mes. Income escribe los campos de ingreso; Expenses los de gasto; al
cerrar el mes se snapshotean `debtTotal`, `portfolioValue` y `netWorth` desde las
entidades vivas.

---

## 5. Dashboard: espejo, nunca entrada

El Dashboard es el resumen del estado financiero completo del Periodo: ingresos,
gastos, deudas, inversiones, patrimonio y camino a la libertad. NO tiene
formularios de carga. Lee del MonthlyRecord del Periodo y de las series
historicas. Si el Dashboard necesita un dato que no esta en MonthlyRecord, falta
consolidarlo (paso 4), no agregar un input al Dashboard.

- En el Dashboard la deuda aparece como parte del resumen (deuda total, su peso
  en el patrimonio). La grafica de pago de deudas (bola de nieve / avalancha) NO
  va en el Dashboard: vive solo en Debts.
- La grafica de interes compuesto (crecimiento de inversiones) SI va en el
  Dashboard, como parte del resumen patrimonial.

---

## 6. Simulador del metodo (slider): simulacion, no escritura

En Dashboard el usuario ve su distribucion REAL (calculada desde los gastos
reales de Expenses del Periodo, agrupados en Esenciales/Estilo/Libertad) y puede
mover las barras (50/30/20, 50/25/25, 50/20/30, 40/20/40, o arrastre libre). La
app recalcula EN VIVO: capital invertible/mes, curva de interes compuesto de sus
inversiones, y anos/retorno a la libertad.

ESTO ES SIMULACION. No reescribe los gastos reales del mes ni el metodo
persistido (`profile.preferredMethod`). Es un "que pasaria si". Si el usuario
decide adoptar una distribucion, ajusta sus gastos reales en Expenses; el
simulador no lo hace por el.

CRITICO: la tasa de ahorro y las metricas reales NUNCA salen del slider. Salen de
ingresos reales menos gastos reales del MonthlyRecord. El slider solo alimenta la
proyeccion de simulacion.

---

## 7. Termostato financiero

- Observado: el sistema lo deriva del historico de MonthlyRecords (el nivel de
  gasto/patrimonio al que el usuario tiende a volver). Se muestra:
  "tu termostato actual, segun tu historico, es X".
- Meta: `thermostatTarget` (manual, en Settings), a donde quiere llevarlo.
- El valor esta en mostrar la BRECHA entre observado y meta.
- El observado requiere historico: con pocos meses, mostrar "necesitas N meses de
  registro para calcularlo", no un numero falso.

---

## 8. Doctrina financiera (NO NEGOCIABLE)

El modelo del libro es: construir capital que genera flujos pasivos mientras el
capital queda intacto y sigue creciendo. Se vive de los FLUJOS, no se retira
capital. Esto rechaza el modelo FIRE / Trinity Study de retiro del 4% del
portafolio.

Tres tasas distintas, nunca mezclar:

1. ~8%: tasa de crecimiento de cartera durante la acumulacion. Es la que se usa
   para proyectar el crecimiento del portafolio a 5/10/20/30 anos.
2. 4%: UNICO divisor valido del Numero de Libertad Financiera (NLF).
   `NLF = Gasto Mensual x 12 / 0.04`. NO es tasa de retiro. Es un divisor de
   referencia conservador.
3. Yield pasivo por posicion: lo que cada inversion entrega como flujo
   (dividendos, intereses, renta neta). Plan B mensual = suma de
   (capital de la posicion x su yield) / 12. Es `monthlyPlanB`. Esto es lo que
   alimenta la "renta pasiva".

Prohibido en toda la app (UI, coach, calculadora, roadmap):

- "Tasa de retiro", "retirar el 4% del portafolio cada ano", "safe withdrawal
  rate". El campo de tasa de retiro de la calculadora del prototipo se ELIMINA.
- Framing de "reduce gastos" como primer paso del metodo. El lenguaje es
  "elegir mejor", "ordenar", "dirigir el dinero". "Gastar no es despilfarrar".
- "Renta pasiva" calculada como portafolio x 4%. La renta pasiva = `monthlyPlanB`
  (yields reales por posicion), no el 4% del portafolio.

La calculadora de libertad usa la formula corregida (NLF con divisor 4%) y
proyecta el patrimonio creciendo al ~8%, mostrando cuando los flujos pasivos
cubren el gasto, sin tocar capital.

---

## 9. Nomenclatura de canastas (alineada con libro y coach)

Esenciales / Estilo / Libertad. Claves i18n: `essentials` / `style` / `freedom`.
Nunca Necesidades/Deseos/Inversiones como nombre de canasta.

- Esenciales: vivienda, comida, servicios, transporte, seguros.
- Estilo: entretenimiento, restaurantes, viajes, ropa, suscripciones.
- Libertad: ahorro, inversion, educacion, pago de deuda.

Enunciado de logica en Dashboard: "Esenciales menos, Libertad mas. Libertad mas,
Estilo menos."

---

## 10. Sin doble registro (deuda tecnica a eliminar)

Hoy coexisten la "Monthly Entry" del Sprint 1 y el modulo Income del Sprint 2:
dos lugares para cargar ingresos que no se hablan. En la arquitectura de 11
modulos NO existe una Monthly Entry aparte. El "sistema mensual" ES: Periodo
global + paginas de modulo + History. Refundir/eliminar la Monthly Entry del
Sprint 1. Income es el unico punto de carga de ingresos.

---

## 11. Datos precargados: separar dos usos

- Seed de desarrollo (`dev-seed`): para que Code valide. NUNCA es la realidad del
  usuario. Mientras se valida arquitectura, usar cuenta limpia.
- Onboarding del cliente nuevo: decision de Sprint 5, no implementar antes.

---

## 12. Moneda e idioma (Settings)

La configuracion de moneda NO hace conversion. Solo ajusta el simbolo y la
cantidad de decimales en todas las graficas y KPIs. Si al cambiar de moneda ni
el simbolo cambia, eso es bug, no diseno. El idioma (ES/EN) traduce la UI.

---

## 13. Protocolo de validacion (antes de cada luz verde)

Cada modulo se valida en cuenta limpia antes de avanzar al siguiente:
1. La pagina carga sin error.
2. Lo cargado en el modulo se refleja en el MonthlyRecord del Periodo.
3. El Dashboard/History muestran ese dato consolidado, no una lista suelta.
4. No hay punto de doble carga del mismo dato.
5. Los numeros cuadran al centavo entre KPI, tabla y consolidado.
