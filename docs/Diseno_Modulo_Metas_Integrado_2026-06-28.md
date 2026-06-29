# Rediseño del módulo de Metas — Documento de diseño
## The Money Command · base para implementación por etapas

> Este documento define cómo va a funcionar el módulo de Metas integrado con el resto de la app. Es la base de diseño que se traduce después en prompts de Code por etapas. No es código; es la decisión de producto y la lógica, acordada con Andrea.

---

## 1. Principio rector (la doctrina detrás del módulo)

El módulo de Metas es la herramienta del método para combatir la compra por impulso y el uso de tarjeta a cuotas. La doctrina es explícita:

- No comprar por impulso. Ante algo que se quiere pero no se necesita, esperar 30 días; si después de ese tiempo sigue teniendo sentido, recién ahí se planifica.
- No usar tarjeta a cuotas. En lugar de pagar en cuotas con interés, la persona se "autoimpone" cuotas de ahorro y compra cuando tiene el dinero.
- Toda compra que no sea estrictamente necesaria se planifica: se decide para cuándo, y se ve si alcanza de un solo pago o si hay que ir juntando mes a mes.

En el método de The Money Command, además, las inversiones no se tocan hasta llegar al Número de Libertad Financiera. Por eso una meta NO sale de las inversiones. Una meta es un objetivo de gasto planificado que sale de las canastas de gasto corriente: Esenciales o Estilo (la canasta la define la persona según lo que el objeto significa en su vida: una computadora de trabajo puede ser Esenciales, una tablet para el hijo es Estilo).

El dinero que se destina a una meta es PARTE del gasto de su canasta, no dinero nuevo. Esto significa, y es la regla de oro del módulo:

**Una meta NUNCA suma ni resta a los totales financieros de la app. Es una etiqueta sobre dinero que ya está contado en su canasta. Cero doble conteo.**

La app no inventa dinero ni lo mueve: ayuda a la persona a decidir, con su presupuesto real enfrente, si puede comprar algo de una vez o si tiene que juntar mes a mes, y a hacer el seguimiento de ese plan.

## 1.d. Dos tipos de meta (elegidos al crear)

Cada meta es de UN tipo, que la persona elige al crearla. Nunca ambos sobre la misma meta (eso evita doble conteo).

**Tipo "ahorro programado" (automática):**
- La meta genera un gasto real en su canasta cada mes, por el monto de la cuota definida.
- Ese gasto cuenta en la canasta (Esenciales/Estilo) como cualquier otro gasto: ocupa lugar en el presupuesto de esa canasta, suma a la consolidación como gasto real.
- A la vez, ese mismo gasto es el aporte a la meta (queda vinculado a ella vía goalId).
- Un solo movimiento de dinero: contado una vez como gasto, que además avanza la meta. Cero doble conteo.
- Para ahorro disciplinado y constante ("aparto US$ 300/mes para el viaje, siempre").

**Tipo "compra etiquetada" (manual):**
- La persona vincula gastos reales a la meta cuando ocurren (al cargar un gasto, lo marca como "va a esta meta").
- El progreso es la suma de esos gastos marcados.
- Para ahorro irregular ("cuando puedo, le meto al cambio de teléfono").

Ambos tipos:
- El dinero sale de la canasta de gasto (Esenciales/Estilo), nunca de inversiones.
- El gasto se cuenta una sola vez (en su canasta); la meta solo lo re-lee para el progreso.
- Cero efecto neto sobre los totales más allá del gasto que ya existe.

Diferencia clave de construcción: el tipo "automática" CREA un gasto cada mes (la meta es la fuente del gasto); el tipo "etiquetada" VINCULA gastos que la persona ya carga por su cuenta. El campo goalId de la Etapa 1 sirve para los dos (en automática, el gasto generado lleva el goalId; en etiquetada, la persona se lo asigna).

## 1.c. La herramienta debe confrontar con el presupuesto real

El valor diferencial del módulo: no es una lista de deseos, es un planificador que enfrenta a la persona con su presupuesto. Al crear o revisar una meta, la app debe mostrar:

- Cuánto representa la cuota mensual necesaria respecto a lo que la persona HOY gasta en esa canasta.
- Si su canasta tiene espacio para esa cuota, o si está tan apretada que va a tener que reducir otros gastos de esa canasta para lograr la meta.
- Un mensaje honesto del tipo: "Para juntar tu objetivo en 6 meses necesitás apartar US$ 200/mes. Hoy gastás US$ 820 en Estilo, así que tenés espacio." O bien: "Necesitarías apartar US$ 600/mes, el 73% de tu Estilo actual. Vas a tener que recortar otros gastos de esa canasta o estirar el plazo."

---

## 2. Qué es una meta en el modelo nuevo

