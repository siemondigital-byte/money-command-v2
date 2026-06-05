# THE MONEY COMMAND v2
## Adición al SPEC — Tres elementos nuevos derivados de v30 del libro

> Documento complementario a la especificación v2 confirmada. Agrega:
> 1. **Termostato Financiero** como bloque medible en el Dashboard.
> 2. **Brújula del usuario** como campo de Settings que se proyecta al header global de la app.
> 3. **Simulador (What-If)** dentro de la Calculadora de Libertad para modelar escenarios.
>
> Esta adición resuelve una promesa explícita del libro v30: *"The Money Command App calcula este múltiplo por ti y guarda tu termostato para que veas cómo evoluciona con el tiempo"*.

---

# 1 · TERMOSTATO FINANCIERO

## Por qué entra en v2

El libro v30 promete dos cosas concretas que la app debe cumplir: 1) calcular el múltiplo termostato (meta de ingreso ÷ ingreso actual) automáticamente, y 2) guardar la evolución del termostato a lo largo del tiempo. Sin esto, el libro estaría prometiendo funcionalidad que la app no entrega.

## Dónde vive

**Ubicación primaria**: Dashboard, dentro del Bloque 2 (Situación Financiera + Triángulo), como cuarta tarjeta.

**Ubicación secundaria**: Settings, donde el usuario edita la meta de ingreso a 2 años (entrada manual).

## Datos que la app necesita

| Campo | Fuente | Cómo se obtiene |
|---|---|---|
| Termostato actual | Calculado | Promedio de ingreso neto mensual de los últimos 12 meses, leído de History |
| Termostato meta a 2 años | Manual (Settings) | El usuario lo ingresa, lo puede editar cuando quiera |
| Multiplicador | Calculado | Meta ÷ Actual |
| Mes pico (referencia) | Calculado | Mes con mayor ingreso registrado |
| Histórico del termostato | Calculado | Una serie temporal: para cada mes, el promedio móvil de 12 meses anteriores |

Si hay menos de 12 meses cargados en History, la app usa el promedio de los meses disponibles y lo etiqueta como "termostato parcial (X meses cargados)".

## KPIs y visualización en el Dashboard

**KPIs en la tarjeta** (3 valores):
- Termostato actual: cifra mensual con moneda configurada.
- Termostato meta: cifra mensual con moneda configurada.
- Multiplicador: número con 1 decimal, ej. "2,3x".

**Visualización**:
- Una barra horizontal de progreso que muestra el termostato actual como punto y la meta como destino. La distancia entre los dos es el "trabajo pendiente".
- Etiqueta de zona según el multiplicador:
  - **<2x**: zona "Sistema técnico alcanza" (texto en accent positivo).
  - **2x-5x**: zona "Mentalidad en paralelo" (texto en color neutro).
  - **>5x**: zona "Mentalidad como punto de partida" (texto en gold/warning).

**Gráfico de evolución** (al expandir la tarjeta):
- Una línea que muestra cómo evolucionó el termostato actual mes a mes (promedio móvil de 12 meses).
- Una línea de referencia horizontal con el termostato meta.
- Permite ver visualmente si el termostato está subiendo, estancado o bajando.

## Mensaje del Coach asociado

Cuando el usuario abre la tarjeta del termostato por primera vez en el mes, el Coach muestra el chip CHIP-26 personalizado con sus cifras.

## Lógica de actualización

- El termostato actual se recalcula cada vez que el usuario registra un mes nuevo en History.
- Si el usuario edita un mes pasado en History, el termostato se recalcula con los nuevos datos.
- El termostato meta NO se recalcula automáticamente; solo cambia si el usuario lo edita en Settings.
- Al recalcular, si el multiplicador cruza un umbral (de >5x a 2-5x, o de 2-5x a <2x), se dispara el logro `[13]` Termostato +1.

---

# 2 · BRÚJULA DEL USUARIO

## Por qué entra en v2

El libro v30 cierra con cinco decisiones que separan a quien lee el libro de quien lo vive. La primera es **definir el propósito**. La frase brújula que pediste agregar es la herramienta concreta para que el usuario tenga ese propósito visible todos los días. No es decoración: es el filtro que el libro propone para evaluar cada decisión financiera.

## Dónde vive

**Settings** (entrada y edición):
- Sección "Mi brújula" con tres campos de texto editables:
  - Campo 1: "Estoy construyendo este patrimonio para poder ___"
  - Campo 2: "para el año ___"
  - Campo 3: "porque quiero contribuir ___"
- Botón "Guardar" persiste los tres campos en el perfil del usuario.

