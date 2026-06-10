/**
 * Contenido del Coach — "Concepto del día" (50 conceptos).
 *
 * Texto EXACTO de COACH_CONTENIDO_v3 (tuteo neutro), fuente: "El Sistema
 * Infalible de Riqueza" de Andrea Siemon. No es base de datos: el contenido
 * vive acá. Cada concepto: id, título, cápsula (corta, en pantalla) y
 * explicación (larga, se despliega con "Explícamelo más").
 */

export interface CoachConcept {
  id: string;
  titulo: string;
  capsula: string;
  explicacion: string;
}

export const COACH_CONCEPTS: CoachConcept[] = [
  {
    id: "C01",
    titulo: "El termostato financiero",
    capsula: `Tu cerebro tiene un nivel de ingreso al que siempre vuelve. Si está fijado en $2.000, los meses que ganas $4.000 encuentras formas de gastar el exceso. Los meses que ganas $800, encuentras cómo resolver. El primer trabajo del sistema es subir ese termostato para siempre.`,
    explicacion: `La neurociencia confirma lo que los grandes mentores enseñan hace décadas: tienes una zona de confort financiera, un número al que tu vida material siempre regresa. Subir ese termostato no se hace ganando más, porque el viejo termostato encuentra la forma de devolverte al mismo lugar. Se hace reescribiendo lo que crees que mereces ganar, lo que crees que es posible para alguien como tú, y lo que crees que pasará si tienes mucho dinero. Esas creencias son el verdadero termostato.`,
  },
  {
    id: "C02",
    titulo: "La diferencia entre ricos y pobres no es lo que ganan",
    capsula: `Warren Buffett lo dijo claro: "La diferencia entre personas ricas y pobres no es la cantidad de dinero que ganan. Es lo que hacen con el dinero que ganan." No es complicado. No es mágico. Es un sistema.`,
    explicacion: `La mayoría asume que los ricos son más inteligentes o tienen suerte especial. La verdad es más simple: tienen un sistema que maximiza ingresos, minimiza gastos sin privación, automatiza el ahorro, invierte ese ahorro y protege la riqueza acumulada. Cuando tienes un sistema que hace esto sin depender de tu fuerza de voluntad, la riqueza es inevitable. No es cuestión de si — es cuestión de cuándo.`,
  },
  {
    id: "C03",
    titulo: "Los 4 niveles de identidad financiera",
    capsula: `Sobreviviente vive de fin de mes a fin de mes y reacciona ante cada emergencia. Administrador presupuesta y ahorra pero ve el dinero como algo que controlar. Constructor ve el dinero como energía que dirige hacia activos que generan más dinero. Arquitecto consciente diseña sistemas, equilibra disfrute y construcción, y mide su libertad por lo que puede elegir, no por lo que gasta. ¿En cuál estás?`,
    explicacion: `No construyes riqueza solo aprendiendo técnicas. La construyes convirtiéndote en el tipo de persona que naturalmente toma decisiones de riqueza. El punto de inflexión no llega cuando tienes mucho dinero — llega cuando decides pensar como alguien del Nivel 3 o 4 independientemente de lo que hay en tu cuenta. El Arquitecto consciente es el cuarto nivel: no solo construye, también diseña con intención, equilibra el disfrute presente con la construcción sostenida, y entiende que la libertad financiera se mide por lo que puede elegir, no por lo que gasta. Esa decisión es el verdadero punto de partida. Sin ella, las herramientas no funcionan.`,
  },
  {
    id: "C04",
    titulo: "Los 3 tipos de ingreso",
    capsula: `El ingreso activo es tu tiempo por dinero — tiene techo. El ingreso pasivo es dinero sin intercambio de tiempo — no tiene techo. El ingreso de cartera viene de tus inversiones. Para construir libertad necesitas los tres, en orden.`,
    explicacion: `El ingreso activo es importante porque es tu fuente principal cuando arrancas, pero tiene una limitación: solo tienes 24 horas al día. Incluso trabajando 12 horas diarias, hay un techo. El ingreso pasivo no tiene techo, pero requiere capital inicial: dinero para invertir, comprar una propiedad, iniciar un negocio que funcione sin ti. Por eso el orden es: usas tu ingreso activo para crear ahorros, esos ahorros para crear ingreso de cartera, y eventualmente flujos pasivos más grandes.`,
  },
  {
    id: "C05",
    titulo: "El método 50/30/20",
    capsula: `50% para Esenciales. 30% para Estilo. 20% para Libertad. No es regla rígida — es referencia. Lo importante no son los números exactos, es que tengas una estructura que tu dinero respete antes de que tú puedas tocarlo.`,
    explicacion: `La mayoría de los presupuestos fracasan porque son demasiado complicados. 8 categorías para vigilar mes a mes es agotador, y un día te olvidas y vuelves a tus viejos hábitos. El 50/30/20 funciona porque es simple: tres categorías. Si te excedes en Estilo, no pasa nada — tu categoría es flexible, simplemente tienes menos para otras cosas dentro de ese 30%. Y se ajusta: si tienes mucha deuda, puedes ir a 50/20/30 (más a deuda, menos a Estilo). Si ganas mucho, a 40/30/30. La estructura manda, los números se acomodan.`,
  },
  {
    id: "C06",
    titulo: "Esenciales vs Estilo vs Libertad",
    capsula: `Esenciales son lo que necesitas para vivir: vivienda, comida, servicios, transporte básico, seguros. Estilo son lo que quieres pero no necesitas: restaurantes, viajes, suscripciones, ropa de marca. Libertad es lo que hace crecer tu dinero: ahorros, fondos indexados, pago extra de deuda, educación que aumenta tu valor.`,
    explicacion: `Acá hay un error común: el pago mínimo de una deuda va en Esenciales (porque es obligatorio para no caer en mora), pero el pago extra por encima del mínimo va en Libertad (porque es una decisión deliberada de comprar tu libertad antes). Otro: Netflix es Estilo, seguro médico es Esencial. Un curso online que aumenta tus ingresos futuros es Libertad, no Estilo. La regla mental: ¿es indispensable para vivir? Esencial. ¿Mejora mi vida pero podría pasar sin esto? Estilo. ¿Hace crecer mi dinero o mi capacidad de generarlo? Libertad.`,
  },
  {
    id: "C07",
    titulo: "Por qué el ahorro automático le gana a la fuerza de voluntad",
    capsula: `Páguese a usted primero. Cuando llega tu salario, una transferencia automática manda el 20% a tu cuenta de inversión antes de que veas el dinero. No tienes que decidir cada mes — sucede sin tu intervención. Lo que no ves, no extrañas.`,
    explicacion: `El error clásico es pagarte a ti último: "voy a gastar todo el mes y ahorrar lo que sobre". Nunca sobra. La psicología es perversa, encuentras formas de gastar todo lo disponible. La solución es invertir el orden: configuras una transferencia automática el día que cobras, ese dinero desaparece de tu vista, y vives con lo que queda. Tu estilo de vida se ajusta solo. Lo que NO ves, no extrañas. Es la única forma sostenible de ahorrar — sin depender de fuerza de voluntad que se gasta a media tarde.`,
  },
  {
    id: "C08",
    titulo: "La gratificación diferida sin privación",
    capsula: `Diferir gratificación NO significa privarte de vivir. Significa gastar MEJOR, no gastar MENOS. Comer en restaurantes de calidad 2 veces a la semana en lugar de 6 no es sacrificio — es elegir conscientemente dónde va tu dinero.`,
    explicacion: `La trampa de la gratificación diferida es creer que hay que sufrir ahora para disfrutar después. Eso es incorrecto y por eso la mayoría abandona. El sistema no pide que sacrifiques tu vida presente en el altar de la libertad futura. Pide elegir con intención qué gastas y en qué, en lugar de gastar por hábito o presión social. Y pide algo más: que cada mes que el sistema funciona, tu capacidad de disfrutar el presente también crezca. No esperas 10 años para mejorar tu calidad de vida.`,
  },
  {
    id: "C09",
    titulo: "El costo real de tus gastos",
    capsula: `Un teléfono de $1.200 no cuesta $1.200. Si esos $1.200 los invirtieras al 8% anual por 5 años, valdrían $1.763. El teléfono te cuesta $563 extra — el costo real de oportunidad perdida. Aplica esto a cada decisión de consumo grande.`,
    explicacion: `Esta es una de las herramientas más poderosas para entrenar la gratificación diferida: calcular el costo real, no solo el visible. Ejemplos del libro: un auto nuevo de $40.000 te cuesta $86.357 en 10 años (porque ese dinero invertido al 8% se duplicaría). Salir a comer 4 veces por semana vs 1 vez son $29.342 de diferencia en 5 años. No es que no puedas comprar el auto o salir a comer — es que sepas exactamente qué estás cambiando por qué. Decisiones conscientes, no automáticas.`,
  },
  {
    id: "C10",
    titulo: "La Regla del 72",
    capsula: `Para saber cuántos años tarda en duplicarse tu dinero: divide 72 entre tu tasa de retorno. Al 8% anual: 9 años. Al 10%: 7,2 años. Al 12%: 6 años. Esa es la velocidad de duplicación de tu capital invertido.`,
    explicacion: `La Regla del 72 es una de las herramientas mentales más útiles del libro. Te permite calcular en segundos cuánto tarda cualquier capital en duplicarse a cualquier tasa. Sirve para dos cosas: primero, para entender el poder real del interés compuesto sin necesidad de calculadora. Segundo, y más importante, para ver el costo de oportunidad de cada gasto grande: cada $10.000 que NO inviertes hoy son $20.000 que NO tendrás en 9 años. Esa es la matemática real de tus decisiones de consumo.`,
  },
  {
    id: "C11",
    titulo: "El interés compuesto: la octava maravilla",
    capsula: `Einstein lo llamó "la octava maravilla del mundo". Es el momento en que tus retornos generan retornos. $10.000 invertidos al 8% anual se convierten en $100.627 en 30 años — diez veces tu inversión inicial. El truco es darle tiempo.`,
    explicacion: `El interés compuesto es ganar retorno sobre tu retorno. Año 1, tus $10.000 se convierten en $10.800. Año 2, no son $11.600 — son $11.664, porque ganaste 8% no sobre los $10.000 originales sino sobre los $10.800. Año 3, $12.597. Año 10, $21.589. Año 20, $46.610. Año 30, $100.627. Lo importante no es la fórmula — es entender que el tiempo es tu mejor amigo. Cada año que NO empiezas es un año compuesto que NUNCA recuperas.`,
  },
  {
    id: "C12",
    titulo: "El fondo de emergencia",
    capsula: `3-6 meses de gastos en efectivo. No es inversión, es seguro. Sin él, cualquier crisis te tira a la deuda de consumo y arruinas años de progreso en un fin de semana. Construirlo es la PRIMERA prioridad antes de invertir.`,
    explicacion: `Sin fondo de emergencia, cada crisis (auto descompuesto, problema médico, pérdida de trabajo) te empuja a tarjetas de crédito y préstamos personales. Eso te mete en deuda de consumo que paga 18-25% de interés — exactamente lo opuesto al interés compuesto que quieres construir. Con fondo de emergencia, simplemente usas el dinero, resuelves y sigues. 3 meses es suficiente para la mayoría de las emergencias. 6 meses es ideal: te da seguridad y te permite tomar mejores decisiones (no aceptar cualquier trabajo por desesperación). Constrúyelo ANTES de invertir.`,
  },
  {
    id: "C13",
    titulo: "Los 5 tipos de inversión",
    capsula: `Renta Fija (bonos, CDTs, 3-8%, riesgo bajo). Renta Variable (acciones, fondos indexados, 5-10%, riesgo medio-alto). Bienes Raíces (propiedades, 5-10%, riesgo medio). Negocios (20%+, riesgo alto). Criptomonedas (muy alto retorno potencial, muy alta volatilidad). Cada uno tiene su lugar.`,
    explicacion: `Para principiantes, la recomendación es empezar con Renta Variable a través de fondos indexados. Son simples, diversificados, baratos en comisiones, y tienen historial probado de generar riqueza a largo plazo. Warren Buffett los recomienda para la mayoría de las personas. Una vez que tienes experiencia y más capital, puedes explorar otros tipos según tu edad, horizonte de inversión, situación financiera y temperamento. La diversificación entre tipos es lo que reduce el riesgo total del portafolio sin sacrificar mucho retorno esperado.`,
  },
  {
    id: "C14",
    titulo: "Los fondos indexados",
    capsula: `Un fondo indexado replica un índice del mercado (ej. S&P 500). En lugar de elegir acciones individuales, compras participación en las 500 empresas más grandes a la vez. Diversificación automática, bajo costo (0,05-0,2% comisión), desempeño consistente. La mejor opción para la mayoría.`,
    explicacion: `La elegancia del fondo indexado es matemática: 80%+ de los gestores activos no logran superar al índice promedio a largo plazo, pero te cobran comisiones de 1-2% anuales que erosionan tu retorno. El fondo indexado te da el retorno promedio del mercado (7-8% histórico después de inflación) con comisiones mínimas. Warren Buffett lo dijo: para la mayoría de las personas, los fondos indexados son la mejor inversión. Tu trabajo no es vencer al mercado — es estar en el mercado consistentemente por décadas.`,
  },
  {
    id: "C15",
    titulo: "Horizonte de inversión",
    capsula: `El tiempo reduce el riesgo. Si inviertes en fondos indexados por 1 año tienes 25% de probabilidad de pérdida. Por 10 años, 5%. Por 20 años, 1%. El mercado tiene ciclos a corto plazo, pero a largo plazo siempre sube.`,
    explicacion: `Esta es la razón por la que cuanta más juventud tienes, más riesgo puedes tolerar. Si tienes 25 años y estás invirtiendo para tus 65, tienes 40 años de horizonte. Cualquier caída del mercado tiene tiempo de recuperarse y compensarse. Si tienes 60 años, ya no puedes permitirte una caída del 40% sin tiempo de recuperación — necesitas más renta fija. La regla simple: 0-1 año, mantenlo en efectivo. 5-10 años, 60% acciones/40% bonos. 20+ años, 90% acciones/10% bonos. El horizonte manda sobre tu apetito al riesgo.`,
  },
  {
    id: "C16",
    titulo: "La diferencia entre deuda buena y deuda mala",
    capsula: `Deuda mala: consumo. Tarjetas para comprar cosas que se deprecian, intereses del 18-25%, no genera retorno. Deuda buena: inversión. Hipoteca, préstamo educativo, préstamo para negocio, intereses del 3-8%, genera retorno futuro.`,
    explicacion: `No toda deuda es igual. La deuda de consumo (tarjetas, préstamos personales para comprar cosas que pierden valor) es destructiva: pagas 18-25% de interés y el activo que compras no genera nada que compense ese costo. La deuda de inversión es distinta: una hipoteca para una propiedad que aprecia, un préstamo estudiantil para una carrera que multiplica tus ingresos, un crédito para un negocio que rentabiliza. La pregunta clave: ¿esta deuda compra algo que va a generar más de lo que cuesta? Si sí, deuda buena. Si no, deuda mala.`,
  },
  {
    id: "C17",
    titulo: "Estrategia avalancha vs bola de nieve",
    capsula: `Avalancha: pagas primero la deuda con MAYOR interés. Ahorras más plata en intereses totales. Bola de nieve: pagas primero la deuda más PEQUEÑA. Ves progreso rápido, motivación psicológica. Avalancha gana matemáticamente, bola de nieve gana psicológicamente.`,
    explicacion: `La estrategia avalancha es matemáticamente óptima: pagas más al de mayor APR, mantienes mínimos en los otros, y cada deuda pagada libera plata para atacar la siguiente. Ahorras miles en intereses totales. La bola de nieve es óptima psicológicamente: pagas la deuda más chica primero para tener una victoria visible rápido, eso genera motivación para seguir. Recomendación del libro: usa avalancha si tienes disciplina y tu meta es eficiencia matemática. Usa bola de nieve si necesitas ver progreso rápido para no abandonar. Las dos funcionan — la peor estrategia es no tener ninguna.`,
  },
  {
    id: "C18",
    titulo: "Múltiples fuentes de ingreso",
    capsula: `Plan A: tu salario principal. Plan B: ingresos pasivos (dividendos, intereses, rentas). Plan C: ingresos secundarios (freelance, side hustle). El truco: el 100% del Plan C va directo a inversión — porque ya vives del Plan A.`,
    explicacion: `La estructura A/B/C es defensiva y multiplicativa al mismo tiempo. Defensiva porque si pierdes el Plan A (tu trabajo), tienes B y C como red. Multiplicativa porque el Plan C te permite acelerar el sistema: cuando te llega ese dinero extra de freelance o consultoría, NO lo gastas — va el 100% a inversión, porque tu vida ya está cubierta por el Plan A. En 5-10 años, ese Plan C reinvertido se vuelve un Plan B significativo. Y cuando el B supera al A, alcanzas libertad financiera.`,
  },
  {
    id: "C19",
    titulo: "La regla de los 30 días",
    capsula: `Antes de cualquier compra no esencial mayor a $100, espera 30 días. Si después de 30 días todavía la quieres, cómprala. Si no, evitaste un gasto impulsivo. Esta sola regla ahorra cientos de dólares al mes a la mayoría de las personas.`,
    explicacion: `El consumo impulsivo es uno de los mayores destructores de patrimonio. Las marcas diseñan toda su estrategia para que decidas en 30 segundos sin pensar. La regla de los 30 días pone un freno cognitivo: te obliga a separar el deseo del impulso. Lo que de verdad necesitas o quieres, sobrevive los 30 días. Lo que era impulso del momento, se diluye. Cada vez que pasan los 30 días y decides no comprar, estás entrenando el músculo de la gratificación diferida — y ese músculo es lo que separa al 99% del 1%.`,
  },
  {
    id: "C20",
    titulo: "Lifestyle inflation",
    capsula: `Cada vez que tu ingreso sube, tus gastos suben al mismo ritmo. Ganas más, gastas más, ahorras lo mismo. Es la trampa más común y la razón por la que profesionales con altos ingresos siguen viviendo al día. Detéctala y rómpela.`,
    explicacion: `La lifestyle inflation es lo que mata la libertad financiera de la mayoría de los profesionales que ganan bien. Ascendiste, compraste un auto mejor. Cambiaste de trabajo con aumento, te mudaste a un departamento más caro. Tu pareja ganó más, agregaron suscripciones, comen más afuera, viajan en mejor categoría. Al final del mes, el margen real es el mismo que cuando ganabas la mitad. La regla del libro: cada aumento salarial, el 50% mínimo va directo a inversión ANTES de tocar tu estilo de vida. Así creces sin caer en la trampa.`,
  },
  {
    id: "C21",
    titulo: "Tu Número de Libertad Financiera",
    capsula: `El capital invertido necesario para que sus retornos pasivos cubran tus gastos mensuales sin tocar el capital. Fórmula: Gasto Mensual Deseado × 12 ÷ Tasa de Retorno Pasivo Esperada del portafolio. Es el destino al que apunta todo el sistema.`,
    explicacion: `Sin el Número de Libertad, estás aprendiendo técnicas sin destino. Con él, todo cobra sentido matemático. La fórmula es simple pero potente: si quieres $3.000 mensuales para vivir y tu portafolio rinde 6% anual ponderado, necesitas $600.000 invertidos. Ese capital, generando 6%, te paga $36.000 al año = $3.000 al mes — sin tocar el principal. Cada decisión de gasto, ahorro e inversión cobra sentido cuando la mides contra este número. Lo que te acerca, suma. Lo que te aleja, resta.`,
  },
  {
    id: "C22",
    titulo: "Las 4 fases de la libertad financiera",
    capsula: `Fase 1: Crisis (0-3 meses, sobrevivir y empezar a ahorrar). Fase 2: Estabilidad (3-12 meses, fondo de emergencia y pagar deuda). Fase 3: Seguridad (1-5 años, invertir consistentemente). Fase 4: Libertad (5+ años, ingresos pasivos cubren gastos).`,
    explicacion: `La libertad financiera no sucede de un día para el otro. Es un proceso de 4 fases, cada una con objetivos claros. En Fase 1 tu prioridad es reducir gastos y empezar a ahorrar aunque sea poco. En Fase 2 construyes el fondo de emergencia y atacas la deuda de consumo. En Fase 3 ya inviertes consistentemente y empiezas a generar ingresos pasivos pequeños. En Fase 4 los pasivos cubren tus gastos y el trabajo se vuelve opción, no obligación. Saber en qué fase estás te dice qué hacer este mes. No saltes fases — cada una construye los cimientos de la siguiente.`,
  },
  {
    id: "C23",
    titulo: "La paradoja de la libertad financiera",
    capsula: `La mayoría idealiza "no hacer nada". Pero el ser humano no está diseñado para eso. La libertad no es para descansar — es para elegir.`,
    explicacion: `Hay algo que pocas personas anticipan antes de alcanzar la libertad financiera: el peligro de la comodidad total. El ser humano no está diseñado para no hacer nada — está diseñado para progresar, contribuir y ser útil. Quien se retira sin un propósito que lo sostenga tiende a apagarse; quien conserva un para qué mantiene la vitalidad mucho más tiempo. Por eso muchas personas que alcanzan libertad eligen seguir trabajando con más pasión que nunca. No porque necesiten el dinero. Porque encontraron su propósito. La libertad financiera no es el final del camino — es el punto de partida del camino que realmente elegiste. Por eso desde el primer capítulo, el libro pregunta: ¿qué harás cuando la tengas?`,
  },
  {
    id: "C24",
    titulo: "El Locus de Control Interno",
    capsula: `Locus externo: tus resultados dependen del gobierno, la economía, tu jefe, tu familia. Locus interno: tu vida es consecuencia directa de tus decisiones. Riqueza requiere agencia. Y la agencia empieza cuando dejas de buscar culpables afuera.`,
    explicacion: `Hay una distinción psicológica que separa a quienes construyen riqueza de quienes no — independiente de inteligencia, educación o punto de partida. El Locus Externo te mantiene en victimismo, y desde el victimismo es imposible construir riqueza porque la riqueza requiere agencia. El Locus Interno entiende que tu vida exterior es reflejo de tus acciones acumuladas. La pregunta correcta no es "¿por qué ellos ganan más que yo?" — es "¿en qué persona me tengo que convertir para ganar lo que ellos ganan?". Esa pregunta cambia el foco de la queja a la construcción.`,
  },
  {
    id: "C25",
    titulo: "La ley del impacto a escala",
    capsula: `La economía no remunera la utilidad moral, remunera el impacto a escala. Un médico ayuda profundo a pocos. Un creador de contenido sobre salud puede impactar a millones. El sistema paga por la cantidad de personas a las que llegas con tu solución.`,
    explicacion: `Durante siglos, la escala requería capital masivo: fábricas, distribución, empleados. Hoy internet eliminó esa barrera. Una persona con conocimiento, intención, un dispositivo y conexión puede llegar a millones simultáneamente. La IA eliminó la segunda barrera: el tiempo. Lo que antes requería semanas de equipo, hoy toma horas con las herramientas correctas. Esto significa que nunca en la historia humana había sido tan alcanzable para una persona normal construir un modelo de ingresos escalable desde cero, sin capital inicial. La barrera ya no es técnica — es mental.`,
  },
  {
    id: "C26",
    titulo: "Las 6 raíces del estrés financiero",
    capsula: `1) Falta de propósito. 2) Acción incompleta (tareas pendientes). 3) Temor al fracaso. 4) Temor al rechazo (comportamiento Tipo A). 5) Negación de la realidad. 6) Rabia hacia el sistema. No son externas — son internas. Y son la verdadera razón por la que el dinero no llega.`,
    explicacion: `Hay una observación recurrente en la literatura de psicología del éxito que identifica seis condiciones internas que nos predisponen a emociones negativas y resultados mediocres. No son circunstancias externas — son estados internos. Puedes ganar más y seguir teniendo los mismos problemas si no resuelves estas raíces. Por ejemplo, la negación de la realidad: rehusarse a enfrentar verdades desagradables sobre tu situación financiera es la razón por la que muchas personas evitan revisar sus cuentas. Siempre hay un precio que puedes pagar para liberarte de cualquier estrés. La resistencia a enfrentarlo es lo que causa el estrés — no la situación en sí.`,
  },
  {
    id: "C27",
    titulo: "Tipo A vs Tipo B",
    capsula: `Tipo A trabaja compulsivamente desde el miedo, nunca está satisfecho, compite contra todos, no descansa, muere joven. Tipo B construye desde la intención, sabe cuándo parar, tiene relaciones sanas, construye sostenido. Para libertad real, migra del Tipo A al Tipo B.`,
    explicacion: `El Tipo A vive en miedo permanente al rechazo y al fracaso. Trabaja muchísimas horas pero desde la ansiedad, no desde la intención. No puede descansar porque siente que si para, todo se cae. La ironía es que muchos Tipo A nunca llegan a libertad financiera porque queman su salud y relaciones en el proceso, o cuando llegan, el cuerpo ya no responde. El Tipo B trabaja con la misma intensidad pero desde la claridad: sabe qué construye, por qué, y cuándo parar. Migrar de A a B no es trabajar menos — es trabajar con propósito en lugar de con pánico.`,
  },
  {
    id: "C28",
    titulo: "El código mental con el dinero (4 capas)",
    capsula: `Capa 1: lo que Crees que mereces ganar. Capa 2: lo que Crees que es posible para alguien como tú. Capa 3: lo que Crees que requiere el dinero (el precio que le pones al éxito). Capa 4: lo que Crees que pasará si tienes mucho dinero. Lo que crees, lo creas.`,
    explicacion: `Tu código mental se instaló antes de los 10 años. Te lo dieron tu familia, tu escuela, tu cultura y tus primeras experiencias con el dinero. No lo elegiste — pero puedes reescribirlo. Las cuatro capas son acumulativas y trabajan juntas: si crees que no mereces ganar mucho (Capa 1), pero también crees que es posible para alguien como tú (Capa 2), vas a sabotear inconscientemente cualquier ingreso extra. The Money Command trabaja las cuatro capas porque solo cambiar técnicas sin tocar las creencias es como manejar con el freno de mano puesto.`,
  },
  {
    id: "C29",
    titulo: "Las 5 frases que más daño hacen",
    capsula: `"El dinero no da la felicidad." "La gente rica es mala o corrupta." "Para ganar dinero hay que tener dinero." "El dinero fácil no existe." "Pensar mucho en dinero es de gente materialista." Probablemente escuchaste todas. Y se instalaron antes de que pudieras evaluarlas.`,
    explicacion: `Estas frases se instalaron en tu mente antes de que pudieras analizarlas. No son verdades — son programas. Y como todo programa, se pueden desinstalar. La verdad detrás de cada una: el dinero amplifica lo que eres (no es el problema ni la solución). Hay personas maravillosas con dinero y terribles sin nada. El conocimiento es el activo más rentable, no se necesita dinero para empezar. Existe el dinero inteligente, que multiplica tu tiempo y energía. Ignorar el dinero es de gente que no entiende que el dinero es libertad, opciones y tiempo. No desear más es válido — no saber gestionarlo es irresponsabilidad.`,
  },
  {
    id: "C30",
    titulo: "El éxito sigue sistemas, no apellidos",
    capsula: `"El éxito es para otros, no para mí." Mentira. El éxito sigue sistemas, no apellidos. Este libro es el sistema. Tú aportas la ejecución. Cualquiera que aplique el sistema con consistencia llega — independientemente de dónde empezó.`,
    explicacion: `La creencia "el éxito es para otros" es uno de los autoboicotes más comunes y más destructivos. Asume que hay algo intrínsecamente especial en quienes triunfan: un origen, una conexión, una suerte. La evidencia muestra lo contrario. La mayoría de los millonarios de hoy empezaron de cero. Lo que tienen no es un don especial — es un sistema que aplicaron consistentemente durante años. Maximizar ingresos, minimizar gastos, automatizar ahorro, invertir, proteger. Cinco pasos. Repetidos. Cualquiera puede hacerlo. Pero pocos lo hacen porque requiere disciplina, paciencia y fe en el proceso cuando los resultados aún no son visibles.`,
  },
  {
    id: "C31",
    titulo: "La pregunta correcta",
    capsula: `La pregunta incorrecta: "¿Por qué ellos ganan más que yo?". La pregunta correcta: "¿En qué persona me tengo que convertir para ganar lo que ellos ganan?". La primera te mantiene en queja. La segunda te pone en construcción.`,
    explicacion: `Cambiar la pregunta es cambiar la respuesta. La pregunta "¿por qué ellos ganan más?" busca razones afuera: suerte, conexiones, origen. Te mantiene como víctima del sistema. La pregunta "¿en qué persona me tengo que convertir?" busca trabajo adentro: qué habilidades necesito, qué creencias debo cambiar, qué decisiones tengo que tomar. Te pone en agencia. La diferencia entre las dos preguntas es la diferencia entre quedarte como estás o avanzar. Y esa diferencia no es de inteligencia ni de circunstancias — es de elección.`,
  },
  {
    id: "C32",
    titulo: "El Triángulo de la Riqueza",
    capsula: `Tres vértices: Ingresos (lo que ganas), Gastos (a dónde se va), Inversión (lo que multiplica). Los tres son vasos comunicantes — debilidad en uno drena a los demás. La mayoría trabaja solo uno. El sistema trabaja los tres.`,
    explicacion: `La mayoría de los libros de finanzas trabajan solo un pilar: ahorro, inversión o emprendimiento. El problema es que el dinero funciona como sistema de vasos comunicantes: la debilidad en uno drena los demás. Una persona que invierte brillantemente pero tiene deuda al 25% pierde más de lo que gana. Una persona que ahorra disciplinadamente pero no genera ingresos adicionales llega a libertad en 40 años en lugar de 10. Una persona que gana mucho pero no controla gastos termina en lifestyle inflation. Los tres vértices trabajan juntos o el sistema se rompe.`,
  },
  {
    id: "C33",
    titulo: "Por qué los presupuestos tradicionales fallan",
    capsula: `8 categorías para vigilar mes a mes es agotador. Demasiada disciplina, demasiada fuerza de voluntad. Por eso la mayoría abandona en 3 semanas. El 50/30/20 funciona porque solo tiene 3 categorías. Simple. Flexible. Sostenible.`,
    explicacion: `Los presupuestos tradicionales fracasan por sobreingeniería. Diseñan 8-10 categorías con límites estrictos para cada una, y cualquier desvío genera estrés. Si gastas $50 más en comida un mes, te obligan a recortar $50 de otra categoría — eso crea ansiedad y abandono. El 50/30/20 funciona porque es simple: tres categorías grandes con flexibilidad interna. Si gastas más en restaurantes, simplemente tienes menos para viajes dentro del 30% de Estilo. No hay falla técnica — hay reasignación natural. La estructura manda; los detalles se acomodan solos.`,
  },
  {
    id: "C34",
    titulo: "Por qué necesitas propósito",
    capsula: `Sin propósito, el dinero es destino. Con propósito, es vehículo. La falta de significado es la primera causa de estrés y pérdida de motivación, incluso en personas que alcanzaron sus metas financieras. Necesitas saber para qué quieres la libertad.`,
    explicacion: `La paradoja del éxito financiero: la falta de significado es la primera causa de estrés y pérdida de motivación, incluso entre quienes alcanzaron sus metas. El dinero no puede darte propósito — ese trabajo es solo tuyo. No puede reemplazar relaciones genuinas — la riqueza sin comunidad es soledad en primera clase. No puede comprar paz mental — solo puede comprar el tiempo para construirla. No puede garantizar felicidad — solo compra la libertad de elegirla. Pero con propósito claro, amplifica todo eso de forma extraordinaria. La pregunta no es cuánto quieres tener. Es qué harás cuando lo tengas.`,
  },
  {
    id: "C35",
    titulo: "La pregunta del propósito inversor",
    capsula: `Completa la frase: "Estoy construyendo este patrimonio para poder ___, para el año ___, porque quiero contribuir ___." Esa frase es tu brújula. Úsala cada vez que vayas a tomar una decisión financiera.`,
    explicacion: `Esta frase es la herramienta más simple y más poderosa del sistema. Funciona porque convierte una idea vaga ("quiero libertad financiera") en un compromiso específico con tres componentes: el qué (lo que vas a hacer), el cuándo (la fecha límite), y el porqué (el sentido más amplio). Cuando dudas entre comprar algo y ahorrar, mira esa frase. Cuando aparece una oportunidad de inversión, mira esa frase. Cuando quieres gastar en un capricho, mira esa frase. Es tu brújula. Sin ella, navegas sin norte.`,
  },
  {
    id: "C36",
    titulo: "La especificidad convierte el deseo en estrategia",
    capsula: `"Viajar" no es meta — es deseo. "3 meses al año en una cabaña con mi familia" es meta. "Ayudar a otros" no es meta — es deseo. "Financiar la educación de mis sobrinos" es meta. La especificidad convierte tu deseo en estrategia.`,
    explicacion: `Las metas vagas no movilizan recursos. Tu cerebro no sabe hacia dónde apuntar, tu sistema financiero no sabe cuánto necesita acumular, tu calendario no sabe qué priorizar. La especificidad cambia todo: convierte el deseo en una dirección concreta. Ejemplo del libro: "viajar" requiere X dólares al mes para X meses, que requieren X de capital invertido a X de retorno. Cada elemento específico (lugar, frecuencia, duración, compañía) se traduce en una cifra. Y las cifras se persiguen. Los deseos solo se sueñan.`,
  },
  {
    id: "C37",
    titulo: "La gratificación diferida y el equilibrio",
    capsula: `No se trata de vivir en escasez esperando el futuro. Se trata de vivir con intención AHORA, sabiendo que cada decisión consciente de hoy construye la libertad de mañana. Disfruta del presente, pero con conciencia.`,
    explicacion: `La trampa de la gratificación diferida es creer que el sistema requiere sacrificar tu vida presente. El sistema NO pide eso. Pide algo distinto: que disfrutes conscientemente del presente, eligiendo con intención dónde gasta tu dinero en lugar de gastar por hábito o presión social. Que agradezcas lo que tienes mientras construyes lo que quieres — la abundancia no empieza cuando alcanzas tu Número, empieza cuando dejas de vivir desde la escasez mental. Que avances progresivamente: cada mes que el sistema funciona, tu capacidad de disfrutar el presente también crece. No esperas 10 años para mejorar tu calidad de vida.`,
  },
  {
    id: "C38",
    titulo: "Sé hoy la persona de la meta",
    capsula: `No esperes a tener libertad financiera para actuar como alguien libre. Sé hoy la persona que serás cuando alcances la meta — no en el dinero, sino en la mentalidad. Tu cerebro empieza a detectar oportunidades que antes eran invisibles.`,
    explicacion: `Esto suena místico pero tiene base neurológica. Tu cerebro filtra millones de estímulos por segundo y solo te muestra lo relevante para tu identidad actual. Si tu identidad es "soy alguien que vive al día", tu cerebro filtra oportunidades de inversión como ruido. Si tu identidad es "soy alguien que construye patrimonio", el mismo cerebro empieza a detectar oportunidades de inversión en cada conversación. No cambia tu suerte — cambia tu atención. Por eso el libro insiste en trabajar la identidad antes que las técnicas: con identidad equivocada, las técnicas no funcionan.`,
  },
  {
    id: "C39",
    titulo: "El compromiso con el sistema, no con el resultado",
    capsula: `El resultado tarda. El sistema es inmediato. Comprometete con aplicar el sistema —presupuesto, ahorro automático, educación continua— independiente de los resultados de los primeros meses. La mayoría abandona justo antes de que los resultados lleguen.`,
    explicacion: `La trampa más común en construcción de riqueza: querer ver resultados a los 3 meses. Los resultados tardan porque dependen del interés compuesto, que es exponencial pero lento al principio. Los primeros años parecen no pasar nada. A los 5 años empiezas a ver. A los 10, la curva se vuelve evidente. A los 20, exponencial. La mayoría abandona en el año 2-3, cuando los resultados aún no son visibles, sin saber que estaban a 1 año de la curva exponencial. La regla: comprométete con el sistema, no con el resultado. El sistema lo controlas, los resultados llegan solos si el sistema se sostiene.`,
  },
  {
    id: "C40",
    titulo: "La consistencia gana sobre la brillantez",
    capsula: `No necesitas ser brillante. Necesitas ser consistente. Decisiones promedio repetidas durante años superan a decisiones geniales tomadas esporádicamente. El interés compuesto premia la consistencia, no la inteligencia.`,
    explicacion: `Una de las grandes confusiones es creer que la riqueza viene de decisiones excepcionales: el negocio brillante, la inversión perfecta, la oportunidad única. La realidad es lo opuesto: la riqueza viene de decisiones promedio repetidas con consistencia. Invertir $500 al mes en un fondo indexado durante 30 años no es brillante — es promedio. Pero te lleva a $750.000+ por puro interés compuesto. El genio que invierte $50.000 una vez y nunca más, termina con menos. La consistencia es la inteligencia aplicada al tiempo. Y el tiempo es democrático: todos tenemos el mismo.`,
  },
  {
    id: "C41",
    titulo: "Ser responsable al 100%",
    capsula: `No hay gobierno, jefe, economía ni circunstancia que tenga más poder sobre tu futuro financiero que tú. Asumir el 100% de responsabilidad no significa que todo es culpa tuya — significa que tienes el 100% del poder para cambiarlo.`,
    explicacion: `La responsabilidad al 100% es la decisión más liberadora que puedes tomar. Suena pesada — "todo depende de mí" — pero es lo contrario: es la única posición desde la cual puedes actuar. Si tu futuro financiero depende del gobierno, no puedes hacer nada hasta que el gobierno cambie. Si depende de tu jefe, hasta que tu jefe te aumente. Si depende de la economía, hasta que la economía mejore. Esas posiciones son trampas que te paralizan. La responsabilidad total te devuelve el poder: tú decides, tú actúas, tú cambias. No es culpa — es agencia.`,
  },
  {
    id: "C42",
    titulo: "La educación financiera continua",
    capsula: `Este libro no es el destino, es el punto de partida. Cada libro, podcast, mentor, conversación honesta sobre dinero que sumas a tu vida es una piedra más en tu base. La educación financiera tiene el ROI más alto de todos los activos.`,
    explicacion: `El error es leer un libro y volver a la rutina. El conocimiento sin profundización se diluye. Recomendación del libro: 3-4 libros de finanzas al año, 1 podcast semanal, 1 conversación mensual con alguien que está más adelante que tú. No es para "saber más" — es para que las decisiones financieras se vuelvan naturales. La educación financiera tiene un ROI extraordinario porque cada concepto nuevo te ahorra decisiones malas durante el resto de tu vida. Una buena decisión a los 25 te ahorra cientos de miles a los 60. Esa es la matemática real.`,
  },
  {
    id: "C43",
    titulo: "Cómo se sabe que estás progresando",
    capsula: `1) Tu tasa de ahorro sube. 2) Tu deuda baja. 3) Tu fondo de emergencia crece. 4) Tu ingreso pasivo empieza a aparecer. 5) Tu estrés financiero disminuye. Si estas 5 señales pasan, vas bien — aunque no veas grandes cifras todavía.`,
    explicacion: `Las grandes cifras son ruido. Las verdaderas señales de progreso son más sutiles pero más fiables. Que tu tasa de ahorro suba de 5% a 10%, después a 15%, después a 20%, sin que la cifra absoluta sea espectacular. Que tu deuda total baje aunque sea $200 al mes. Que tu fondo de emergencia pase de cero a cubrir 1 mes, después 3, después 6. Que recibas tu primer dividendo de $50 — no por la cifra, sino por lo que representa: el sistema funcionando. Que dejes de pensar en dinero cuando vas a dormir. Esas son las señales reales.`,
  },
  {
    id: "C44",
    titulo: "Cómo acelerar tu camino",
    capsula: `1) Aumenta tu ingreso. 2) Reduce tus gastos. 3) Aumenta tu retorno de inversión. 4) Crea múltiples flujos. 5) Reinvierte tus ganancias. Cada $500 mensuales más (ingreso o ahorro) aceleran tu libertad en 1-2 años. Los 5 juntos: 5-7 años más rápido.`,
    explicacion: `La aceleración no es magia — es matemática. Cada $500 extra que ingresan o que dejas de gastar son $500 que van a inversión. Esos $500 al 8% en 20 años se convierten en $295.000. Suma una segunda fuente de ingreso, optimiza tu retorno con mejor allocation, reinvierte tus dividendos en lugar de gastarlos, y la línea de tiempo se comprime drásticamente. Pasas de 25 años a libertad a 12-15 años. No es revolución — es ajuste fino aplicado consistentemente. Las cinco palancas juntas son más potentes que cualquiera individual al máximo.`,
  },
  {
    id: "C45",
    titulo: "De consumidor a inversor",
    capsula: `El cambio mental más importante: dejas de pensar "¿qué puedo comprar?" y empiezas a pensar "¿dónde puedo invertir?". Mismo dinero, decisión opuesta. Ese cambio mental es la línea divisoria entre quienes consumen su vida y quienes construyen su libertad.`,
    explicacion: `La mayoría de las personas mira el dinero a través del lente del consumo. Reciben su salario y piensan inmediatamente qué pueden comprar con él. Las decisiones de inversión son residuales — "voy a invertir lo que sobre". Y nunca sobra. El cambio de identidad invierte el orden: primero inviertes, después consumes. Primero piensas dónde poner ese dinero para que crezca, después qué necesidades cubrir con lo que queda. Mismo dinero, decisiones opuestas, resultados opuestos. Ese cambio mental, mantenido en el tiempo, es lo que separa al 99% del 1%.`,
  },
  {
    id: "C46",
    titulo: "La paz mental como primer resultado",
    capsula: `El primer cambio que vas a sentir no es financiero — es emocional. Cuando tu fondo de emergencia está completo (3-6 meses de gastos), duermes diferente. Esa paz mental es el primer regalo del sistema. Y llega rápido.`,
    explicacion: `Mucha gente espera que la libertad financiera llegue como un evento dramático: el día que alcances tu Número. La realidad es más gradual y más bondadosa. El primer cambio llega rápido — entre 6 y 18 meses, cuando completas tu fondo de emergencia. De repente las crisis cotidianas (auto, salud, problema laboral) dejan de ser catastróficas porque tienes colchón. Duermes mejor. Tu pareja te ve más relajada. Discutes menos por dinero. Esa paz mental temprana es lo que sostiene el sistema durante los años en que los resultados grandes aún están lejos.`,
  },
  {
    id: "C47",
    titulo: "La consistencia construye legado",
    capsula: `Después de 10+ años de consistencia, no solo tienes libertad financiera. Tienes patrimonio que pasarás a tus hijos. Cambias la trayectoria de tu familia, no solo de tu vida. Esa es la diferencia entre construir riqueza y construir legado.`,
    explicacion: `La libertad financiera personal es el primer nivel. El legado es el segundo. Cuando tu sistema sigue funcionando 10, 15, 20 años, lo que acumulaste empieza a trascender tu propia vida. Tus hijos heredan no solo dinero, sino educación financiera, hábitos, mentalidad. Cambian las posibilidades para tus nietos. Cambia la trayectoria de toda una línea familiar. Esa es la diferencia entre construir riqueza para ti y construir legado para tu sangre. Y no requiere ser millonario — requiere consistencia durante décadas. El interés compuesto aplicado a generaciones.`,
  },
  {
    id: "C48",
    titulo: "Compartir lo que aprendes",
    capsula: `El conocimiento que se comparte se consolida y multiplica. Cuando enseñas algo, lo aprendes dos veces. Cuando ayudas a alguien más a construir su sistema, refuerzas el tuyo. La libertad financiera personal es buena. La que ayudas a construir en otros es transformadora.`,
    explicacion: `Hay un fenómeno paradójico en la educación financiera: enseñarla refuerza tu propia disciplina. Cuando le explicas a un amigo cómo funciona el interés compuesto, lo aprendes más profundo. Cuando ayudas a un familiar a armar su presupuesto, el tuyo se vuelve más sólido. Cuando guías a alguien que recién empieza, vuelves a conectar con el porqué de tu propio camino. Compartir no es altruismo desinteresado — es una de las herramientas más poderosas de aprendizaje y consolidación. Y multiplica el impacto: tu camino ayuda a otros a no caer en las trampas en las que tú caíste.`,
  },
  {
    id: "C49",
    titulo: "La urgencia por completar",
    capsula: `Dentro de la psique humana hay una "urgencia por completar". Cuando postergas, esa urgencia genera estrés crónico. Cada tarea pendiente drena energía que debería ir a construir riqueza. Regla: hazlo, complétalo, ciérralo.`,
    explicacion: `Esto se ha identificado como una de las 6 raíces del estrés que bloquean la libertad financiera. Tu mente tiene una capacidad limitada de tareas abiertas — cada cosa pendiente consume recursos cognitivos en background, aunque no estés pensando en ella conscientemente. La factura sin pagar, el papeleo no presentado, la conversación pospuesta. Cada una drena. La solución no es organizarte mejor — es completar. Hacer hoy lo que se puede hacer hoy. Cerrar lazos. Pagar lo que se debe. La sensación de "todo está al día" libera energía mental que puedes redirigir a construir.`,
  },
  {
    id: "C50",
    titulo: "El día que decides que eres diferente",
    capsula: `Hay un momento que marca el antes y el después. No es cuando llega una herencia. No es cuando ganas más. Es cuando decides —en el fondo de tus entrañas— que no volverás a ser la misma persona con el dinero. Ese momento puede ser hoy.`,
    explicacion: `Este es el punto que el libro insiste en que es el verdadero comienzo. No es leer este libro. No es entender los conceptos. Es el momento, único e interno, en que decides que eres diferente con el dinero. Que no volverás a ser la persona que gastaba sin pensar, que postergaba ahorrar, que evitaba mirar sus cuentas, que culpaba al sistema. Esa decisión no requiere dinero ni circunstancias especiales — requiere claridad. Y una vez tomada, todas las técnicas del libro empiezan a funcionar, porque ya hay alguien adentro que puede ejecutarlas. Sin esa decisión, ningún sistema funciona. Con ella, cualquier sistema funciona.`,
  },
];

