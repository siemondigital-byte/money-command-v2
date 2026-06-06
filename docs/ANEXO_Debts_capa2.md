# ANEXO MODULO 4: Debts (Deudas), CAPA 2

> Complementa ARQUITECTURA.md (la ley) y docs/ANEXO_Debts.md (capa 1, ya construida).
> Esta es la capa 2: estrategias de pago, proyeccion y grafico. Se construye SOBRE
> la capa 1 ya validada (registro, KPIs, saldo auto, consolida debtTotal).
> Si hay conflicto: doctrina del libro > ARQUITECTURA.md > capa 1 > este anexo.
>
> ADVERTENCIA: esta capa es matematica financiera. Los numeros guian decisiones
> reales de la persona. Cada formula va en helpers puros en lib/debts.ts con tests
> vitest exhaustivos. Un calculo mal hecho aca es peor que no tenerlo.

---

## 1. Doctrina (por que existe esta capa)

El metodo ensena que de la deuda hay que SALIR, y salir de forma inteligente.
Las estrategias de pago son el COMO: en que orden pagar las deudas para liberarse
mas rapido o pagar menos intereses. Pagar deuda libera capital y ordena las
finanzas hacia la libertad (todo pago va a canasta Libertad, capa 1 seccion 2).

Esta capa convierte el modulo de un registro pasivo en una herramienta de
liberacion: le muestra a la persona un plan concreto para salir de deudas.

Lenguaje: "liberarte", "salir de la deuda", "plan de liberacion". Empoderamiento,
nunca culpa. Tuteo neutro, sin voseo, sin em-dash.

---

## 2. Concepto de las dos estrategias

Se asume un "presupuesto de pago total" = suma de los pagos mensuales reales de
todas las deudas (lo que la persona ya destina hoy a pagar deudas). Ambas
estrategias usan ese mismo monto total, solo cambia EL ORDEN en que se atacan las
deudas. El metodo del "rollover": cuando una deuda se salda, su pago se suma al de
la siguiente deuda objetivo (bola de nieve de pagos), acelerando todo.

- **Avalancha**: ataca primero la deuda de MAYOR APR (tasa). Matematicamente
  optima: paga menos intereses en total. Recomendada por defecto.
- **Bola de Nieve**: ataca primero la deuda de MENOR saldo. Da victorias rapidas
  (saldar deudas chicas pronto), mejor psicologicamente para mantener el habito.

Para cada estrategia se calcula: cuantos meses hasta quedar libre de deudas, el
interes total pagado en el camino, y cual deuda se ataca primero.

La app muestra ambas lado a lado, marca Avalancha como "Recomendada" (ahorra mas),
y dice cuanto ahorra una vs la otra en intereses. La persona elige con criterio.

---

## 3. Matematica (helpers puros en lib/debts.ts, con tests)

Reusar las primitivas de capa 1 (monthlyInterest, nextBalance). Agregar:

### simulatePayoff(debts, strategy) -> { months, totalInterest, order, schedule }
Simula el pago mes a mes hasta saldar todas las deudas:
1. Ordenar deudas segun la estrategia:
   - avalanche: por APR descendente (mayor tasa primero).
   - snowball: por balance ascendente (menor saldo primero).
2. Presupuesto mensual total = suma de currentPayment de todas las deudas activas.
3. Cada mes:
   - A cada deuda se le aplica su interes mensual (balance x apr/100/12).
   - Se paga el minimo de cada deuda.
   - El sobrante del presupuesto (total menos suma de minimos) va integro a la
     deuda objetivo (la primera del orden que aun tenga saldo).
   - Cuando una deuda llega a 0, su pago se libera y engrosa el ataque a la
     siguiente (rollover).
   - Acumular el interes pagado ese mes en totalInterest.
4. Repetir hasta que todos los balances sean 0. Contar los meses.
5. Tope de seguridad: si supera, por ejemplo, 600 meses (50 anos), cortar y marcar
   "no converge" (caso: los minimos no cubren ni el interes, deuda que crece). Ese
   borde hay que manejarlo, no colgar el calculo.

Devuelve: months (cuantos hasta libre), totalInterest, order (lista de deudas en
el orden de ataque), y schedule (saldo total mes a mes, para el grafico).

### compareStrategies(debts) -> { avalanche, snowball, interestSaved, recommended }
Corre simulatePayoff con ambas, compara totalInterest, calcula cuanto ahorra la
avalancha vs la bola de nieve (normalmente la avalancha ahorra intereses pero
tarda mas o igual; la bola de nieve puede ser mas rapida en saldar la primera).
recommended = avalanche por defecto (menor interes), salvo empate.

