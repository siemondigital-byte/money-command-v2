# ANEXO — Módulo Dashboard (MVP, UNA SOLA TANDA) — VERSIÓN FINAL

Guardar en `docs/` del repo money-command-v2. Es la ley de esta tanda. CRÍTICO: construir TODO de corrido, sin parar a preguntar, priorizando que FUNCIONE sobre que sea pixel-perfect. La persona tiene uso limitado de Code y no puede iterar. Si algo del diseño no sale idéntico, dejarlo funcional y seguir.

## Objetivo

El Dashboard ESPEJA todo: junta los datos que YA calculan los otros módulos (Income, Expenses, Investments, Debts) y los muestra en una vista integral. NO reinventa cálculos: reusa helpers, gráficos (chart.js ya instalada) y consolidaciones existentes. NO toca la consolidación, el Plan B ni ningún otro módulo. Es lectura y presentación.

NO instalar paquetes nuevos. Reusar lib/formulas.ts, lib/investments.ts, lib/debts.ts, lib/expenses.ts, el MonthlyRecord consolidado, y los campos de Profile/Settings.

## Datos de Settings y del historial que el Dashboard LEE (ya existen)

- Meta de ingreso a 2 años (mensual) [seccion TERMOSTATO]: temperatura deseada del termostato.
- Inflacion anual % [seccion SUPUESTOS]: para ajustar el escenario aspiracional. Usar SIEMPRE el valor configurado, NO un fijo.
- Aumento salarial anual % [seccion SUPUESTOS]: influye en "anos a la libertad" (que tan rapido se llega).
- Gasto mensual deseado en Libertad (opcional) [seccion SUPUESTOS]: alimenta el Numero de Libertad ASPIRACIONAL.
- Metodo preferido (ej. 40/20/40): preset inicial de las barras de distribucion.
- Edad actual / Edad objetivo libertad: anos que faltan = objetivo - actual.
- Historial de ingresos (records de meses registrados): para el PROMEDIO del termostato.
- Historial de gastos (records consolidados): para el gasto de la "vida actual".

Si algun campo esta vacio/null: degradar con elegancia (mensaje amable o guion), NUNCA romper con error 500.

## Doctrina (no negociable)

