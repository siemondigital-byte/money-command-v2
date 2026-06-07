"use client";

import { useState } from "react";

/**
 * Afirmación del día. Array de citas aspiracionales sobre dinero/inversión
 * hardcodeado en el cliente; los botones rotan. Estado local, sin llamadas
 * externas (ANEXO §1).
 */
const QUOTES: { text: string; author: string; tip: string }[] = [
  {
    text: "No trabajes por dinero, haz que el dinero trabaje para ti.",
    author: "Robert Kiyosaki",
    tip: "Cada peso que invertís es un empleado que trabaja 24/7 sin descanso.",
  },
  {
    text: "El interés compuesto es la octava maravilla del mundo.",
    author: "Albert Einstein",
    tip: "El tiempo en el mercado vale más que acertar el momento del mercado.",
  },
  {
    text: "La riqueza es la capacidad de vivir plenamente sin trabajar.",
    author: "Henry David Thoreau",
    tip: "Tu meta no es acumular: es que tus flujos pasivos cubran tu vida.",
  },
  {
    text: "No ahorres lo que queda después de gastar; gasta lo que queda después de ahorrar.",
    author: "Warren Buffett",
    tip: "Automatizá tu canasta de Libertad antes de tocar el resto del ingreso.",
  },
  {
    text: "Un presupuesto le dice a tu dinero a dónde ir en vez de preguntarte a dónde se fue.",
    author: "John Maxwell",
    tip: "Dirigir el dinero no es restringir: es elegir mejor.",
  },
  {
    text: "El riesgo viene de no saber lo que estás haciendo.",
    author: "Warren Buffett",
    tip: "Diversificar entre tipos de activo reduce el riesgo sin sacrificar retorno.",
  },
  {
    text: "Construir capital es plantar árboles bajo cuya sombra no esperás sentarte.",
    author: "Proverbio adaptado",
    tip: "El capital queda intacto y crece; vos vivís de sus frutos.",
  },
  {
    text: "La libertad financiera está disponible para quienes la aprenden y trabajan por ella.",
    author: "Robert Kiyosaki",
    tip: "Cada mes que registrás es un dato más para decidir mejor.",
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
    tip: "Antes de un gasto, preguntá cuántas horas de vida cuesta.",
  },
  {
    text: "No es cuánto ganás, es cuánto conservás y multiplicás.",
    author: "Robert Kiyosaki",
    tip: "Tu tasa de ahorro pesa más que tu salario en el largo plazo.",
  },
  {
    text: "El mejor momento para invertir fue hace veinte años. El segundo mejor es hoy.",
    author: "Proverbio de inversión",
    tip: "Empezar pequeño y temprano supera a empezar grande y tarde.",
  },
  {
    text: "La disciplina es el puente entre las metas y los logros.",
    author: "Jim Rohn",
    tip: "Un aporte mensual constante es más poderoso que uno grande y esporádico.",
  },
  {
    text: "Vivir por debajo de tus posibilidades te da la posibilidad de vivir.",
    author: "Anónimo",
    tip: "La brecha entre ingreso y gasto es el combustible de tu libertad.",
  },
  {
    text: "La meta no es ser rico, es ser libre.",
    author: "El Sistema Infalible de Riqueza",
    tip: "Medí tu avance contra tu Número de Libertad, no contra los demás.",
  },
];

export function AffirmationCard() {
  const [i, setI] = useState(0);
  const q = QUOTES[i]!;

  function next() {
    setI((prev) => (prev + 1) % QUOTES.length);
  }

  function random() {
    setI((prev) => {
      if (QUOTES.length <= 1) return prev;
      let n = prev;
      // rota a una cita distinta sin Math.random determinístico problemático
      const step = 1 + ((prev * 7 + 3) % (QUOTES.length - 1));
      n = (prev + step) % QUOTES.length;
      return n === prev ? (prev + 1) % QUOTES.length : n;
    });
  }

  return (
    <section
      className="card fade-up"
      style={{
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      <div className="label">Afirmación del día</div>
      <blockquote
        style={{
          margin: 0,
          fontFamily: "Syne, sans-serif",
          fontSize: "clamp(1.1rem, 3vw, 1.5rem)",
          fontWeight: 700,
          lineHeight: 1.3,
          color: "var(--text)",
        }}
      >
        “{q.text}”
      </blockquote>
      <div style={{ fontSize: "12px", color: "var(--accent-2)" }}>
        — {q.author}
      </div>
      <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>
        {q.tip}
      </p>
      <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
        <button type="button" onClick={next} className="btn-ghost">
          Siguiente
        </button>
        <button type="button" onClick={random} className="btn-ghost">
          Otra cita
        </button>
      </div>

      <style jsx>{`
        .btn-ghost {
          background: var(--surface-2);
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px 16px;
          font-family: "DM Mono", monospace;
          font-size: 12px;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: border-color 0.15s ease;
        }
        .btn-ghost:hover {
          border-color: var(--border-strong);
        }
      `}</style>
    </section>
  );
}
