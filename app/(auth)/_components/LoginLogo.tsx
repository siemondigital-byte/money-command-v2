"use client";

import { useEffect, useState } from "react";

// Logo de marca para la pantalla de login: punto verde + wordmark "The Money
// Command" (Syne, "Command" en acento), con animación typewriter al montar.
//
// Comportamiento:
// - Al cargar, el nombre se escribe letra por letra (una sola vez, no en loop).
// - Cursor vertical parpadeante en la posición de escritura; al terminar queda
//   fijo al final de "Command" (mismo tratamiento que el header).
// - Respeta prefers-reduced-motion: muestra el logo fijo, sin animación.
// - Solo visual: no bloquea el formulario (los campos quedan usables de inmediato).

const LINE1 = "The Money";
const LINE2 = "Command";
const TOTAL = LINE1.length + LINE2.length;
const SPEED_MS = 65; // typewriter suave (~65ms por carácter)

export function LoginLogo() {
  // En SSR y primer paint arranca vacío; la animación lo escribe en useEffect.
  const [revealed, setRevealed] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setAnimate(false);
      setRevealed(TOTAL);
      return;
    }

    const id = setInterval(() => {
      setRevealed((n) => {
        if (n >= TOTAL) {
          clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, SPEED_MS);

    return () => clearInterval(id);
  }, []);

  const line1 = LINE1.slice(0, Math.min(revealed, LINE1.length));
  const line2 = LINE2.slice(0, Math.max(0, revealed - LINE1.length));

  // Cursor en la línea que se está escribiendo; al terminar queda en "Command".
  const cursorOnLine1 = animate && revealed < LINE1.length;
  const cursorOnLine2 = animate && revealed >= LINE1.length;

  // El punto verde aparece desde el inicio de la animación (marca presente).
  const Cursor = () => (
    <span className="terminal-cursor" aria-hidden="true" />
  );

  return (
    <span
      className="logo-wordmark"
      aria-label="The Money Command"
      style={{
        position: "relative",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {/* Punto verde con glow (marca), a la izquierda del wordmark. */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-18px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: "var(--accent)",
          boxShadow: "0 0 12px var(--accent)",
        }}
      />
      <span className="logo-line" aria-hidden="true">
        {/* zero-width space para conservar la altura de línea mientras se escribe */}
        {line1 || "​"}
        {cursorOnLine1 && <Cursor />}
      </span>
      <span className="logo-line-accent" aria-hidden="true">
        {line2 || "​"}
        {cursorOnLine2 && <Cursor />}
      </span>
    </span>
  );
}
