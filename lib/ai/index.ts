/**
 * Punto de entrada ÚNICO de la capa de IA.
 *
 * El resto de la app importa SIEMPRE desde acá (`@/lib/ai`), nunca de gemini.ts
 * ni de @google/genai directamente. Para migrar de proveedor, se cambia solo la
 * línea `provider = ...`.
 *
 * SERVER-ONLY: no debe importarse desde un componente cliente.
 */

import { geminiProvider } from "./gemini";
import type { AIProvider } from "./types";

if (typeof window !== "undefined") {
  throw new Error("lib/ai es server-only y no debe importarse desde el cliente.");
}

// Proveedor activo. Cambiar esta línea (y agregar su implementación) para migrar.
const provider: AIProvider = geminiProvider;

/** Genera texto (chat / Coach). Ver GenerateTextParams. */
export const generateText: AIProvider["generateText"] = (params) =>
  provider.generateText(params);

/** Genera texto a partir de una imagen (visión / Escáner). */
export const generateFromImage: AIProvider["generateFromImage"] = (params) =>
  provider.generateFromImage(params);

export { AIError } from "./types";
export type {
  AIProvider,
  ChatMessage,
  GenerateTextParams,
  GenerateFromImageParams,
} from "./types";
