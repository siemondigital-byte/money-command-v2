/**
 * Afirmaciones del día (frase célebre + autor + tip) del Dashboard.
 *
 * Contenido editorial. La versión inglesa vive en affirmations.en.ts con el
 * MISMO shape; la selección por idioma se hace en el Dashboard (server) y se
 * pasa al AffirmationCard por prop. La rotación (cada 10s) no depende del idioma.
 */
export interface Affirmation {
  text: string;
  author: string;
  tip: string;
}

export const AFFIRMATIONS_ES: Affirmation[] = [
  {
    text: "No trabajes por dinero, haz que el dinero trabaje para ti.",
    author: "Robert Kiyosaki",
    tip: "Cada peso que inviertes es un empleado que trabaja sin descanso.",
  },
  {
    text: "El interés compuesto es la octava maravilla del mundo.",
    author: "Albert Einstein",
    tip: "El tiempo en el mercado vale más que acertar el momento.",
  },
  {
    text: "La riqueza es la capacidad de vivir plenamente sin trabajar.",
    author: "Henry David Thoreau",
    tip: "Tu meta no es acumular: es que tus flujos pasivos cubran tu vida.",
  },
  {
    text: "Gasta lo que queda después de ahorrar, no al revés.",
    author: "Warren Buffett",
    tip: "Automatiza tu canasta de Libertad antes de tocar el resto.",
  },
  {
    text: "Un presupuesto le dice a tu dinero a dónde ir.",
    author: "John Maxwell",
    tip: "Dirigir el dinero no es restringir: es elegir mejor.",
  },
  {
    text: "El riesgo viene de no saber lo que estás haciendo.",
    author: "Warren Buffett",
    tip: "Diversificar entre tipos de activo reduce el riesgo.",
  },
  {
    text: "Construir capital es plantar árboles bajo cuya sombra no esperas sentarte.",
    author: "Proverbio adaptado",
    tip: "El capital queda intacto y crece; tú vives de sus frutos.",
  },
  {
    text: "Gastar no es despilfarrar. Despilfarrar es gastar sin dirección.",
    author: "El Sistema Infalible de Riqueza",
    tip: "Esenciales menos, Libertad más. Libertad más, Estilo menos.",
  },
  {
    text: "La paciencia es la aliada secreta del inversor.",
    author: "Charlie Munger",
    tip: "El portafolio se construye en décadas, no en semanas.",
  },
  {
    text: "El dinero es tiempo de tu vida convertido en números.",
    author: "El Sistema Infalible de Riqueza",
    tip: "Antes de un egreso, pregunta cuántas horas de vida cuesta.",
  },
  {
    text: "No es cuánto ganas, es cuánto conservas y multiplicas.",
    author: "Robert Kiyosaki",
    tip: "Tu tasa de ahorro pesa más que tu salario en el largo plazo.",
  },
  {
    text: "El segundo mejor momento para invertir es hoy.",
    author: "Proverbio de inversión",
    tip: "Empezar pequeño y temprano supera a empezar grande y tarde.",
  },
  {
    text: "La disciplina es el puente entre las metas y los logros.",
    author: "Jim Rohn",
    tip: "Un aporte mensual constante vence al esfuerzo esporádico.",
  },
  {
    text: "La brecha entre tu ingreso y tu egreso es el combustible de tu libertad.",
    author: "Anónimo",
    tip: "Vivir por debajo de tus posibilidades te da la posibilidad de vivir.",
  },
  {
    text: "La meta no es ser rico, es ser libre.",
    author: "El Sistema Infalible de Riqueza",
    tip: "Mide tu avance contra tu Número de Libertad, no contra los demás.",
  },
];