**Header global de la app** (visualización constante):
- Una vez que el usuario completó al menos los tres campos, la frase armada aparece como subtítulo o pie del header en TODAS las pantallas de la app.
- Estructura mostrada: *"Construyo este patrimonio para [campo 1], para [campo 2], porque quiero contribuir [campo 3]."*
- Tipografía sutil, sin competir con la navegación principal: peso ligero, tamaño pequeño, color `--muted` con leve transparencia.
- Si en algún momento un campo queda vacío, el header muestra un placeholder accionable: "Definí tu brújula" con link a Settings.

## Datos que la app necesita

| Campo | Tipo | Validación |
|---|---|---|
| `compass_what` | Texto | Mínimo 3 caracteres, máximo 80 |
| `compass_year` | Año (número) | Entre el año actual y +50 años |
| `compass_contribution` | Texto | Mínimo 3 caracteres, máximo 80 |

## Comportamiento adicional

- Cuando el usuario edita o completa por primera vez la brújula, el Coach muestra el chip relacionado (C36 expandido).
- Si el usuario no ha completado la brújula después de 14 días desde el registro, el Coach lo recuerda con una sugerencia suave: "Te ayudaría definir tu brújula. Lleva 2 minutos y aparece en cada pantalla como recordatorio diario."
- Cuando un año marcado en `compass_year` se acerca (a menos de 12 meses), el header se acompaña de un pequeño indicador visual: "Tu meta está a [X] meses". Esto crea presión emocional positiva.

## Consideraciones de diseño (atendiendo a tu nota sobre tipografía grande)

Andrea, ya viste que en el HTML que pasaste los títulos con Syne quedan grandes. Para la brújula en el header tenemos que **resistir esa tentación**: la brújula NO es un título, es un susurro persistente. Recomendación específica:
- Tamaño: 11-13px en desktop, 10-11px en mobile.
- Peso: 300-400 (DM Mono regular o equivalente sans serif liviano).
- Color: `--muted` con opacity 0.7.
- Ubicación: pie del header, debajo del logo y la navegación. No al lado del título.

Si por el contrario querés que sea más visible, se puede tratar como una "barra de propósito" sobre el header (una franja delgada de 24-32px de alto que recorre el ancho de la pantalla) pero eso compromete espacio vertical en cada pantalla. Yo recomiendo el susurro liviano.

---

# 3 · SIMULADOR (la versión correcta de la "sección What-If")

## Por qué entra en v2

En el chip CHIP-13 anterior mencioné una "calculadora What-If" que NUNCA habíamos especificado. Fue un error mío: te lo aviso para que no quede flotando. El libro v30 sí habla de "mover variables y ver cómo se acorta el camino", y eso es exactamente lo que el Simulador hace. Lo que hago acá es definirlo formalmente como sub-bloque de la Freedom Calculator, no como módulo aparte.

## Dónde vive

**Calculadora de Libertad Financiera**, como quinto tab (después de los 4 ya confirmados):
- Tab 1: Tu Número
- Tab 2: Proyección
- Tab 3: Sensibilidad
- Tab 4: Escenarios
- **Tab 5: Simulador (nuevo)**

## Qué hace

El Simulador parte de los datos reales del usuario y le permite mover sliders en tiempo real para ver cómo cambia su línea de tiempo a la libertad. Es el corazón de la propuesta "manifestar es estructura, no decreto".

## Variables que el usuario puede mover

Sliders en pantalla, con valor inicial = el dato real del usuario:

| Variable | Mínimo | Máximo | Paso | Default |
|---|---|---|---|---|
| Aporte mensual | 0 | Ingreso mensual × 1,5 | 50 | Valor actual |
| Retorno ponderado anual | 1% | 15% | 0,5% | Valor actual del portafolio |
| Reducción de Deseos | 0% | 50% | 5% | 0% |
| Aumento de ingreso simulado | 0% | 100% | 5% | 0% |
| Capital inicial extra (un solo aporte) | 0 | Sin límite | 1.000 | 0 |

## Qué se actualiza en pantalla en tiempo real

A medida que el usuario mueve los sliders, se recalculan y actualizan inmediatamente:

- Años a libertad (KPI principal, grande).
- Patrimonio proyectado en el año meta original.
- Renta pasiva mensual estimada en libertad.
- Diferencia vs el escenario base (en años ahorrados o agregados).

Visualmente:
- Una gráfica de área que muestra la curva de patrimonio en el tiempo, con dos líneas superpuestas: el escenario actual (línea sólida) y el escenario simulado (línea con estilo diferenciado).
- La intersección con el Número de Libertad se marca con un punto.
- Si la línea simulada no cruza el Número en menos de 50 años, se muestra un mensaje de alerta y se sugiere qué slider mover para acortar.

## Botones de acción

