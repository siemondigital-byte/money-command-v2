/**
 * Implementación concreta del proveedor de IA para Google Gemini, usando el SDK
 * oficial @google/genai. ESTE es el ÚNICO archivo que importa @google/genai.
 *
 * SERVER-ONLY: la API key se lee únicamente acá, desde process.env.GEMINI_API_KEY
 * (sin prefijo NEXT_PUBLIC_, así nunca llega al cliente). La key NO se hardcodea
 * ni se loggea en ningún momento.
 *
 * Modelo: gemini-2.5-flash (multimodal: texto + imagen).
 */

import { GoogleGenAI } from "@google/genai";
import {
  AIError,
  type AIProvider,
  type GenerateFromImageParams,
  type GenerateTextParams,
} from "./types";

// Guard server-only: si este módulo llegara a ejecutarse en el browser, falla
// de inmediato (defensa en profundidad, además de no llevar prefijo NEXT_PUBLIC_).
if (typeof window !== "undefined") {
  throw new Error(
    "lib/ai/gemini es server-only y no debe importarse desde el cliente.",
  );
}

const MODEL_TEXT = "gemini-2.5-flash";
// gemini-2.5-flash es multimodal, así que sirve también para visión (Escáner).
const MODEL_VISION = "gemini-2.5-flash";

/**
 * Crea el cliente leyendo la key SOLO en server y de forma perezosa (no al
 * importar el módulo, para no romper imports si falta la config). Nunca loggea
 * la key.
 */
function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AIError("Falta la configuración del proveedor de IA.");
  }
  return new GoogleGenAI({ apiKey });
}

/** Mapea los mensajes genéricos al formato `contents` de @google/genai. */
function toContents(messages: GenerateTextParams["messages"]) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

export const geminiProvider: AIProvider = {
  async generateText({ system, messages }: GenerateTextParams): Promise<string> {
    try {
      const ai = getClient();
      const response = await ai.models.generateContent({
        model: MODEL_TEXT,
        contents: toContents(messages),
        config: system ? { systemInstruction: system } : undefined,
      });
      const text = response.text;
      if (!text) throw new AIError("El modelo no devolvió texto.");
      return text;
    } catch (err) {
      if (err instanceof AIError) throw err;
      // No filtramos el detalle del proveedor al llamador; queda en `cause`.
      throw new AIError("No se pudo generar la respuesta de IA.", err);
    }
  },

  async generateFromImage({
    system,
    prompt,
    imageBase64,
    mimeType,
  }: GenerateFromImageParams): Promise<string> {
    try {
      const ai = getClient();
      const response = await ai.models.generateContent({
        model: MODEL_VISION,
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: imageBase64 } },
            ],
          },
        ],
        config: system ? { systemInstruction: system } : undefined,
      });
      const text = response.text;
      if (!text) throw new AIError("El modelo no devolvió texto.");
      return text;
    } catch (err) {
      if (err instanceof AIError) throw err;
      throw new AIError("No se pudo analizar la imagen con IA.", err);
    }
  },
};
