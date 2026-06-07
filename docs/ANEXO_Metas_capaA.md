# ANEXO — Módulo Metas, Capa A (núcleo funcional)

Guardar en `docs/` del repo money-command-v2. Es la ley de esta tanda: Code lee esto y construye.

## Qué es el módulo Metas

Las metas son los objetivos que la persona quiere alcanzar (fondo de emergencia, viaje, salir de deudas, comprar algo, libertad financiera). Cada meta tiene un monto objetivo, un ahorro actual, un aporte mensual que la persona define, y opcionalmente una fecha límite. El sistema calcula el progreso y, en capas siguientes, el horizonte (cuándo se alcanza, qué tan viable es).

Modelo conceptual: la persona define cuánto destina por mes a cada meta; con ese número el sistema calcula el progreso y el tiempo estimado. El sistema LEE y calcula, no descuenta ni mueve plata. Las metas no tocan el flujo mensual ni la consolidación (eso es lectura/horizonte, capa C, y aun ahí es solo lectura).

## Categorización por canasta (decisión de Andrea, firme)

Cada meta pertenece a UNA sola canasta: Esenciales, Estilo o Libertad (las mismas tres canastas de la app, en inglés essentials/style/freedom). Es la ÚNICA categorización (reemplaza la división financiera/experiencia del prototipo). Una sola canasta por meta para que sea medible.

Guía doctrinal de la canasta (NO se muestra como recomendación automática, es solo referencia para entender el modelo):
- Esenciales: fondo de emergencia, tratamiento médico o de salud, mudarse de casa (necesidades de base).
- Estilo: viaje, comprar una MacBook, mejorar el carro (deseos que mejoran la vida).
- Libertad: pagar deudas, estudiar, invertir (lo que te libera o aumenta tu capacidad).

IMPORTANTE: el sistema NO recomienda ni adivina la canasta. La persona la elige de un desplegable. Decisión explícita de Andrea: no recomendar, no complicar.

## Pieza 1 — Modelo de datos (schema Prisma)

Nuevo modelo Goal (o el nombre que use la convención del repo). Campos:
- id, userId (relación al usuario), createdAt, updatedAt
- name (String) — nombre de la meta
- basket (enum essentials/style/freedom) — la canasta, igual que en Expense
- targetAmount (Decimal 12,2) — monto objetivo
- currentAmount (Decimal 12,2, default 0) — ahorro actual
- monthlyContribution (Decimal 12,2, default 0) — aporte mensual que define la persona
- targetDate (DateTime, nullable) — fecha objetivo (opcional)
- isActive (Boolean, default true) — para borrado lógico, consistente con Investment

Es estado actual (snapshot), NO lleva year/month. Sigue la convención de Investment/Debt (estado actual, no flujo del mes). Migración no destructiva (modelo nuevo, no toca tablas existentes).

## Pieza 2 — Formulario (crear / editar meta)

Campos, siguiendo el patrón de los otros formularios de la app (campos tras botón "Agregar", se cierra al guardar):
- Nombre (texto)
- Canasta (desplegable, NO checkbox): Esenciales / Estilo / Libertad. Una sola opción. Sin recomendación automática.
- Monto objetivo (número, moneda)
- Ahorro actual (número, moneda)
- Aporte mensual (número, moneda) — lo define la persona
- Fecha objetivo (date, opcional) — con ayuda corta: "Pon una fecha para medir si vas atrasado o a tiempo."

Desplegable y no checkbox porque la meta pertenece a una sola canasta (excluyente) y así es medible.

## Pieza 3 — KPIs (arriba, como el prototipo)

- Metas activas (cuántas metas activas hay)
- Progreso promedio (promedio del % de avance de todas las metas)
- Próxima meta (la meta que se alcanza antes, con su tiempo estimado)
- Aporte/mes (suma de todos los aportes mensuales a metas)

## Pieza 4 — Metas agrupadas por canasta

Las metas se muestran en TRES secciones, una por canasta: Esenciales, Estilo, Libertad. Dentro de cada sección, cada meta con:
- Nombre
- Monto objetivo · ahorro actual · aporte mensual (ej. "$24K · $12K · +$300/m")
- % de progreso (currentAmount / targetAmount, tope 100%)
- Barra de progreso
- Si hay fecha objetivo: la fecha y el estado (a tiempo / atrasado, ver cálculo abajo)
- Tiempo estimado para alcanzarla (meses restantes al ritmo de aporte actual)
- Editar / Borrar

Solo mostrar una sección de canasta si tiene al menos una meta (no mostrar secciones vacías).

## Cálculos (helpers puros, con tests)

Nuevo archivo lib/goals.ts. Helpers:
- progress(goal) = currentAmount / targetAmount, clamp [0, 1]. Si targetAmount es 0, devolver 0 (sin div/0).
- monthsToGoal(goal) = ceil((targetAmount - currentAmount) / monthlyContribution). Si ya está completa (current >= target), 0. Si monthlyContribution es 0 y falta plata, no converge: devolver null (o un marcador "sin aporte no se alcanza"). NO dividir por cero.
- estado a tiempo / atrasado: solo si hay targetDate. Comparar la fecha estimada de alcance (hoy + monthsToGoal meses) contra targetDate. Si la estimada <= targetDate, "a tiempo"; si no, "atrasado" y por cuántos meses.
- averageProgress(goals) = promedio de progress de todas. 0 si no hay metas.
- nextGoal(goals) = la meta con menor monthsToGoal (la que se alcanza antes). null si no hay.
- totalMonthlyContribution(goals) = suma de monthlyContribution.

## Tests (lib/goals.test.ts, obligatorios)

Bordes: sin metas (todo 0/null, sin div/0), una meta, varias. progress con target 0 → 0; progress > 100% se clampea a 100%. monthsToGoal: meta completa → 0; sin aporte y falta plata → null (no div/0); caso normal correcto. estado a tiempo vs atrasado con fechas. averageProgress promedia bien. nextGoal devuelve la de menor tiempo. No romper los tests existentes.

## Lo que NO se toca (riesgo cero)

- Income, Expenses, Investments, Debts y sus consolidaciones: intactos. Metas es un módulo nuevo e independiente.
- monthlyPlanB, consolidatePeriodFromLiveEntities: no se tocan. Metas NO entra a la consolidación en esta capa (ni en las siguientes: la capa de horizonte solo LEE).
- El enum de canastas (essentials/style/freedom): reusar el que ya existe en Expense, no crear uno nuevo.

## Doctrina y guardarraíles

- Tuteo neutro, sin voseo, sin em-dash (coma, dos puntos, paréntesis).
- Tema dark, paleta de la app, tipografías Syne + DM Mono.
- 2 decimales según moneda vía el helper de formato existente.
- Canastas en español en la UI: Esenciales / Estilo / Libertad (interno essentials/style/freedom).
- Nada de "base 8%" ni conceptos de otros módulos.

## Fuera de alcance (capas siguientes, NO construir ahora)

- Capa B: gráficos (progreso de todas las metas en barras, reparto por canasta, timeline de cuándo se alcanza cada una).
- Capa C: capa de lectura/horizonte: qué % de tus ingresos y gastos representan tus aportes a metas, qué tan viable es cada meta en el tiempo. SOLO lectura (lee Income/Expenses, no modifica nada).

## Cierre

- Cuenta limpia para validar o seed (agregar unas metas de ejemplo al seed, una por canasta).
- type-check + vitest (sin romper los existentes), commit aislado, y PARAR antes de pushear.
- Commit sugerido: "feat: modulo Metas capa A (categorizacion por canasta, KPIs, progreso, aporte mensual)"
