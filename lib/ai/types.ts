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

/** Opciones de salida del modelo (comunes a texto y documento). */
export interface OutputOptions {
  /**
   * Máximo de tokens de SALIDA. Para respuestas largas (ej. extractos con
   * muchos movimientos) hay que subirlo para que el JSON no se trunque.
   */
  maxOutputTokens?: number;
  /** Forzar salida JSON estricta (reduce errores de parseo). */
  jsonOutput?: boolean;
  /**
   * Minimizar el "razonamiento" del modelo. Libera presupuesto de salida para
   * la respuesta (útil en extracción de listas, donde no hace falta que piense).
   */
  minimalReasoning?: boolean;
}

/** Generación de texto (chat / Coach, o extracción sobre texto). */
export interface GenerateTextParams extends OutputOptions {
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

/**
 * Generación a partir de un DOCUMENTO: imagen (`image/*`) o PDF
 * (`application/pdf`). Generaliza el caso de visión para el lector de extractos.
 */
export interface GenerateFromDocumentParams extends OutputOptions {
  system?: string;
  prompt: string;
  /** Archivo en base64 SIN el prefijo `data:...;base64,`. */
  fileBase64: string;
  /** Tipo MIME: "image/jpeg", "image/png", … o "application/pdf". */
  mimeType: string;
}

/** Contrato que cualquier proveedor de IA debe cumplir. */
export interface AIProvider {
  generateText(params: GenerateTextParams): Promise<string>;
  /** Documento (imagen o PDF). Es el método general para visión. */
  generateFromDocument(params: GenerateFromDocumentParams): Promise<string>;
  /** Alias retrocompatible de generateFromDocument para imágenes. */
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
