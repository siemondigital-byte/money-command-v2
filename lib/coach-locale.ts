/**
 * Selección del contenido rotativo del Coach por idioma.
 *
 * El contenido vive en dos archivos con el MISMO shape:
 *   - coach-content.ts    → español (fuente + tipos + funciones de índice)
 *   - coach-content.en.ts → inglés
 *
 * Las funciones de índice por fecha (conceptIndexForDate / reminderIndexForDate
 * / challengeIndexForDate) son COMPARTIDAS y viven en coach-content.ts: NO se
 * duplican por idioma. Acá solo elegimos QUÉ arrays usar según el locale del
 * perfil ("en" → inglés; cualquier otro → español). La lógica de rotación no
 * se toca. Los tres arrays tienen la misma cantidad de ítems en ambos idiomas,
 * así que el índice compartido siempre cae en rango.
 */
import {
  COACH_CONCEPTS as CONCEPTS_ES,
  COACH_REMINDERS as REMINDERS_ES,
  COACH_CHALLENGES as CHALLENGES_ES,
  type CoachConcept,
  type CoachChallenge,
} from "./coach-content";
import {
  COACH_CONCEPTS as CONCEPTS_EN,
  COACH_REMINDERS as REMINDERS_EN,
  COACH_CHALLENGES as CHALLENGES_EN,
} from "./coach-content.en";

export interface CoachContent {
  concepts: CoachConcept[];
  reminders: string[];
  challenges: CoachChallenge[];
}

/** Contenido del Coach para el locale dado. "en" → inglés; resto → español. */
export function coachContentForLocale(locale: string): CoachContent {
  return locale === "en"
    ? { concepts: CONCEPTS_EN, reminders: REMINDERS_EN, challenges: CHALLENGES_EN }
    : { concepts: CONCEPTS_ES, reminders: REMINDERS_ES, challenges: CHALLENGES_ES };
}
