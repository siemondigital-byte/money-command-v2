# ANEXO MODULO 3: Expenses (Gastos)

> Complementa ARQUITECTURA.md (la ley). Esta es la spec de CONTENIDO y VISUAL del
> modulo. La arquitectura de consolidacion manda: Expenses ESCRIBE al
> MonthlyRecord del periodo activo, no guarda una lista suelta para metricas
> globales. Si hay conflicto: doctrina del libro > ARQUITECTURA.md > este anexo.

---

## 1. Que es Expenses

El modulo donde el usuario registra sus gastos del periodo activo. Absorbe lo que
antes eran dos cosas (gastos y suscripciones) en un solo lugar. Cada gasto se
clasifica en una de las tres canastas del metodo. El total y el desglose por
canasta se consolidan al MonthlyRecord del periodo.

---

## 2. Canastas (NO NEGOCIABLE, alineado con libro/coach/app)

Esenciales / Estilo / Libertad. Claves i18n: `essentials` / `style` / `freedom`.
Nunca Necesidades/Deseos/Inversiones.

- Esenciales: vivienda, comida, servicios, transporte, seguros, salud.
- Estilo: entretenimiento, restaurantes, viajes, ropa, suscripciones, gastos hormiga.
- Libertad: educacion, pago de deuda. (El ahorro/inversion vive en sus modulos;
  aca solo el gasto que cuenta como "Libertad" si el usuario lo registra como tal.)

Cada gasto lleva una etiqueta de canasta. El lenguaje de UI es "elegir mejor",
"ordenar", "dirigir el dinero". Nunca "gastar menos", "recortar", "restringir".

---

## 3. Estructura del modulo (dos vistas + suscripciones absorbidas)

### Tabs:
- **Fijos**: gastos recurrentes (renta, seguro, servicios). Cada fila: nombre,
  categoria, canasta, presupuesto, real pagado. Botones Editar / Borrar.
- **Variables**: gastos que cambian (super, comidas fuera, gym). Misma estructura.
- **Por canasta**: resumen agrupado por Esenciales/Estilo/Libertad (no por
  categoria suelta), con barra de presupuesto vs real por canasta.

### Suscripciones absorbidas:
Dentro de Estilo, las suscripciones tienen tracking separado para alimentar al
Coach (variable GASTOS_HORMIGA_MES). Un sub-bloque o seccion "Suscripciones y
gastos hormiga" con:
- Lista de suscripciones: nombre, costo/mes, categoria. Editar / Borrar.
- Resumen: cuanto representan al MES, al ANO (x12), y potencial de costo
  (proyeccion si se mantienen N anos, para mostrar el peso real).

---

## 4. KPIs del modulo (fila superior)

Del mapeo punto 4:
- **Total Fijos**: suma de gastos fijos del periodo.
- **Total Variables**: suma de gastos variables del periodo.
- **Total Presupuesto**: suma de presupuestos (fijos + variables).
- **Total Real**: suma de lo realmente gastado (fijos + variables). Este es el
  `expensesTotal` que va al MonthlyRecord.

Todos a 2 decimales, cuadrando con la tabla y con el grafico.

---

## 5. Grafico

- **Esenciales vs Estilo vs Libertad**: distribucion del gasto real del periodo
  por canasta (donut o barras). Reemplaza el "necesidades vs deseos" del
  prototipo. Tres canastas, no dos.
- Colores del tema dark de la app (no la paleta del prototipo light).

---

## 6. Consolidacion al MonthlyRecord (lo critico)

Al registrar/guardar gastos del periodo activo, Expenses ESCRIBE al MonthlyRecord
de ese periodo (usando los helpers de lib/monthly.ts: getOrCreateMonthlyRecord,
upsertMonthlyData):
- `expensesTotal` = suma de real (fijos + variables) del periodo.
- `essentials` / `style` / `freedom` = suma de real por canasta.
- Al escribir gastos, el MonthlyRecord recalcula `savingsRate` =
  (incomeTotal - expensesTotal) / incomeTotal. Por eso hoy la tasa de ahorro da
  100% en meses sin gastos: ese es el comportamiento correcto, se completa cuando
  hay gastos cargados.

NO se carga el gasto en dos lugares. NO se lee de una lista suelta para las
metricas globales: el Dashboard y el Historial leen del MonthlyRecord.

---

## 6b. Period-scoping (CRITICO, igual que Income)

Expenses es "flujo del mes" (ARQUITECTURA §3), exactamente como Income. Por eso
DEBE estar scopeado por periodo, siguiendo el mismo patron que ya se aplico a
Income en el commit 621f2b4:

- Cada gasto (fijo o variable) lleva columnas `year` Int + `month` Int, NO una FK
  al MonthlyRecord (misma decision que Income: espeja la convencion de
  MonthlyRecord, evita cascadas, no exige getOrCreate antes de cargar).
- La pagina /expenses lista y guarda SOLO los gastos del periodo activo
  (`period.year` / `period.month`, que ya se computa con activePeriod del Profile).
- La action de crear gasto estampa el periodo activo en la fila nueva (igual que
  createIncomeAction estampa year/month via getActivePeriod).
- `consolidatePeriodFromLiveEntities` en lib/monthly.ts filtra los gastos por
  periodo, asi cada mes consolida solo lo suyo. Un mes nuevo arranca vacio.
- Indice `@@index([userId, year, month])`.

Resultado: cambiar el mes en el selector muestra los gastos de ese mes; cada mes
tiene los suyos; nada se copia entre meses. El selector ya esta sincronizado
(commit del fix de PeriodSelector controlado), Expenses solo tiene que respetarlo.

Si la migracion agrega columnas a una tabla con filas existentes, backfill no
destructivo: agregar nullable, estampar con el periodo activo del Profile (o mes
actual de fallback), recien despues NOT NULL. Mismo patron que la migracion de
Income (20260606170732_income_period_scoped).

---

## 7. Referencia visual (del prototipo, adaptada)

- Tabs Fijos / Variables / Por categoria, ya validados en el prototipo.
- Barra de presupuesto vs real por fila (verde si dentro, ambar cerca del limite,
  rojo si excede).
- Tarjeta de cada suscripcion con costo/mes y total acumulado.
- Adaptaciones: tema dark de la app, canastas en vez de N/D, montos a 2 decimales,
  consolidacion al MonthlyRecord en vez de recalculo en vivo.

---

## 8. Guardrails tecnicos

- Nada de funciones Server -> Client (formatMoney y derivadas en lib, import directo).
- prisma generate si se toca schema.
- Montos a 2 decimales consistentes (KPI = tabla = grafico = consolidado).
- Validar en cuenta limpia, no en dev-seed.
- Type-check + vitest + commit local + PARA al terminar. No construir Debts.

---

## 9. Protocolo de validacion del modulo (cuenta limpia)

1. La pagina /expenses carga sin error en el periodo activo.
2. Cargar un gasto fijo y uno variable, cada uno con su canasta.
3. Confirmar que `expensesTotal` y los totales por canasta aparecen consolidados
   en el MonthlyRecord del periodo (visible en Historial: la columna Gastos del
   mes deja de ser 0 y la Tasa de Ahorro baja de 100% al valor real).
4. Confirmar que las suscripciones suman dentro de Estilo y el resumen mensual/
   anual cuadra.
5. Numeros cuadran al centavo entre KPI, tabla, grafico y MonthlyRecord.
6. Period-scoping: cargar un gasto en el mes activo, cambiar de mes en el selector
   y ver /expenses vacio, cargar otro gasto en el mes nuevo, volver al anterior y
   ver el gasto original intacto sin copiarse. Cada mes con lo suyo.
