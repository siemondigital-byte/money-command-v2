# ANEXO — Dashboard REDISENO fiel al diseno (UNA SOLA TANDA)

Guardar en `docs/` del repo money-command-v2. Reemplaza/actualiza el Dashboard ya construido. CRITICO: una sola tanda, sin iteraciones, construir de corrido, priorizar que FUNCIONE y se ACERQUE al diseno.

## Contexto

El Dashboard YA existe y funciona (afirmacion, KPIs, termostato, distribucion en barras, donut, libertad, footer). Esta tanda es REDISENO VISUAL: que se vea igual al diseno prototipado de la carpeta de branding, con ajustes puntuales de contenido. La logica y los calculos ya estan bien (no romperlos): solo cambia como se ve y el orden.

## FUENTE DEL DISENO (leer estos archivos del repo)

En la carpeta de branding del proyecto (the_monney_command_app_brading), Code DEBE leer y usar:
- `design-system-tokens.css`: los tokens reales (colores, tipografias, espaciados). USAR ESTOS, no inventar.
- `design-system.html` y `App Section.html`: muestran como se ve el diseno (las tarjetas con borde de color arriba, numeros enormes, barras con target, etc.). Usar como referencia visual fiel.
- Si hay un `.jsx` (heroes-app.jsx, design-canvas.jsx, tweaks-panel.jsx): pueden tener componentes/estilos reutilizables; mirarlos si ayudan.

Aplicar el sistema de diseno (colores, tipografias, estilo de tarjetas y barras) de esos archivos al Dashboard. El objetivo es que el Dashboard se vea como los mockups del diseno.

## TAMANOS Y PROPORCIONES (CRITICO — leer con atencion)

El diseno prototipado esta SOBREDIMENSIONADO: las tipografias y los elementos son mas grandes de lo apropiado para una app real (estan pensados para verse impactantes en una imagen/mockup, no para una interfaz funcional donde la persona navega y lee datos). COPIAR ESOS TAMANOS LITERALMENTE ARRUINARIA LA USABILIDAD (numeros gigantes que no dejan ver la informacion, scroll excesivo, jerarquia rota).

REGLA: tomar del diseno el ESTILO (colores, tipografias, look de tarjetas/barras, estetica, bordes de color, mono para labels), pero ADAPTAR los TAMANOS y PROPORCIONES a una app real y usable:
- Tipografias en tamanos razonables de UI (los numeros KPI pueden ser destacados pero NO gigantes; un KPI no debe ocupar media pantalla).
- Densidad de informacion apropiada: que la persona vea varias secciones sin scroll infinito.
- Jerarquia visual sensata: destacar lo importante sin que todo sea enorme.
- El Dashboard debe sentirse como una herramienta financiera funcional, no como un poster.
- Ser consciente del viewport real (pantalla de laptop/desktop comun) y que todo entre y se lea bien.

En resumen: la ESTETICA del diseno, con TAMANOS de app real. Si hay conflicto entre "igual al diseno" y "usable", gana usable.

## ORDEN Y LAYOUT (de arriba a abajo)

1. PANEL DEL METODO (como el mockup 01 "ASIGNACION DEL MES"):
   - Tarjetas grandes arriba: Ingreso (verde), Gastado (cian), Invertido (dorado), con numeros enormes y borde de color arriba, estilo del diseno.
   - Las TRES barras de distribucion (Esenciales/Estilo/Libertad) con su target marcado, % y monto, estilo del diseno (barra con marca de target, label a la izquierda, % y monto a la derecha). Movibles para simular, presets 50/30/20, 50/25/25, 50/20/30, 40/20/40. Texto de brecha que se recalcula. Medido contra el target configurado en Settings.