/**
 * Índice del "concepto del día" para una fecha dada, determinístico: el mismo
 * día (UTC) devuelve siempre el mismo concepto, y rota por día del año sin
 * repetir hasta agotar los 50 (día del año % cantidad de conceptos).
 */
export function conceptIndexForDate(date: Date): number {
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 0);
  const today = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  const dayOfYear = Math.floor((today - startOfYear) / 86_400_000);
  const n = COACH_CONCEPTS.length;
  return ((dayOfYear % n) + n) % n;
}

// ============================================================================
// Recordatorios del día (30 frases ancla)
// ============================================================================

/**
 * 30 recordatorios / frases ancla, texto EXACTO del documento. Rotan uno por
 * día (mismo criterio determinístico por fecha que el concepto del día).
 */
export const COACH_REMINDERS: string[] = [
  `"La riqueza no es complicada. Es un sistema."`,
  `"La diferencia entre ricos y pobres no es la cantidad de dinero que ganan. Es lo que hacen con el dinero que ganan." — Warren Buffett`,
  `"Lo que se mide se mejora. Y lo que se escribe se hace real."`,
  `"Haz hoy lo que otros no están dispuestos a hacer. Tendrás mañana lo que otros no pueden tener."`,
  `"Páguese a usted primero. Si no ve el dinero, no lo extraña."`,
  `"Diferir la gratificación no significa privarte de vivir. Significa gastar mejor, no gastar menos."`,
  `"El tiempo es tu mejor amigo. Cada año que NO empiezas es un año compuesto que NUNCA recuperas."`,
  `"La pregunta correcta no es '¿por qué ellos ganan más?' sino '¿en qué persona me tengo que convertir para ganar lo que ellos ganan?'."`,
  `"El éxito sigue sistemas, no apellidos. Tú aportas la ejecución."`,
  `"Tu pasado financiero no determina tu futuro financiero."`,
  `"La consistencia gana sobre la brillantez."`,
  `"El mayor activo no está en el banco — está entre tus orejas."`,
  `"Lo que no se escribe, no existe para el subconsciente."`,
  `"Una meta sin fecha es un sueño."`,
  `"Las personas ricas no son más inteligentes que tú. Tienen un sistema que automatiza la construcción de riqueza."`,
  `"No hay atajos. Hay sistemas. Y los que los ejecutan, ganan."`,
  `"La libertad financiera no es el final del camino. Es el punto de partida del camino que realmente elegiste."`,
  `"Sin propósito, el dinero es destino. Con propósito, es vehículo."`,
  `"Las personas que no tienen metas se condenan a trabajar para los que sí las tienen."`,
  `"Aquello que temes es exactamente donde está tu próximo crecimiento."`,
  `"Tu termostato financiero determina tu vida material más que tu salario."`,
  `"El primer gasto del mes es a ti mismo."`,
  `"Cada decisión consciente de hoy construye la libertad de mañana."`,
  `"El consumo es fácil. La construcción requiere intención."`,
  `"Empieza imperfecto. Ajusta en el camino. Aprende haciendo."`,
  `"Lo que crees, lo creas."`,
  `"Soy responsable. Nadie puede hacerme sentir nada sin mi permiso."`,
  `"La libertad financiera empieza el día en que decides que eres diferente con el dinero."`,
  `"No hay momento perfecto. Hay este momento, y nada más."`,
  `"El interés compuesto premia la consistencia, no la inteligencia."`,
];

