"use client";

import { useState } from "react";
import { COACH_CONCEPTS } from "@/lib/coach-content";

/**
 * Bloque "Concepto del día" del Coach.
 *
 * Muestra UN concepto (título + cápsula). El índice del día se calcula por
 * fecha en el server (determinístico: el mismo día muestra el mismo concepto)
 * y llega como `initialIndex`. "Explícamelo más" despliega/oculta la versión
 * larga (estado local). "Otro concepto" rota a otro distinto. No persiste nada.
 */
export function ConceptOfTheDay({ initialIndex }: { initialIndex: number }) {
  const total = COACH_CONCEPTS.length;
  const safeInitial = ((initialIndex % total) + total) % total;
  const [index, setIndex] = useState(safeInitial);
  const [showExplanation, setShowExplanation] = useState(false);

  const concept = COACH_CONCEPTS[index]!;

  function otherConcept() {
    setIndex((i) => (i + 1) % total);
    setShowExplanation(false);
  }

  const ghostBtn: React.CSSProperties = {
    background: "var(--surface-2)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "8px 14px",
    fontFamily: "DM Mono, monospace",
    fontSize: "12px",
    letterSpacing: "0.03em",
    cursor: "pointer",
  };

  return (
    <section
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        borderTop: "2px solid var(--accent)",
      }}
    >
      <div className="label">Concepto del día</div>

      <h2
        style={{
          fontFamily: "Syne, sans-serif",
          fontWeight: 800,
          fontSize: "clamp(1.05rem, 3.5vw, 1.4rem)",
          color: "var(--text)",
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        {concept.titulo}
      </h2>

      <p
        style={{
          fontSize: "14px",
          color: "var(--text-2, #b9b9c8)",
          margin: 0,
          lineHeight: 1.6,
          overflowWrap: "anywhere",
        }}
      >
        {concept.capsula}
      </p>

      {showExplanation && (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "12px",
            marginTop: "2px",
          }}
        >
          <div
            className="label"
            style={{ color: "var(--accent-2)", marginBottom: "8px" }}
          >
            Explícamelo más
          </div>
          <p
            style={{
              fontSize: "13px",
              color: "var(--muted)",
              margin: 0,
              lineHeight: 1.7,
              overflowWrap: "anywhere",
            }}
          >
            {concept.explicacion}
          </p>
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "4px" }}>
        <button
          type="button"
          onClick={() => setShowExplanation((v) => !v)}
          aria-expanded={showExplanation}
          style={{
            ...ghostBtn,
            color: "var(--accent)",
            borderColor: "rgba(127, 255, 178, 0.35)",
          }}
        >
          {showExplanation ? "Ocultar" : "Explícamelo más"}
        </button>
        <button type="button" onClick={otherConcept} style={ghostBtn}>
          Otro concepto
        </button>
      </div>
    </section>
  );
}
