"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/i18n/provider";
import type { Affirmation } from "@/lib/affirmations";

/**
 * Afirmación del día. Una frase célebre + un tip que cambian AUTOMÁTICAMENTE
 * cada 10 segundos (setInterval en el client). Estado local, sin llamadas
 * externas (ANEXO REDISENO §Cambios de contenido).
 *
 * Las frases llegan por prop, ya elegidas por idioma del perfil en el server
 * (lib/affirmations · affirmations.en). La rotación no depende del idioma.
 */
export function AffirmationCard({ quotes }: { quotes: Affirmation[] }) {
  const t = useTranslations();
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setI((prev) => (prev + 1) % quotes.length);
    }, 10000);
    return () => clearInterval(id);
  }, [quotes.length]);

  const q = quotes[i]!;

  return (
    <section className="d-card top-mint" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div className="d-section-label">{t.dashboard.affirmationLabel}</div>
      <blockquote
        key={i}
        className="fade-up"
        style={{
          margin: 0,
          fontFamily: "Syne, sans-serif",
          fontSize: "clamp(1rem, 2.4vw, 1.3rem)",
          fontWeight: 700,
          lineHeight: 1.3,
          color: "var(--text)",
        }}
      >
        “{q.text}”
        <span style={{ display: "block", fontSize: "12px", color: "var(--accent-2)", fontFamily: "DM Mono, monospace", fontWeight: 400, marginTop: "8px" }}>
          — {q.author}
        </span>
      </blockquote>
      <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>{q.tip}</p>
    </section>
  );
}
