/**
 * Capa de IA — interfaz GENÉRICA e independiente del proveedor.
 *
 * El resto de la app usa SOLO estos tipos y las funciones expuestas en
 * lib/ai/index.ts. La implementación concreta (Gemini) vive detrás, en
 * lib/ai/gemini.ts. Migrar de proveedor (Anthropic, OpenAI, etc.) = reemplazar
 * la implementación concreta, sin tocar el resto de la app.
 *
 * Esta capa es SERVER-ONLY (ver guards en gemini.ts / index.ts). No debe
 * importarse desde un componente cliente.
 */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Generación de texto (chat / Coach). */
export interface GenerateTextParams {
  /** Instrucción de sistema (rol, doctrina de la marca). Opcional. */
  system?: string;
  /** Conversación. El último mensaje suele ser del usuario. */
  messages: ChatMessage[];
}

/** Generación a partir de una imagen (visión / Escáner). */
export interface GenerateFromImageParams {
  system?: string;
  prompt: string;
  /** Imagen en base64 SIN el prefijo `data:...;base64,`. */
  imageBase64: string;
  /** Tipo MIME de la imagen, ej. "image/jpeg", "image/png". */
  mimeType: string;
}

/** Contrato que cualquier proveedor de IA debe cumplir. */
export interface AIProvider {
  generateText(params: GenerateTextParams): Promise<string>;
  generateFromImage(params: GenerateFromImageParams): Promise<string>;
}

/**
 * Error controlado de la capa de IA. Mensaje apto para mostrar al usuario:
 * NO filtra detalles del proveedor ni de la key. El detalle técnico original
 * queda en `cause` (solo para logging en server, nunca al cliente).
 */
export class AIError extends Error {
  readonly cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "AIError";
    this.cause = cause;
  }
}