2. TERMOSTATO (vertical, compacto, NO grande) + BLOQUE LIBERTAD FINANCIERA, lado a lado (termostato a la derecha o izquierda del bloque de libertad):
   - TERMOSTATO VERTICAL: mide el total configurado al que se quiere llegar en 2 anos (meta de Settings) vs la temperatura actual (promedio del record de ingresos). Barra/medidor VERTICAL, compacto. Muestra: actual, meta, y que tan "caliente/frio" esta (brecha).
   - BLOQUE LIBERTAD (como el mockup 02 "CALCULADORA DE LIBERTAD"): 
     * Estilo del diseno: el numero grande "TU NUMERO DE LIBERTAD", el bloque oscuro al lado.
     * CONTROL DE INTERES COMPUESTO movible (donde el diseno dice "4% rule / CAGR 7%"): la tasa de rendimiento, editable/movible, default = rendimiento ponderado real (weightedYield) o 8% si no hay portafolio.
     * Las barras "Ingreso mensual" y "Ahorro mensual" del diseno: PRECARGADAS con los datos reales del usuario, movibles para que la persona se proyecte (igual que el diseno, que tiene sliders de ingreso y ahorro). La edad NO va como slider (se lee).
     * DOS BARRAS de avance:
       - Barra 1 (ESTADO ACTUAL): el % de avance hacia el Numero de Libertad calculado segun el estado actual real (portfolioValue / Numero de Libertad). Fija, refleja la realidad.
       - Barra 2 (PROYECCION): se mueve en funcion de lo que la persona ajusta (interes compuesto, ingreso, ahorro). Muestra el % de avance proyectado segun la simulacion.
     * Mostrar: TU NUMERO DE LIBERTAD (gasto real x 12 / tasa), ANOS PARA LLEGAR (se recalculan al mover la tasa/aportes), y la renta pasiva (Plan B).

3. MODULO DE INVERSIONES / PATRIMONIO (como el mockup 03 "COMPOUND / PROGRESO MENSUAL"):
   - QUITAR la dona. En su lugar, el patrimonio como en el diseno: las tarjetas KPI (Balance acumulado, Capital aportado, Interes ganado, estilo del diseno con borde de color) + el grafico de crecimiento estilo barras del diseno (Capital + Interes).
   - Reusar los datos/calculos de Investments que ya existen (no reinventar).

## CAMBIOS DE CONTENIDO

- AFIRMACION: dejar SOLO una frase celebre + un tip. Que cambie AUTOMATICAMENTE cada 10 segundos (setInterval en el client). Pueden quedar los botones o no, pero el cambio automatico cada 10s es lo pedido.
- QUITAR el modulo "Logros y prioridades del mes" por completo.
- QUITAR la dona de capital (reemplazada por el patrimonio estilo diseno, punto 3).
- KPIs y graficas: estilo del diseno (numeros enormes, bordes de color, mono para labels). Medidos contra el target de Settings donde aplique.

## DOCTRINA Y RIESGO CERO (no tocar)

- NO tocar consolidacion, monthlyPlanB, effectivePlanB, schema, ni otros modulos. Los calculos del Dashboard ya hechos se MANTIENEN, solo cambia presentacion y orden.
- Numero de Libertad = gasto x 12 / tasa (tasa ajustable, default ponderado o 8%). Sin divisor fijo. Renta pasiva = Plan B existente.
- NO leer Metas (standby). NO usar numeros reales de la fundadora como placeholder.
- Canastas Esenciales/Estilo/Libertad. Tuteo sin voseo, sin em-dash.
- Degradar con elegancia si faltan datos.

## CIERRE (una sola tanda)

- Leer los archivos de branding ANTES de maquetar, para usar los tokens reales.
- Construir TODO de corrido. Si algo no queda pixel-perfect, dejarlo lo mas cercano posible y funcional, NO frenar.
- type-check + vitest sin romper los existentes (hoy pasan; eran 198). 
- UN commit: "feat: Dashboard redisenado segun sistema de diseno (metodo, termostato vertical + libertad con interes movible y dos barras, patrimonio, sin dona ni logros)".
- Si llega al limite a mitad: dejar lo hecho commiteado y funcional, anotar en CONTEXT.md que falto.