export function reminderIndexForDate(date: Date): number {
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 0);
  const today = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  const dayOfYear = Math.floor((today - startOfYear) / 86_400_000);
  const n = COACH_REMINDERS.length;
  return ((dayOfYear % n) + n) % n;
}

// ============================================================================
// Retos de la semana (15 retos)
// ============================================================================

export interface CoachChallenge {
  id: string;
  titulo: string;
  descripcion: string;
}

/**
 * 15 retos de la semana, texto EXACTO del documento. Rotan uno por semana
 * (cada 7 días), determinístico por número de semana (continuo entre años).
 */
export const COACH_CHALLENGES: CoachChallenge[] = [
  {
    id: "R01",
    titulo: "El Reto del Termostato",
    descripcion: `Esta semana, escribe en papel tres números: tu ingreso promedio de los últimos 12 meses, el máximo que ganaste en un mes, y lo que querrías ganar dentro de 2 años. Divide el tercero por el primero. Ese cociente es la brecha que el sistema necesita cerrar.`,
  },
  {
    id: "R02",
    titulo: "El Reto del Costo Real",
    descripcion: `Elige UN gasto recurrente o grande que hiciste el mes pasado. Calcula su costo real: cuánto valdría ese dinero invertido al 8% durante 10 años. Compara esa cifra con lo que recibiste. ¿Volverías a hacer el gasto sabiendo eso?`,
  },
  {
    id: "R03",
    titulo: "El Reto de los 30 Días",
    descripcion: `Esta semana, cualquier compra no esencial mayor a $100, anótala en una lista con la fecha. Espera 30 días antes de comprarla. Si dentro de 30 días todavía la quieres, cómprala. Si no, evitaste un gasto impulsivo. Lleva la cuenta.`,
  },
  {
    id: "R04",
    titulo: "El Reto del Ahorro Automático",
    descripcion: `Si todavía no lo hiciste, esta semana configura una transferencia automática del 10% (o lo que puedas) de tu ingreso a una cuenta separada el día que cobras. No tiene que ser perfecto — tiene que existir. Después subes el %.`,
  },
  {
    id: "R05",
    titulo: "El Reto de las Suscripciones",
    descripcion: `Esta semana revisa TODAS tus suscripciones activas (Netflix, Spotify, gimnasio, apps, software, plataformas). Calcula el total mensual y el anual. Cancela las que usaste menos de 3 veces el mes pasado. Anota cuánto ahorraste y mándalo a inversión.`,
  },
  {
    id: "R06",
    titulo: "El Reto del Diagnóstico",
    descripcion: `Esta semana completa los 10 pasos del Diagnóstico Financiero del Capítulo 3: ingreso neto, gastos totales, ahorro mensual, tasa de ahorro, deuda total, ratio deuda/ingreso, fondo de emergencia, patrimonio neto. Es la foto de partida. Sin ella no puedes medir progreso.`,
  },
  {
    id: "R07",
    titulo: "El Reto del Propósito",
    descripcion: `Esta semana, completa esta frase con honestidad real: "Estoy construyendo este patrimonio para poder ___, para el año ___, porque quiero contribuir ___." Escribila en papel. Ponela donde la veas. Esa frase es tu brújula.`,
  },
  {
    id: "R08",
    titulo: "El Reto de la Negociación",
    descripcion: `Esta semana llama a UN proveedor de servicios (internet, teléfono, seguros) y negocia. Di que viste ofertas competidoras y pide mejor tarifa. Tasa de éxito típica: 50-60%. Ahorro mensual típico: $30-80. Ese ahorro va directo a inversión.`,
  },
  {
    id: "R09",
    titulo: "El Reto del Café Hormiga",
    descripcion: `Esta semana, suma cada café fuera de casa, snack y compra menor a $10. Anotalo todo. Al final de la semana, multiplica por 4 para ver el costo mensual. Después por 12 para el anual. Probablemente te sorprenda.`,
  },
  {
    id: "R10",
    titulo: "El Reto de la Categorización",
    descripcion: `Esta semana, revisa los últimos 30 gastos de tu cuenta bancaria. Marca cada uno como Esencial / Estilo / Libertad. ¿Cuántos eran Esencial real? ¿Cuántos Estilo automáticos sin disfrute consciente? Esa lectura sola cambia tu próximo mes.`,
  },
  {
    id: "R11",
    titulo: "El Reto del Score Crediticio",
    descripcion: `Esta semana, consigue tu reporte de crédito (en muchos países es gratis una vez al año). Revísalo en busca de errores — el 20% de los reportes tienen errores que bajan el score injustamente. Si encuentras errores, dispútalos. Una corrección puede subir tu score 30-50 puntos.`,
  },
  {
    id: "R12",
    titulo: "El Reto de la Inversión Mínima",
    descripcion: `Si nunca invertiste, esta semana abre una cuenta de corretaje (Interactive Brokers, Fidelity, o el equivalente en tu país). NO tienes que invertir grande — solo abrirla. La barrera psicológica de "no sé cómo" es más grande que la real. Una vez abierta, compra $50 de un fondo indexado del S&P 500. Empezaste.`,
  },
  {
    id: "R13",
    titulo: "El Reto de la Conversación",
    descripcion: `Esta semana habla de dinero con alguien — pareja, amigo, familiar. No para presumir, no para quejarte — para compartir lo que estás aprendiendo. La regla del libro: el conocimiento que se comparte se consolida. Y a veces, esa conversación abre algo en la otra persona también.`,
  },
  {
    id: "R14",
    titulo: "El Reto del Libro Adicional",
    descripcion: `Esta semana empieza UN libro más sobre finanzas. Cualquiera de la lista del libro: "The Millionaire Next Door", "Rich Dad Poor Dad", "The Intelligent Investor", "Atomic Habits", "Secrets of the Millionaire Mind". La educación financiera tiene el ROI más alto de todos los activos.`,
  },
  {
    id: "R15",
    titulo: "El Reto de la Carta al Futuro",
    descripcion: `Esta semana escribe una carta a tu yo dentro de 2 años. Describile cómo es el proceso que estás empezando, qué te asusta, qué esperas lograr. Guardala en sobre cerrado. Abrila en 2 años. Vas a ver cuánto cambiaste — y eso refuerza la identidad de constructor de patrimonio.`,
  },
];

/**
 * Índice del reto de la semana: rota cada 7 días, determinístico por número de
 * semana desde la época (continuo entre años, sin doble-mostrar en el cambio
 * de año).
 */
export function challengeIndexForDate(date: Date): number {
  const days = Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) /
      86_400_000,
  );
  const week = Math.floor(days / 7);
  const n = COACH_CHALLENGES.length;
  return ((week % n) + n) % n;
}