- **Reset**: vuelve todos los sliders a los valores reales del usuario.
- **Guardar como escenario**: persiste la configuración actual con un nombre que el usuario pone (ej. "Si reduzco Deseos 20%"). Estos escenarios guardados se ven en el Tab 4 (Escenarios) y permiten comparar.
- **Aplicar a mi plan**: actualiza el aporte mensual real del usuario al valor del slider. Esto es opcional: el usuario puede simular sin aplicar.

## Tarjeta "Tu próximo paso personalizado"

Junto al Simulador, una tarjeta sugiere automáticamente qué slider mover según las reglas que confirmaste:

- "Cancelá 1 suscripción y ahorrás [X]/mes → eso acorta tu libertad [Y] años."
- "Si reducís tus gastos hormiga un 50%, son [X]/mes adicionales a inversión → [Y] años antes."
- "Si buscás reducir tu Número de Libertad para llegar en [N] años, necesitás recortar tu gasto deseado a [X]/mes."
- "Si querés aumentar tu estilo de vida un [X]%, tu Número crece a [Y] y agrega [Z] años."

---

# 4 · DECISIÓN PENDIENTE — PALETA VISUAL

Andrea, este punto requiere tu decisión antes de cerrar.

El HTML que me pasaste de la calculadora de interés compuesto usa una paleta DARK con accents neón (verde #7fffb2, azul cian #4dd9ff, dorado #ffd166) y tipografías Syne (titulares) + DM Mono (cuerpo).

En tu memoria de marca tenemos otro sistema definido: navy deep #0F0F1E + champagne gold #C9A84C + warm cream #F2F1EE + Cormorant.

**Mi recomendación honesta** (es opinión, vos decidís):

Las dos paletas pueden coexistir si las separás por contexto:
- **App (The Money Command App)**: paleta dark del HTML, accent verde y dorado. Calculadora moderna, técnica, "modo trabajo".
- **Brand público (libro, sales page, emails, redes)**: paleta navy/champagne/cream, Cormorant. Editorial, premium, "modo confianza".

La razón es práctica: una app financiera con fondo claro y tipografía serif clásica se ve como un PDF interactivo, no como una herramienta. Y una sales page con fondo negro neón se ve como un proyecto cripto, no como un libro de finanzas serio. Cada paleta tiene su contexto.

**Si confirmás esta separación**, todos los entregables visuales de la app que generemos a partir de ahora van a usar la paleta dark/neón, y los entregables editoriales (libro, sales, emails) van a usar navy/champagne. Si preferís unificar las dos (todo en navy/champagne o todo en dark/neón), avisame y ajusto.

Sobre la observación de los títulos grandes: tenés razón, Syne 4rem es demasiado para una app. Mi propuesta para la app:
- H1 (solo en headers de módulo): Syne 800, 1,5-2rem máximo.
- H2 (secciones dentro de módulos): Syne 700, 1,1-1,3rem.
- KPIs grandes: Syne 700, 1,8-2,2rem (esos sí pueden ser grandes porque son CIFRAS, no títulos).
- Body: DM Mono o sans serif liviano, 13-14px.

---

# 5 · RESUMEN DE CAMBIOS RESPECTO A SPEC ANTERIOR

| Elemento | Estado anterior | Estado nuevo |
|---|---|---|
| Termostato financiero | No existía | Bloque medible en Dashboard + edición de meta en Settings |
| Brújula del usuario | No existía | Campo en Settings + visualización en header global |
| "Sección What-If" | Mencionada en CHIP-13 como referencia vaga | Formalizada como Tab 5 (Simulador) de la Calculadora de Libertad |
| Logros con emojis | 🎉🛡️💪🚀🏆💰💵🎯 | Códigos tipográficos `[01]`-`[14]` sin emojis |
| Conceptos del Coach | 50 conceptos | 53 conceptos (agregados C51, C52, C53) |
| Chips del Coach | 25 chips | 28 chips (agregados CHIP-26, CHIP-27, CHIP-28) |
| Chip-03, 07, 11, 13 | Texto sin cálculos concretos | Texto con cálculos personalizados al usuario |
| Retos de la semana | 15 retos | 16 retos (agregado R15 Las Tres Felicidades, R16 Tiempo de Vida) |
| Recordatorios del día | 30 frases | 35 frases (agregadas 27-31 sobre verdadera riqueza, felicidad, dinero como tiempo, dinero respeto, circulación) |
| Paleta visual | Sin definir para app | Pendiente decisión: separación app dark / brand navy |

---

*Adición al SPEC v2 de The Money Command. Basado en manuscrito v30 del libro y en las decisiones de las sesiones anteriores. Sustituye a las referencias a "What-If" del COACH v2.*
