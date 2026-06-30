"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Markdown from "react-markdown";
import { askCoachAction } from "./actions";

/**
 * Chat del Coach (Etapa C). Cliente: conversación en useState durante la sesión
 * (no se persiste, no usa localStorage). Llama a la Server Action askCoachAction
 * (la key de Gemini vive server-only en lib/ai). Las respuestas vienen en
 * markdown y se renderizan con react-markdown (sin HTML crudo, seguro).
 */

type Msg = { role: "user" | "coach"; content: string };

// Preguntas sugeridas (los ejemplos del Coach). Al tocarlas, se envían.
const SUGGESTIONS = [
  "¿Cómo voy?",
  "¿Cuánto me falta para mi libertad?",
  "¿Qué priorizo?",
];

const MAX_LEN = 1000;

// Estilos del markdown del Coach, acordes al tema dark.
const md = {
  p: (props: { children?: React.ReactNode }) => (
    <p style={{ margin: "0 0 8px", lineHeight: 1.6 }}>{props.children}</p>
  ),
  strong: (props: { children?: React.ReactNode }) => (
    <strong style={{ color: "var(--text)", fontWeight: 700 }}>{props.children}</strong>
  ),
  ol: (props: { children?: React.ReactNode }) => (
    <ol style={listStyle}>{props.children}</ol>
  ),
  ul: (props: { children?: React.ReactNode }) => (
    <ul style={listStyle}>{props.children}</ul>
  ),
  li: (props: { children?: React.ReactNode }) => (
    <li style={{ lineHeight: 1.55 }}>{props.children}</li>
  ),
  a: (props: { children?: React.ReactNode; href?: string }) => (
    <a href={props.href} style={{ color: "var(--accent-2)" }}>
      {props.children}
    </a>
  ),
};
const listStyle: CSSProperties = {
  margin: "4px 0 8px",
  paddingLeft: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

export function CoachChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Autoscroll al último mensaje / al indicador de "pensando".
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(question: string) {
    const q = question.trim();
    if (!q || loading) return;
    setError(null);
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await askCoachAction(q);
      if ("ok" in res && res.ok) {
        setMessages((m) => [...m, { role: "coach", content: res.answer }]);
      } else {
        setError("No pude responder ahora, intentá de nuevo.");
      }
    } catch {
      setError("No pude responder ahora, intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void send(input);
  }

  const isEmpty = messages.length === 0;

  return (
    <section
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        borderTop: "2px solid var(--accent)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div className="label">Preguntale al Coach</div>
        <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
          Responde con tus datos reales del mes activo. No es asesoría financiera regulada.
        </p>
      </div>

      {/* Área de conversación */}
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          maxHeight: "420px",
          overflowY: "auto",
          padding: "4px 2px",
        }}
      >
        {isEmpty && !loading && (
          <div
            style={{
              color: "var(--muted)",
              fontSize: "13px",
              lineHeight: 1.6,
              padding: "8px 2px",
            }}
          >
            Escribí una pregunta sobre tus finanzas y el método, o tocá una sugerencia.
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={userBubble}>{m.content}</div>
            </div>
          ) : (
            <div key={i} style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={coachBubble}>
                <Markdown components={md}>{m.content}</Markdown>
              </div>
            </div>
          ),
        )}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ ...coachBubble, color: "var(--muted)" }}>
              <span className="coach-thinking">El Coach está pensando</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={{ color: "var(--danger)", fontSize: "12px" }}>{error}</div>
      )}

      {/* Sugerencias */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => void send(s)}
            disabled={loading}
            style={chipStyle(loading)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input + enviar */}
      <form onSubmit={onSubmit} style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={MAX_LEN}
          disabled={loading}
          placeholder="Escribí tu pregunta…"
          aria-label="Tu pregunta para el Coach"
          style={{ flex: 1, minWidth: 0 }}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={loading || input.trim().length === 0}
          style={{ opacity: loading || input.trim().length === 0 ? 0.6 : 1 }}
        >
          {loading ? "…" : "Enviar"}
        </button>
      </form>

      {/* Animación sutil de los puntos del "pensando" (contenida, sin globals.css) */}
      <style>{`
        .coach-thinking::after {
          content: "";
          animation: coachDots 1.2s steps(4, end) infinite;
        }
        @keyframes coachDots {
          0% { content: ""; }
          25% { content: "."; }
          50% { content: ".."; }
          75% { content: "..."; }
          100% { content: ""; }
        }
      `}</style>
    </section>
  );
}

const userBubble: CSSProperties = {
  maxWidth: "85%",
  background: "rgba(127, 255, 178, 0.12)",
  border: "1px solid rgba(127, 255, 178, 0.4)",
  borderRadius: "12px 12px 2px 12px",
  padding: "10px 12px",
  fontSize: "13px",
  color: "var(--text)",
  lineHeight: 1.5,
  overflowWrap: "anywhere",
};

const coachBubble: CSSProperties = {
  maxWidth: "90%",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "12px 12px 12px 2px",
  padding: "12px 14px",
  fontSize: "13px",
  color: "var(--text)",
  overflowWrap: "anywhere",
};

function chipStyle(disabled: boolean): CSSProperties {
  return {
    background: "var(--surface-2)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: "100px",
    padding: "6px 14px",
    fontFamily: "DM Mono, monospace",
    fontSize: "11px",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.5 : 1,
  };
}
