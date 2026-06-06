# ANEXO MODULO 4: Debts (Deudas), CAPA 1

> Complementa ARQUITECTURA.md (la ley). Spec de CONTENIDO y VISUAL del modulo.
> La arquitectura manda: Debts es "estado actual" (ARQUITECTURA §3, como Investments),
> NO flujo del mes. Consolida debtTotal al MonthlyRecord. Si hay conflicto:
> doctrina del libro > ARQUITECTURA.md > este anexo.
>
> ESTE ANEXO ES SOLO LA CAPA 1. La capa 2 (estrategias Avalancha/Bola de Nieve,
> grafico de proyeccion, "libre de deudas en X meses", interes total proyectado)
> se especifica aparte, despues de validar la capa 1.

---

## 1. Que es Debts

El modulo donde la persona registra sus deudas y creditos, ve el peso total de su
deuda, y la app calcula automaticamente como baja el saldo mes a mes segun el pago
configurado. Es "estado actual": el saldo es lo que se debe HOY, se va actualizando.

---

## 2. Doctrina (NO NEGOCIABLE)

- **Todo pago de deuda cuenta como canasta LIBERTAD.** Pagar una deuda (sea de
  consumo o de inversion) es liberar capital y ordenar las finanzas hacia la
  libertad. (La conexion real con el modulo Expenses/Libertad NO se implementa en
  capa 1; aca solo se documenta el principio.)
- **Distincion consumo vs inversion = etiqueta EDUCATIVA, no estructural.** Cada
  deuda se etiqueta como "consumo" o "inversion" para generar consciencia, pero
  esa etiqueta NO cambia a que canasta va el pago (siempre Libertad). El metodo
  ensena: la deuda de consumo es algo de lo que hay que salir y no repetir; la
  deuda solo se justifica si genera retorno (negocio, activo productivo).
- Lenguaje de UI: "liberar capital", "dirigir el dinero", "salir de la deuda".
  Nunca culpa ni restriccion. Empoderamiento sobre restriccion.
- Tuteo neutro, sin voseo. Sin em-dash (usar coma, dos puntos o parentesis).

---

## 3. Estado actual + calculo automatico (el corazon del modulo)

Debts NO se scopea por periodo (no lleva year/month). El saldo es un snapshot que
se actualiza, igual que Investments (ARQUITECTURA §3).

Comportamiento del saldo:
- La persona registra una deuda: nombre, tipo, saldo inicial, APR, pago minimo,
  pago mensual real, y opcionalmente cuotas restantes.
- La app calcula AUTOMATICAMENTE como baja el saldo mes a mes aplicando el pago
  mensual real y el interes del APR. El saldo "corre solo" hacia adelante.
- Si la persona NO actualiza nada, se asume que sigue pagando igual: el saldo se
  sigue actualizando con el mismo pago configurado.
- Si la persona actualiza algo (nuevo saldo, cambio de pago, abono extra),
  RECALCULA desde ese punto y sigue corriendo automatico con los datos nuevos.

Confirmacion de pago (consciencia, no burocracia):
- Al entrar a un mes nuevo, la app pregunta de forma simple si hizo el pago de sus
  deudas este mes (ej: "Confirmaste tus pagos de deuda de este mes?"). 
- Si confirma: el saldo sigue automatico.
- Si dice que no pago / pago distinto: ajusta y recalcula.
- Esta pregunta es un momento de consciencia (mirar la deuda de frente cada mes),
  alineado con la doctrina. No es un formulario pesado, es una confirmacion ligera.

NOTA DE ALCANCE: el calculo de amortizacion mes a mes (saldo, interes) es la unica
matematica financiera de la capa 1, y solo para el saldo presente/actualizacion.
Las PROYECCIONES a futuro completas (cuantos meses faltan, interes total a pagar,
fecha libre de deudas) son CAPA 2. En capa 1, "meses restantes" se puede mostrar
si la persona lo ingreso manualmente o como estimacion simple desde el pago, pero
sin el motor de proyeccion completo.

---

## 4. Campos de cada deuda (del prototipo)

Formulario "Agregar deuda / credito":
- **Nombre**: texto (ej: "Tarjeta Visa").
- **Tipo**: select (Tarjeta de credito, Prestamo auto, Deuda estudiantil,
  Prestamo personal, Hipoteca, Otro). Tu defines la lista.
- **Saldo**: monto actual que se debe.
- **APR (%)**: tasa anual de la deuda.
- **Pago minimo**: el minimo exigido.
- **Pago mensual real**: lo que la persona efectivamente paga (puede ser mayor al
  minimo). Este es el que mueve el saldo.
- **Cuotas restantes (meses)**: OPCIONAL. Tip de UI: "Si conoces cuantas cuotas te
  quedan, ingresalas. Si no, el sistema lo calcula desde tu pago mensual."
- **Etiqueta consumo/inversion**: para la doctrina (ver seccion 2).

