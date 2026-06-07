# ANEXO — Inversiones Capa B (tabla por activo + gráfico 30A + donut)

Guardar en `docs/` del repo money-command-v2. Es la ley de esta tanda: Code lee esto y construye.

## Contexto

La capa A ya está hecha y validada: los 5 KPIs (Portafolio Total, Rendimiento Ponderado, Renta Pasiva Hoy, Proyección 10A, Renta 10A), la tabla de proyección por horizonte (5/10/20A del portafolio), el formulario de un solo campo ("Yield / Rendimiento anual (%)"). Las proyecciones y el Plan B corren sobre `passiveYield`.

La capa B agrega tres piezas de VISUALIZACIÓN (no toca lógica de negocio ni el Plan B):
1. Tabla enriquecida fila-por-activo con proyecciones de cada posición.
2. Gráfico de crecimiento a 30 años, apilado por activo.
3. Donut de distribución del portafolio por activo.

## Doctrina y guardarraíles (no negociable)

- NADA de "base 8%" en ningún lado: ni en KPIs, ni en títulos de sección, ni en la tabla. Cada activo lleva su propia tasa real. El 8% no se muestra como "base" en este módulo (decisión de Andrea: la tasa es subjetiva a cada portafolio).
- Tuteo neutro, sin voseo, sin em-dash (usar coma, dos puntos o paréntesis).
- Tema dark, paleta de la app (negro #0a0a0f, verde neón #7fffb2, cian #4dd9ff, dorado #ffd166), tipografías Syne + DM Mono.
- 2 decimales en montos según la moneda (usar el helper de formato existente, no hardcodear decimales).
- El Plan B (monthlyPlanB, effectivePlanB, consolidatePeriodFromLiveEntities) NO se toca. Esta capa es visualización sobre datos que ya se calculan.

## Pieza 1 — Tabla enriquecida fila-por-activo

Reemplaza/complementa la agrupación por categoría actual con una tabla donde CADA activo es una fila.

Columnas, en este orden:
- Activo (nombre/etiqueta de la posición, con su punto de color de categoría)
- Tipo (la categoría: Renta Variable, Dividendos, Renta Fija, Liquidez, Cripto/Especulativo)
- Valor (capital actual)
- Aporte/mes (monthlyContribution; si es 0 mostrar un guion "—")
- Rendimiento (el passiveYield del activo, en %)
- 5A (valor proyectado del activo a 5 años)
- 10A (valor proyectado del activo a 10 años)
- Renta 10A (renta pasiva mensual proyectada del activo a 10 años)
- 20A (valor proyectado del activo a 20 años)
- Acción (Editar / Borrar)

DECISIÓN DE COLUMNAS (confirmar con Andrea): replicar el prototipo, es decir VALOR a tres horizontes (5A, 10A, 20A) y RENTA a un solo horizonte (10A). Si Andrea pide consistencia, agregar Renta 5A y Renta 20A.

Cálculo por activo: reusar las funciones puras que ya existen en lib/investments.ts (projectedValue, projectedMonthlyPassiveIncome o equivalentes), aplicadas a UNA sola posición por vez. No reimplementar la matemática de interés compuesto. Cada activo se proyecta con SU propia tasa (passiveYield) y su propio aporte.

Mantener el botón "Agregar activo" / "Agregar posición" debajo de la tabla.

## Pieza 2 — Gráfico de crecimiento a 30 años (apilado por activo)

Área apilada (stacked area). Eje X de "Hoy" a 30 años (marcas cada 4 años está bien: Hoy, 4a, 8a... 28a). Eje Y en valor de moneda (formato compacto: $500K, $1.0M, etc.).

Cada activo es una banda de color apilada; la altura total en cada año es el valor proyectado del portafolio completo a ese año. Cada activo crece con su propia tasa y su propio aporte mensual reinvirtiendo (mismo modelo de la proyección de la tabla, pero año a año de 0 a 30).

Leyenda arriba: cada activo con su nombre y su tasa entre paréntesis (ej. "ETF S&P 500 (10.5%)"). Colores consistentes con el punto de color de cada fila en la tabla.

Título de la sección: "Crecimiento por interés compuesto — 30 años" (SIN "base 8%").

Usar la librería de gráficos que ya esté en el proyecto (recharts si ya está instalada; si no, proponer antes de instalar). No instalar paquetes nuevos sin avisar.

## Pieza 3 — Donut de distribución

Donut (dona) que muestra cómo está repartido el portafolio HOY por activo (o por tipo, ver abajo). Cada porción es el % que representa ese activo sobre el portafolio total actual (capital del activo / capital total).

Leyenda arriba con nombre y % de cada porción (ej. "ETF 37% · Acciones 16% · ...").

Centro del donut: el total del portafolio (Portafolio Total).

DECISIÓN (confirmar con Andrea): el prototipo agrupa por tipo abreviado (ETF, Acciones, ETF, Bonos, Fondo). Proponer agrupar por POSICIÓN individual (cada activo su porción) que es más fiel a "tu portafolio", salvo que Andrea prefiera por tipo.

## Lo que NO se toca (riesgo cero)

- monthlyPlanB, effectivePlanB, consolidatePeriodFromLiveEntities: intactos.
- El formulario de un solo campo: intacto (ya quedó bien).
- Los 5 KPIs y la tabla de proyección por horizonte de la capa A: se mantienen (el gráfico y el donut se AGREGAN, no reemplazan los KPIs).
- passiveYield sigue siendo la única tasa.
- lib/formulas.ts: intacto (lo usa Freedom Calculator).

## Tests

- Si se agregan helpers nuevos (ej. serie año-a-año para el gráfico, o reparto del donut), tests puros con bordes: sin posiciones (todo 0, sin div/0), una posición, varias; serie del gráfico monótona creciente por banda; el reparto del donut suma 100% (o 0% si no hay capital).
- No romper los 146 tests existentes.

## Cierre

- Cuenta limpia para validar (email nuevo, no dev-seed), o validar con el seed.
- type-check + vitest, commit aislado de la capa B, y PARAR antes de pushear (Andrea valida primero).
- Commit sugerido: "feat: Inversiones capa B (tabla por activo, grafico 30A apilado, donut distribucion)"
- Validación clave: el Plan B (Renta Pasiva Hoy) sigue dando lo mismo que en Income (prueba de que la visualización no tocó la cadena).