### Bordes a testear (obligatorio en lib/debts.test.ts):
- Una sola deuda (ambas estrategias dan igual).
- Sin deudas (todo en 0, no divide por cero, no cuelga).
- Deuda donde el pago no cubre el interes (no converge, se corta con el tope).
- Dos deudas, verificar el rollover (cuando una se salda, su pago acelera la otra).
- APR 0% (deuda sin interes, se paga linealmente).
- Verificar que el presupuesto total es el mismo en ambas estrategias (solo cambia
  el orden), y que totalInterest de avalancha <= snowball en casos normales.

---

## 4. UI (sobre la pagina /debts existente, debajo de la tabla)

### Bloque "Estrategia de pago: cual te conviene?"
Dos tarjetas lado a lado:
- **Avalancha** (con badge "Recomendada"): descripcion corta ("Paga primero la
  deuda con mayor interes. Ahorra mas a largo plazo."), libre de deudas en X meses,
  interes total, y "Empieza por: [nombre de la deuda]".
- **Bola de Nieve**: descripcion ("Paga primero la deuda mas pequena. Mas victorias
  rapidas."), libre de deudas en X meses, interes total, empieza por.
- Debajo, una linea: "La estrategia Avalancha te ahorra $X en intereses vs Bola de
  Nieve." (o el texto que corresponda segun el calculo).

### Bloque "Proyeccion de reduccion de deuda"
Grafico de area/linea que muestra como baja el saldo total mes a mes hasta 0, usando
el schedule de la estrategia recomendada (o un toggle para ver ambas). Eje X: meses
(Hoy, M9, M18...). Eje Y: saldo total. Mismo estilo de grafico que ya se usa en la
app (el del donut / charts existentes), tema dark, colores de marca.

Si no hay deudas, ambos bloques muestran un estado vacio amable ("Cuando registres
deudas, aca veras tu plan para liberarte"), sin romper.

---

## 5. KPI que se completa en capa 2

En la fila de KPIs de capa 1 quedo pendiente "Libre de Deudas" (fecha / meses).
Ahora se completa: usa el `months` de la estrategia recomendada para mostrar en
cuantos meses (y/o en que ano) la persona queda libre de deudas. Subtitulo tipo
"en ~X meses".

---

## 6. Guardrails tecnicos

- TODA la matematica en lib/debts.ts (puro), con tests vitest exhaustivos (los
  bordes de seccion 3 son obligatorios). Esta es la regla mas importante de esta
  capa: sin tests de los bordes, no se commitea.
- Nada Server -> Client: el grafico recibe datos serializados (arrays de numeros),
  no funciones. formatMoney en lib.
- El grafico reusa el patron de charts ya existente en la app (no meter libreria
  nueva si ya hay una; usar la que ya se uso para el donut).
- 2 decimales en montos, meses como enteros, tema dark.
- NO toca el schema (la capa 2 es solo calculo + UI sobre los datos de capa 1).
  Si por algo se cree necesario tocar schema, frenar y consultar primero.
- NO recalcula ni rompe la consolidacion de capa 1 (debtTotal sigue igual).
- Tuteo, sin em-dash.
- Type-check + vitest + commit + PARA.

---

## 7. Protocolo de validacion (cuenta limpia)

1. Con 0 deudas: los bloques de estrategia y grafico muestran estado vacio, no
   rompen.
2. Cargar 2-3 deudas con distintos APR y saldos (ej: una tarjeta de APR alto y
   saldo chico, un prestamo de APR bajo y saldo grande).
3. Avalancha: confirmar que "empieza por" es la deuda de mayor APR.
4. Bola de Nieve: confirmar que "empieza por" es la deuda de menor saldo.
5. El interes total de Avalancha debe ser <= el de Bola de Nieve (en casos
   normales), y el texto de "ahorra $X" debe cuadrar con la resta.
6. El KPI "Libre de Deudas" muestra los meses de la estrategia recomendada.
7. El grafico baja de forma coherente hasta 0 en el mes que dice la estrategia.
8. Editar una deuda (cambiar saldo o pago) recalcula las estrategias y el grafico.
9. Caso borde: una deuda cuyo pago no cubre el interes, la app no se cuelga (muestra
   "no converge" o similar, no un calculo infinito).