- NO hay un divisor fijo del Numero de Libertad. El usuario define la tasa de rendimiento; por defecto se carga con el RENDIMIENTO PONDERADO REAL de su portafolio (weightedYield de investments.ts). El Numero de Libertad = gasto mensual x 12 / tasa (la que el usuario ponga, default = su rendimiento ponderado). NO usar 4% ni 8% fijos: son solo ejemplos, no reglas.
- Renta pasiva (Plan B) = monthlyPlanB existente (suma capital x passiveYield / 12). NO recalcular distinto. NUNCA portfolio x 4%.
- Canastas: Esenciales / Estilo / Libertad (interno essentials/style/freedom). Reusar el enum existente.
- Tuteo neutro, sin voseo, sin em-dash. Tema dark, paleta (negro #0a0a0f, verde #7fffb2, cian #4dd9ff, dorado #ffd166), Syne + DM Mono. 2 decimales segun moneda via helper existente.

## Datos de ejemplo / placeholders

Si se usan placeholders/seed, NO usar los numeros reales de la fundadora (meta 50000, gasto deseado 15000): son personales. Usar numeros genericos y MODERADOS del avatar (profesional que gana bien pero vive al dia). Los datos reales de cada usuario se leen de su cuenta.

## Referencia visual (IMPORTANTE)

Seguir el LENGUAJE VISUAL del diseno prototipado: tarjetas grandes con numeros enormes (verde/cian/dorado), barras horizontales con target marcado, bloques con bordes sutiles, fondo oscuro, mono para labels en mayuscula con letter-spacing. NO copiar textos del mockup que no apliquen (ej. "reasignacion automatica", "15 dias al cierre", "founders 042" son del mockup, no obligatorios). Priorizar que se vea limpio y cercano al diseno, sin frenar la tanda por pixel-perfect.

## SECCIONES (de arriba a abajo)

### 1. Afirmacion del dia
Tarjeta con frase celebre sobre dinero/inversion + un tip, y botones "Siguiente" y "Otra cita". Array de ~15-20 citas aspiracionales hardcodeado en el cliente; los botones rotan. Client component, estado local, sin llamadas externas.

### 2. KPIs de situacion financiera (fila de tarjetas)
Del MonthlyRecord del periodo activo, ya consolidado:
- Ingreso Total (Plan A+B+C del mes)
- Gastos Reales del mes
- Tasa de Ahorro (%)
- Patrimonio Neto (activos - deudas)
- Deuda Total (con cantidad de deudas activas)
Numeros grandes, estilo del prototipo de diseno (verde/cian/dorado).

### 3. TERMOSTATO FINANCIERO
Compara la temperatura ACTUAL vs la DESEADA.
- Temperatura actual (FUENTE EXACTA): el PROMEDIO de los ingresos del HISTORIAL (promedio de los meses de ingreso registrados en la app). NO el ingreso de un solo mes.
- Temperatura deseada (FUENTE EXACTA): el campo "Meta de ingreso a 2 anos (mensual)" de la seccion TERMOSTATO de Settings.
- Mostrar: numero actual (promedio), numero meta, brecha en monto y %. Ej: "Hoy (promedio): $X / Meta 2 anos: $Y / Te falta $Z (W%)".
- Visual: medidor/barra tipo termostato (punto actual vs punto de ajuste deseado). Si no hay meta configurada: "Configura tu meta de ingreso en Settings".
- Helper puro en lib/dashboard.ts: thermostat(avgIncome, targetIncome) devuelve { current, target, gap, gapPct }. Tests de borde (target 0/null sin brecha; current >= target meta alcanzada; sin historial degrada).

### 4. Distribucion por canastas (BARRAS movibles + simulacion)
NO donut: BARRAS horizontales, como el prototipo de diseno (cada canasta una barra con su target marcado, el % alcanzado y el monto). Client component.
- TRES barras: Esenciales, Estilo, Libertad. PRECARGADAS con la distribucion REAL del usuario (que % de su ingreso va hoy a cada canasta, de sus gastos+inversion consolidados).
- El usuario MUEVE las barras para simular escenarios. Al mover una, las otras se reajustan a 100% (o muestran el desbalance).
- Botones de preset: 50/30/20, 50/25/25, 50/20/30, 40/20/40. El de Settings (Metodo preferido) es el inicial.
- Para el escenario simulado: monto por canasta (% x ingreso) y texto de brecha que se recalcula al mover: "Hoy destinas X% a Libertad. Para llegar a Y% tendrias que reducir tus gastos en $Z al mes."
- Es SIMULACION/LECTURA: NO cambia gastos reales ni toca consolidacion.
- Helper puro en lib/dashboard.ts: realDistribution(monthlyRecord) devuelve { essentials, style, freedom } en %. Tests.

### 5. Grafico de capital (donut por posicion y por tipo)
Reusar el donut de Inversiones (portfolioShares / PortfolioDonut): capital por posicion (o por tipo). NO recalcular. Este donut SI se mantiene (es el de capital del portafolio, distinto de las barras de canastas del punto 4).

### 6. Libertad Financiera (UNA sola medicion, tasa ajustable)
El Numero de Libertad NO mide cuanto has ahorrado: mide cuanto CAPITAL necesitarias tener invertido para que su retorno pasivo cubra tus GASTOS. Es prospectivo. Una sola medicion basada en la vida actual (lo aspiracional ya lo cubre el TERMOSTATO, no se duplica).

Debe verse como el bloque "calculadora de libertad" del diseno, pero:
- SIN sliders de ingreso, ahorro ni edad. Esos datos se LEEN. El UNICO control editable es la TASA.
- CONTROL DE TASA: en el lugar donde el diseno dice "4% rule / CAGR 7%", un campo editable para la tasa de rendimiento. Default 8% si no hay portafolio, o el rendimiento ponderado real (weightedYield) si hay portafolio. Editable. SIEMPRE se calcula.
- NO mostrar "con el sistema del libro" ni dos barras comparativas (el termostato ya compara actual vs aspiracional). UNA sola medicion.
- Mostrar:
  * TU NUMERO DE LIBERTAD = gasto mensual real (del historial de gastos consolidado) x 12 / tasa. El capital que necesitas invertido para que su retorno cubra tus gastos actuales.
  * ANOS PARA LLEGAR: cuantos anos toma alcanzar ese Numero de Libertad, dado el portafolio actual, el aporte mensual y la tasa (yearsToFreedom, interes compuesto). Al mover la TASA, los anos se recalculan (mas tasa = menos anos). Esta es la variable que la persona ajusta para proyectarse.
  * % DE AVANCE: portfolioValue actual / Numero de Libertad (tope 100%). Una barra de progreso.
  * RENTA PASIVA/MES: el Plan B (monthlyPlanB) actual.
- Helpers puros en lib/dashboard.ts: freedomNumber(monthlyExpense, rate) = monthlyExpense*12/rate; yearsToFreedom(portfolio, monthlyContribution, annualReturn, freedomNum). Tests de borde (gasto 0, tasa 0 evitar div/0, sin aporte no converge null).

### 7. Logros y prioridades del mes
Chips que responden a datos reales: "Ahorro sobre el 30%" (si tasa ahorro > 30%), "Acelera el pago de la tarjeta (X% APR)" (si deuda APR alto), "Detecta N suscripciones a dar de baja" (si hay), "X dias de registro seguidos" (racha, si existe). Si un dato no esta, no mostrar ese chip. Sin inventar datos.

### 8. Footer
"Creado por Siemon Digital - Todos los derechos reservados - https://siemondigital.com/" con link clickeable a https://siemondigital.com/. Discreto, al pie. Incluir en el layout o al menos en el dashboard.

## Lo que NO se toca (riesgo cero)
- monthlyPlanB, effectivePlanB, consolidatePeriodFromLiveEntities, y TODOS los modulos existentes: intactos.
- Metas (Goal): NO se toca (standby; el Dashboard NO lee Metas).
- El Dashboard solo LEE y presenta. No escribe en la base (salvo, si acaso, preferencia de tasa en UI; evitar, usar estado local).

## Archivos (orientativo)
- lib/dashboard.ts (nuevo): thermostat, realDistribution, freedomNumber, freedomNumberInflated, yearsToFreedom, simulacion de distribucion. TODOS con tests.
- lib/dashboard.test.ts (nuevo): bordes de cada helper (cero, null, no converge, div/0 evitada).
- app/(app)/dashboard/page.tsx: server component que carga datos (LEE, no escribe).
- app/(app)/dashboard/*.tsx (client): AffirmationCard, DistributionBars (barras movibles + presets + texto brecha), Thermostat (medidor), FreedomCompare (dos escenarios + control de tasa + dos barras). Solo arrays/strings/numeros cruzan server a client (no funciones).
- Footer.tsx en el layout o el dashboard.
- Reusar PortfolioDonut de investments.

## Cierre (CRITICO para una sola tanda)
- Construir TODAS las secciones de corrido. Si una seccion no sale perfecta, dejarla funcional/simple y seguir, NO frenar.
- Degradar con elegancia si faltan datos (Settings vacio, sin posiciones, sin historial): mensajes amables, nunca error 500.
- type-check + vitest (sin romper los existentes, que hoy pasan limpio). NO tocar schema (el Dashboard no lo necesita).
- UN commit al final: "feat: Dashboard MVP (afirmacion, KPIs, termostato, distribucion en barras simulable, numero de libertad con tasa ajustable, logros, footer)".
- Si Code llega al limite a mitad: dejar lo construido commiteado y funcional, y anotar en CONTEXT.md que secciones quedaron y cuales faltan.