Una meta se define con:
- **Nombre** (ej. "Viaje a Japón")
- **Monto objetivo** (ej. US$ 3.000)
- **Canasta de origen** (Esenciales o Estilo) — ya existe hoy
- **Plazo deseado** (ej. 10 meses, o una fecha objetivo) — referencia, no rígido

Y la app trabaja con dos capas sobre eso:

### Capa A — Cuota objetivo sugerida (planificación)
La app calcula y muestra, como referencia:
- **Cuota mensual sugerida** = monto objetivo ÷ meses del plazo. Ej. 3.000 ÷ 10 = US$ 300/mes.
- **Qué % de la canasta representa esa cuota**, para que la persona vea si es realista. Ej. US$ 300 sobre un gasto de Estilo de US$ 820 = 37% de tu Estilo.
- Un mensaje claro tipo: "Para lograr tu viaje de US$ 3.000 en 10 meses, dirigí US$ 300/mes, que es el 37% de tu canasta de Estilo."

Esta capa es orientación: le dice a la persona el costo de su meta en términos de su presupuesto real.

### Capa B — Seguimiento dinámico (realidad)
La meta es dinámica: la persona registra cuánto destinó de verdad cada mes a esa meta. Con eso la app:
- Acumula el progreso real (suma de aportes registrados).
- Recalcula cuánto falta (monto objetivo − acumulado).
- Recalcula el tiempo estimado según el ritmo real (no según el plazo original fijo). Si un mes destinó más, llega antes; si destinó menos, se corre la fecha.

La cuota sugerida (Capa A) sigue mostrándose como referencia, pero la proyección real surge de lo que la persona efectivamente aporta (Capa B). Las dos conviven: "tu objetivo era US$ 300/mes; este mes destinaste US$ 200; a tu ritmo actual llegás en 14 meses en vez de 10".

---

## 3. Cómo se registra el aporte (DECIDIDO: vía gastos reales)

El aporte a una meta se vincula a GASTOS REALES, no se escribe a mano como un saldo suelto. Esto mantiene la coherencia de la app (todo pasa por los gastos reales) y elimina el doble registro.

Funcionamiento:
- Al crear la meta, la persona define su canasta (Esenciales o Estilo) según lo que el objeto significa para su vida.
- Al cargar un gasto, la persona puede indicar que ese gasto va dirigido a una meta. Ese gasto, además de contar en su canasta como siempre, queda etiquetado como aporte a esa meta.
- El progreso de la meta = suma de los gastos reales vinculados a ella.

Esto implica tocar DOS módulos: Metas (para el modelo y la vista) y Gastos (para poder vincular un gasto a una meta). Es la opción más automática y fiel a la realidad, y la más grande de construir. Por eso el plan por etapas la separa con cuidado.

La cuota es "pegajosa": la persona define un aporte/cuota inicial al crear la meta (su plan). Mientras no la modifique, la app asume que la cuota sigue igual y proyecta en base a eso. Si la persona decide destinar más o menos, modifica la cuota y el sistema recalcula tiempo y faltante. No obliga a registrar algo cada mes si el plan no cambió.

Comportamiento según historial:
- **Meta nueva (sin aportes aún):** la app proyecta en base al PLAN (cuota inicial definida). "Si cumplís US$ 300/mes, llegás en 10 meses."
- **Meta con aportes:** la app calcula el RITMO real (promedio de aportes) y muestra plan vs realidad en paralelo. "Planeabas US$ 300/mes; vas a US$ 200/mes; a este ritmo llegás en 15 meses, no en 10."

Siempre se muestran ambas referencias (plan y ritmo real) cuando hay datos, porque ver las dos es lo más honesto y útil: indica si la persona va cumpliendo o desviándose.

---

## 4. Cómo se calcula cada cosa (lógica)

Con las decisiones tomadas, así quedan los cálculos (todos en presentación / lib/goals.ts, sin tocar la consolidación):

- **Cuota mensual necesaria** = monto objetivo ÷ meses hasta la fecha deseada. (Si el plazo es 1 mes, la "cuota" es el monto completo: es el caso "lo compro ya".)
- **% de la canasta (sobre gasto real)** = cuota mensual necesaria ÷ gasto real de esa canasta en el período.
- **Chequeo de viabilidad:** comparar la cuota necesaria contra el gasto/espacio de la canasta. Devolver un estado: holgado (la canasta tiene espacio), ajustado (entra pero aprieta), o inviable sin recortar (la cuota supera lo razonable de la canasta y habría que recortar otros gastos o estirar el plazo).
- **Acumulado real** = suma de los aportes mensuales registrados para la meta.
- **Faltante** = monto objetivo − acumulado real.
- **Progreso %** = acumulado real ÷ monto objetivo.
- **Tiempo estimado dinámico** = faltante ÷ aporte promedio reciente. Recalcula la fecha de logro según el ritmo real de aportes.
- **Estado vs fecha deseada** = comparar el tiempo estimado dinámico con el plazo original: en camino / atrasada / adelantada.

