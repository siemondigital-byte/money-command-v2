"use server";

import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { gatherCoachData } from "@/lib/coach-data";
import { formatCoachContext } from "@/lib/ai/coach-context";
import { COACH_SYSTEM_PROMPT as COACH_PROMPT_ES } from "@/lib/ai/coach-prompt";
import { COACH_SYSTEM_PROMPT as COACH_PROMPT_EN } from "@/lib/ai/coach-prompt.en";
import { generateText, AIError } from "@/lib/ai";

/**
 * Server Action del Coach con IA. Recibe la pregunta del usuario, arma su
 * contexto financiero REAL (los mismos datos que muestra la app) y lo manda a
 * la capa lib/ai (Gemini, server-only). La key nunca toca el cliente.
 *
 * NO está cableada a ninguna UI todavía (Etapa B). Se usa la misma respuesta
 * estándar del proyecto: { ok, answer } | { error }.
 */

export type CoachActionResult =
  | { ok: true; answer: string }
  | { error: string };

const questionSchema = z
  .string()
  .trim()
  .min(1, "Escribe una pregunta.")
  .max(1000, "La pregunta es muy larga (máximo 1000 caracteres).");

export async function askCoachAction(
  question: string,
): Promise<CoachActionResult> {
  const { user, profile } = await requireUser();

  const parsed = questionSchema.safeParse(question);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Pregunta inválida." };
  }

  try {
    // Contexto financiero real del usuario (solo lectura, mismos valores que la app).
    const data = await gatherCoachData({
      userId: user.id,
      activeYear: profile.activeYear,
      activeMonth: profile.activeMonth,
    });
    const context = formatCoachContext(data, profile.currency);

    // System prompt por idioma del perfil ("en" → inglés; resto → español).
    // Solo cambia el prompt; la concatenación de datos y la llamada al modelo
    // quedan igual.
    const coachPrompt =
      profile.locale === "en" ? COACH_PROMPT_EN : COACH_PROMPT_ES;

    // System prompt (constante) + datos reales del usuario. La pregunta va como
    // mensaje de usuario.
    const system = `${coachPrompt}\n\n=== DATOS DEL USUARIO (reales, usa SOLO estos) ===\n${context}`;

    const answer = await generateText({
      system,
      messages: [{ role: "user", content: parsed.data }],
    });

    return { ok: true, answer };
  } catch (err) {
    const message =
      err instanceof AIError
        ? err.message
        : "No se pudo obtener la respuesta del Coach.";
    console.error("[askCoach] fallo:", err);
    return { error: message };
  }
}