Tabla "Mis deudas y creditos": cada fila muestra nombre, tipo, saldo, APR, pago
minimo, pago (real), meses (restantes), interes total (si esta disponible en capa
1; si no, queda para capa 2), y botones Editar / Borrar.

El formulario sigue el patron ya usado en los otros modulos: oculto tras un boton
"Agregar deuda o credito", se despliega al tocarlo, se cierra al guardar.

---

## 5. KPIs del modulo (fila superior, del prototipo)

- **Deuda Total**: suma de todos los saldos. Con subtitulo "N deudas".
- **Pago Mensual**: suma de los pagos mensuales reales. Subtitulo: que % es de tus
  ingresos (lee incomeTotal del periodo activo). Ej: "de tus ingresos".
- **APR Ponderado**: promedio de los APR pesado por saldo (deudas grandes pesan
  mas). Subtitulo "prom. ponderado".
- **Ratio Deuda/Ingreso**: pago mensual de deuda sobre ingreso mensual, con umbral
  "saludable <36%" (estandar de salud financiera). Verde si esta sano, ambar/rojo
  si no.
- (CAPA 2: "Libre de Deudas" con fecha/meses. NO en capa 1.)

Consciencia consumo/inversion: mostrar de forma visible cuanto del total es deuda
de consumo vs cuanto es de inversion (ej: un desglose o dos numeros). Esto despierta
la consciencia que busca la doctrina: ver cuanta deuda "que va contra la libertad"
se tiene.

Todos los montos a 2 decimales, cuadrando con la tabla.

---

## 6. Consolidacion al MonthlyRecord

El campo `debtTotal` YA existe en el MonthlyRecord (fundacion). Debts escribe la
deuda total actual al MonthlyRecord del periodo activo, via los helpers de
lib/monthly.ts (consolidatePeriodFromLiveEntities ya consolida; agregar la lectura
de debts ahi, igual que se hizo con investments para portfolioValue).

Como Debts es estado actual (no flujo del mes), el debtTotal se snapshotea al
periodo activo, igual que portfolioValue desde Investments. No se scopea por mes.

NO cargar la deuda en dos lugares. El Dashboard y el Historial leen debtTotal del
MonthlyRecord.

---

## 7. Referencia visual (del prototipo, adaptada)

- KPIs en fila arriba (5 en el prototipo; en capa 1 son 4, sin "Libre de Deudas").
- Tabla "Mis deudas y creditos" con las columnas de seccion 4.
- Formulario "Agregar deuda / credito" tras boton, con los campos de seccion 4.
- Adaptaciones: tema dark de la app (negro, verde neon, no la paleta del
  prototipo), canastas/doctrina del metodo, montos a 2 decimales, consolidacion al
  MonthlyRecord.
- (CAPA 2: bloque "Estrategia de pago" Avalancha vs Bola de Nieve, y "Proyeccion
  de reduccion de deuda" con grafico. NO en capa 1.)

---

## 8. Guardrails tecnicos

- Debts es estado actual: NO year/month (a diferencia de Income/Expenses).
- El campo debtTotal del MonthlyRecord ya existe: solo conectar la consolidacion.
- Nada de funciones Server -> Client (formatMoney en lib, import directo).
- prisma generate si se toca schema (el modelo Debt probablemente necesita campos
  nuevos: APR, pago minimo, pago real, tipo, etiqueta consumo/inversion, cuotas).
- Si la migracion toca una tabla con datos, backfill no destructivo (nullable,
  estampar, NOT NULL), mismo patron que Income/Expenses.
- El calculo de amortizacion (saldo mes a mes) en helpers puros en lib/ con sus
  tests vitest (es matematica, hay que testearla aunque sea la version simple).
- Montos a 2 decimales consistentes (KPI = tabla = consolidado).
- Tema dark. Tuteo, sin em-dash.
- Antes de tocar schema, mostrar el plan. Cuenta limpia para validar.
- Type-check + vitest + commit + PARA. NO construir capa 2 (estrategias, grafico,
  proyecciones) en esta tanda.

---

## 9. Protocolo de validacion (cuenta limpia)

1. /debts carga sin error.
2. Agregar una deuda (nombre, tipo, saldo, APR, pago minimo, pago real, etiqueta
  consumo/inversion). Aparece en la tabla.
3. Los KPIs cuadran: Deuda Total = suma de saldos; Pago Mensual = suma de pagos
  reales y su % sobre ingresos; APR Ponderado correcto; Ratio Deuda/Ingreso con
  umbral.
4. La distincion consumo vs inversion se ve (cuanto es de cada tipo).
5. El saldo se actualiza al registrar un pago / editar la deuda, y recalcula.
6. La confirmacion de pago al entrar a un mes nuevo funciona (pregunta, y segun la
  respuesta sigue automatico o ajusta).
7. debtTotal aparece consolidado en el MonthlyRecord (visible en Historial: la
  columna de deuda/patrimonio refleja el total).
8. Numeros al centavo entre KPI, tabla y MonthlyRecord.
