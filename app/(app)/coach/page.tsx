import { requireUser } from "@/lib/auth";
import { buildScorecard } from "@/lib/coach";
import { gatherCoachData } from "@/lib/coach-data";
import {
  conceptIndexForDate,
  reminderIndexForDate,
  challengeIndexForDate,
  COACH_REMINDERS,
  COACH_CHALLENGES,
} from "@/lib/coach-content";
import { Scorecard } from "./Scorecard";
import { ConceptOfTheDay } from "./ConceptOfTheDay";
import { CoachChat } from "./CoachChat";

export const metadata = { title: "Coach · The Money Command" };

export default async function CoachPage() {
  const { user, profile } = await requireUser();

  // Solo LECTURA. Misma lógica que antes, ahora compartida con la Server Action
  // del Coach (lib/coach-data). El scorecard sale del MISMO `inputs` de siempre.
  const data = await gatherCoachData({
    userId: user.id,
    activeYear: profile.activeYear,
    activeMonth: profile.activeMonth,
  });
  const scorecard = buildScorecard(data.inputs);

  // Contenido rotativo por fecha (determinístico, se calcula en el server).
  const now = new Date();
  const conceptIndex = conceptIndexForDate(now);
  const reminder = COACH_REMINDERS[reminderIndexForDate(now)]!;
  const challenge = COACH_CHALLENGES[challengeIndexForDate(now)]!;

  return (
    <div className="fade-up flex flex-col gap-6">
      <header>
        <div className="label mb-1">Coach</div>
        <h1>Tu Coach financiero</h1>
        <p style={{ color: "var(--muted)", fontSize: "13px", marginTop: "8px" }}>
          Preguntale lo que quieras sobre tus finanzas y el método: responde con
          tus datos reales del mes activo. Abajo, cinco métricas leen tus módulos
          para darte una foto de tu salud financiera. Es solo lectura: no cambia
          ninguno de tus datos.
        </p>
      </header>

      <CoachChat />

      <ConceptOfTheDay initialIndex={conceptIndex} />

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
        <div className="label">Recordatorio del día</div>
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
        <div className="label">Reto de la semana</div>
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

      <Scorecard scorecard={scorecard} />
    </div>
  );
}