---

## 5. Cómo se conecta con el resto de la app

Como las metas no afectan totales, la "integración" es de visualización y contexto, no de cálculo:

- **En el módulo Metas:** cada meta muestra su cuota sugerida, su % de canasta, su progreso real, su faltante, y su tiempo estimado dinámico. El registro de aportes mensuales vive acá.
- **En el Dashboard (contexto):** se pueden mostrar las metas activas como un bloque informativo (hacia qué objetivos va el dinero), sin alterar ningún KPI ni barra. Por ejemplo, un panel "Tus metas" con el progreso de cada una. Esto es presentación pura.
- **NO se toca:** la consolidación (lib/monthly.ts), el cálculo del patrimonio, las barras del método, el "sin asignar", ni el Número de Libertad. Las metas conviven al lado, no dentro de esos cálculos.

Esto respeta la regla de oro: las metas informan y planifican, no mueven los números financieros.

---

## 6. Qué cambia respecto al módulo actual

| Hoy | Modelo nuevo |
|---|---|
| `currentAmount` se carga a mano como un saldo | Se reemplaza por un registro de aportes mensuales que se acumulan |
| Plazo y cuota fijos | Cuota sugerida de referencia + recálculo dinámico según ritmo real |
| Muestra progreso aislado | Muestra progreso + % de la canasta (conexión con presupuesto real) |
| No aparece fuera de su módulo | Aparece en el Dashboard como contexto (sin afectar totales) |
| Sin registro temporal de aportes | Aportes con fecha, para recalcular ritmo y proyección |

El cambio más grande de construcción: pasar de un `currentAmount` único a un **registro de aportes mensuales** (varios registros con fecha y monto por meta). Eso es lo que habilita el seguimiento dinámico.

---

## 7. Plan de implementación por etapas (para los prompts de Code)

El rediseño NO se hace de un prompt. Se hace por etapas, validando cada una antes de la siguiente, como toda la app:

**Etapa 1 — COMPLETADA:** campo goalId en Expense (vínculo gasto-meta), relación onDelete SetNull, índice. currentAmount deprecado. Migración aplicada.

**Etapa 2 — COMPLETADA:** lógica de cálculo en lib/goals.ts (cuota sugerida, % de canasta, viabilidad 30/60, progreso real, ritmo dinámico que cuenta meses en cero). Con tests.

**Etapa 2.5 — Modelo del tipo de meta (NUEVA, pendiente):** agregar al schema un campo para el tipo de meta (automática / etiquetada). Migración chica, aditiva. Define cómo se comporta cada meta.

**Etapa 3a — Vinculación en Gastos:** en el formulario de Gastos, permitir vincular un gasto a una meta de tipo etiquetada (selector opcional, solo metas de la misma canasta). 

**Etapa 3b — Generación automática:** para metas de tipo automática, generar el gasto mensual de la cuota en su canasta (vinculado a la meta).

**Etapa 3c — Interfaz de Metas:** rediseñar la página de Metas para crear metas (eligiendo tipo), y mostrar cuota sugerida, % de canasta, viabilidad, progreso real, proyección plan vs ritmo.

**Etapa 4 — Conexión con Dashboard:** mostrar las metas como bloque de contexto en el Dashboard, sin afectar KPIs (más allá del gasto real que ya cuenta).

Cada etapa es uno o más prompts de Code, diagnóstico primero donde toque zonas sensibles, validación local antes de pushear.

---

## 8. Decisiones cerradas (todas resueltas)

1. **Enfoque de registro:** Enfoque 2 — vincular gastos reales a la meta. Toca Metas y Gastos. ✓
2. **Base del % de canasta:** sobre el gasto REAL de la canasta en el período. ✓
3. **Canasta de la meta:** la define la persona al crear la meta (Esenciales o Estilo), según el significado del objeto en su vida. ✓
4. **Cuota pegajosa:** la persona define la cuota inicial; se mantiene hasta que la modifique; al modificarla, se recalcula tiempo y faltante. ✓
5. **Meta nueva sin historial:** proyecta en base al plan (cuota inicial); con aportes, calcula el ritmo real y muestra plan vs realidad en paralelo. ✓
6. **Un solo tipo de meta:** mismo mecanismo para "lo compro ya" y "lo junto en X meses". ✓
7. **Las metas no afectan totales:** cero doble conteo; viven al lado de los cálculos, no dentro. ✓

Con esto, el diseño está completo y listo para implementar por etapas (sección 7).
