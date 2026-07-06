import { requireUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import { getServerDict } from "@/lib/i18n/server";
import { buildScorecard } from "@/lib/coach";
import { gatherCoachData } from "@/lib/coach-data";
import {
  conceptIndexForDate,
  reminderIndexForDate,
  challengeIndexForDate,
} from "@/lib/coach-content";
import { coachContentForLocale } from "@/lib/coach-locale";
import { Scorecard } from "./Scorecard";
import { ConceptOfTheDay } from "./ConceptOfTheDay";
import { CoachChat } from "./CoachChat";

export async function generateMetadata() {
  return { title: (await getServerDict()).metadata.coach };
}

export default async function CoachPage() {
  const { user, profile } = await requireUser();

  // Solo LECTURA. Misma lógica que antes, ahora compartida con la Server Action
  // del Coach (lib/coach-data). El scorecard sale del MISMO `inputs` de siempre.
  const data = await gatherCoachData({
    userId: user.id,
    activeYear: profile.activeYear,
    activeMonth: profile.activeMonth,
  });
  const scorecard = buildScorecard(data.inputs, profile.locale as "es" | "en");

  // Chrome del módulo por idioma del perfil.
  const dict = getDict(profile.locale);
  const c = dict.coach;

  // Contenido rotativo por fecha (determinístico, se calcula en el server).
  // El texto sale del idioma del perfil; los índices por fecha son compartidos.
  const content = coachContentForLocale(profile.locale);
  const now = new Date();
  const conceptIndex = conceptIndexForDate(now);
  const reminder = content.reminders[reminderIndexForDate(now)]!;
  const challenge = content.challenges[challengeIndexForDate(now)]!;

  return (
    <div className="fade-up flex flex-col gap-6">
      <header>
        <div className="label mb-1">{c.pageLabel}</div>
        <h1>{c.title}</h1>
        <p style={{ color: "var(--muted)", fontSize: "13px", marginTop: "8px" }}>
          {c.intro}
        </p>
      </header>

      <CoachChat />

      <ConceptOfTheDay initialIndex={conceptIndex} concepts={content.concepts} />

      {/* Recordatorio del día (una frase ancla, rota por día) */}
      <section
        className="card"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          borderLeft: "3px solid var(--accent-2)",
        }}
      >
        <div className="label">{c.reminderLabel}</div>
        <p
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(0.95rem, 2.6vw, 1.15rem)",
            color: "var(--text)",
            margin: 0,
            lineHeight: 1.4,
            overflowWrap: "anywhere",
          }}
        >
          {reminder}
        </p>
      </section>

      {/* Reto de la semana (rota cada 7 días) */}
      <section
        className="card"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          borderTop: "2px solid var(--gold)",
        }}
      >
        <div className="label">{c.challengeLabel}</div>
        <h2
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(1rem, 3vw, 1.25rem)",
            color: "var(--text)",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {challenge.titulo}
        </h2>
        <p
          style={{
            fontSize: "13px",
            color: "var(--muted)",
            margin: 0,
            lineHeight: 1.7,
            overflowWrap: "anywhere",
          }}
        >
          {challenge.descripcion}
        </p>
      </section>

      <Scorecard scorecard={scorecard} labels={c.scorecard} />
    </div>
  );
}
