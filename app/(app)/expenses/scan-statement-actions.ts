"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  activePeriod,
  consolidatePeriodFromLiveEntities,
  type Period,
} from "@/lib/monthly";
import { classificationFromBasket, type Basket } from "@/lib/expenses";
import { generateFromDocument, generateText, AIError } from "@/lib/ai";
import { STATEMENT_EXTRACTION_PROMPT } from "@/lib/ai/statement-prompt";

/**
 * Lector de extractos de tarjeta — Etapa 1: SOLO extracción.
 *
 * scanStatementAction recibe un FormData con DOS caminos posibles:
 *   - campo "text": el TEXTO ya extraído del PDF en el cliente (pdfjs). Camino
 *     PRINCIPAL para PDFs de texto. Se procesa como generación de TEXTO (no
 *     visión): string liviano, sin base64, sin costo de imagen.
 *   - campo "file" (Blob) + "mimeType": FALLBACK para fotos o PDFs escaneados
 *     (sin texto extraíble). El base64 se arma EN EL SERVIDOR y va como visión.
 * En ambos casos se manda a Gemini vía lib/ai (server-only) y se devuelve la
 * LISTA de compras extraídas. NO crea gastos, NO toca la base, NO consolida.
 *
 * Por qué texto (o FormData/Blob) y no un base64 string como argumento: un PDF
 * renderizado a imagen y serializado como argumento gatillaba "Maximum array
 * nesting exceeded". El texto pesa pocos KB; el Blob lo STREAMEA Next. Sin ese
 * límite en ninguno de los dos caminos.
 *
 * PENDIENTE (NO construir hasta validar la extracción con un resumen real):
 *   - Etapa 2 (pantalla de REVISIÓN): tomar `data` y mostrar por compra una fila
 *     editable (comercio, monto, fecha, categoría, canasta; pre-cargadas por la
 *     IA, editables), un checkbox incluir/excluir, y una marca "posible
 *     duplicado" cuando comercio+monto+fecha coincida con un gasto ya existente
 *     del período. Más un resumen (cantidad, total) y un botón confirmar.
 *   - Etapa 3 (creación): una action de lote con prisma.expense.createMany +
 *     UNA sola reconsolidateActivePeriod (ya diagnosticado). Ahí se usa
 *     purchaseDate (migración pendiente de aplicar).
 */

/** Un cargo/compra extraído del resumen (sugerencias; la persona confirma). */
export interface StatementItem {
  comercio: string;
  /** YYYY-MM-DD o "" si no se leyó. */
  fecha: string;
  /** Monto del cargo (para cuotas, la cuota del período). */
  monto: number;
  categoria_sugerida: string;
  canasta_sugerida: "essentials" | "style" | "freedom";
  confianza: "alta" | "media" | "baja";
}

export type ScanStatementResult =
  // `itemsJson` = JSON.stringify(StatementItem[]). Se manda como STRING (un
  // escalar para la serialización de Server Actions) y NO como array, para no
  // gatillar "Maximum array nesting exceeded" de Flight con listas largas
  // (100+ movimientos). El cliente hace JSON.parse.
  | { ok: true; itemsJson: string }
  | { error: string };

// Tipos aceptados y tope de sanidad del archivo (bytes). El transporte lo limita
// bodySizeLimit=8mb; esto evita procesar algo absurdo.
const isAllowedMime = (m: string) =>
  m.startsWith("image/") || m === "application/pdf";
const MAX_FILE_BYTES = 9_000_000;

// Forma de cada item que devuelve el modelo (parseo tolerante).
const itemSchema = z.object({
  comercio: z.string().optional().default(""),
  fecha: z.string().optional().default(""),
  monto: z.coerce.number(),
  categoria_sugerida: z.string().optional().default(""),
  canasta_sugerida: z.enum(["essentials", "style", "freedom"]).catch("essentials"),
  confianza: z.enum(["alta", "media", "baja"]).catch("media"),
});

const READ_ERROR =
  "No pude leer el resumen, intentá con otra foto o PDF más claro.";

/** Quita cercos de markdown (```json ... ```), por si el modelo los agrega. */
function stripFences(s: string): string {
  const t = s.trim();
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return (m ? m[1]! : t).trim();
}

// Tope de sanidad del texto extraído del PDF (caracteres). Un extracto de texto
// pesa pocos KB; esto evita mandar algo absurdo al modelo.
const MAX_TEXT_CHARS = 500_000;

// Opciones de salida compartidas por ambos caminos (texto e imagen). Extractos
// largos (100+ movimientos): subimos el tope de salida, apagamos el thinking
// (libera presupuesto) y forzamos JSON, para que la lista NO se trunque.
const EXTRACTION_OUTPUT = {
  maxOutputTokens: 65536,
  minimalReasoning: true,
  jsonOutput: true,
} as const;

/**
 * Parsea la respuesta del modelo (JSON con { compras: [...] }) a la lista de
 * items validados. Devuelve null si no hay JSON usable o quedó vacía → el
 * llamador responde READ_ERROR. Compartido por el camino de texto y el de imagen.
 */
function parseCompras(modelText: string): StatementItem[] | null {
  let raw: unknown;
  try {
    raw = JSON.parse(stripFences(modelText));
  } catch {
    return null;
  }

  const comprasRaw =
    raw && typeof raw === "object" && Array.isArray((raw as { compras?: unknown }).compras)
      ? (raw as { compras: unknown[] }).compras
      : null;
  if (!comprasRaw) return null;

  const data: StatementItem[] = comprasRaw
    .map((it) => itemSchema.safeParse(it))
    .flatMap((r) => (r.success ? [r.data] : []))
    .filter((d) => Number.isFinite(d.monto) && d.monto > 0)
    .map((d) => ({ ...d, monto: Math.round(d.monto * 100) / 100 }));

  return data.length > 0 ? data : null;
}

export async function scanStatementAction(
  formData: FormData,
): Promise<ScanStatementResult> {
  await requireUser();

  const textField = formData.get("text");
  const fileField = formData.get("file");

  let modelText: string;
  try {
    if (typeof textField === "string" && textField.trim().length > 0) {
      // CAMINO PRINCIPAL: el cliente extrajo el TEXTO del PDF (pdfjs) y lo mandó
      // como string liviano. Se procesa como generación de TEXTO (no visión):
      // sin base64 gigante, sin límite de serialización, sin costo de imagen.
      if (textField.length > MAX_TEXT_CHARS) {
        return { error: "El resumen es demasiado grande." };
      }
      modelText = await generateText({
        system: STATEMENT_EXTRACTION_PROMPT,
        messages: [{ role: "user", content: textField }],
        ...EXTRACTION_OUTPUT,
      });
    } else if (fileField instanceof Blob && fileField.size > 0) {
      // FALLBACK: fotos o PDFs escaneados (sin texto extraíble). Se manda como
      // imagen/PDF (visión). El base64 se arma EN EL SERVIDOR.
      const mimeType = String(formData.get("mimeType") ?? "");
      if (fileField.size > MAX_FILE_BYTES) {
        return { error: "El archivo es demasiado grande." };
      }
      if (!isAllowedMime(mimeType)) {
        return { error: "Tipo de archivo no soportado (usá imagen o PDF)." };
      }
      const fileBase64 = Buffer.from(await fileField.arrayBuffer()).toString("base64");
      modelText = await generateFromDocument({
        prompt: STATEMENT_EXTRACTION_PROMPT,
        fileBase64,
        mimeType,
        ...EXTRACTION_OUTPUT,
      });
    } else {
      return { error: "Falta el archivo." };
    }
  } catch (err) {
    const message = err instanceof AIError ? err.message : READ_ERROR;
    console.error("[scanStatement] IA falló:", err);
    return { error: message };
  }

  const data = parseCompras(modelText);
  if (!data) {
    return { error: READ_ERROR };
  }

  // La lista viaja como STRING (JSON), no como array, para no gatillar el límite
  // de anidamiento de Flight al devolverla del Server Action al cliente.
  return { ok: true, itemsJson: JSON.stringify(data) };
}

// ============================================================================
// Etapa 3 — Creación REAL en lote de los gastos confirmados por el usuario.
//
// Escribe en la base. NO toca createExpenseAction (creación manual individual),
// ni la consolidación en sí (consolidatePeriodFromLiveEntities): SOLO la llama
// UNA vez al final. Los gastos se estampan en el PERÍODO ACTIVO (Opción A),
// guardando la fecha real de cada compra en purchaseDate.
// ============================================================================

export type CreateBatchResult =
  | { ok: true; creados: number }
  | { error: string };

// Item confirmado por el usuario (ya editado en la pantalla de revisión).
// Tolerante: la IA puede dejar campos vacíos; acá derivamos defaults seguros.
const batchItemSchema = z.object({
  comercio: z.string().trim().max(120).optional().default(""),
  monto: z.coerce.number().finite(),
  fecha: z.string().trim().optional().default(""),
  categoria: z.string().trim().max(60).optional().default(""),
  canasta: z.enum(["essentials", "style", "freedom"]),
});

// Lista de items. Llega como STRING JSON (un escalar) para no gatillar el límite
// de anidamiento de Flight al pasar el argumento del cliente al Server Action.
const batchSchema = z.array(batchItemSchema).min(1).max(300);

/** "YYYY-MM-DD" → Date (UTC medianoche). Cualquier otra cosa → null. */
function parsePurchaseDate(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function decimal(n: number): Prisma.Decimal {
  return new Prisma.Decimal(Math.round(n * 100) / 100);
}

// Helpers locales (mismos que expenses/actions.ts; replicados para NO exportar
// ni tocar ese archivo). getActivePeriod lee el perfil; reconsolidate llama a la
// fuente única de consolidación.
async function getActivePeriod(userId: string): Promise<Period | null> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { activeYear: true, activeMonth: true },
  });
  if (!profile) return null;
  return activePeriod(profile);
}

export async function createExpensesBatchAction(
  payloadJson: string,
): Promise<CreateBatchResult> {
  const { user } = await requireUser();

  let raw: unknown;
  try {
    raw = JSON.parse(payloadJson);
  } catch {
    return { error: "Datos inválidos." };
  }

  const parsed = batchSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "No hay compras válidas para crear." };
  }

  // Filtramos montos <= 0 (por si alguno quedó editado a 0) y armamos las filas.
  const items = parsed.data.filter((it) => Number.isFinite(it.monto) && it.monto > 0);
  if (items.length === 0) {
    return { error: "No hay compras válidas para crear." };
  }

  const period = await getActivePeriod(user.id);
  if (!period) return { error: "No se encontró el perfil del usuario." };

  const rows = items.map((it) => {
    // type = "variable" para todas: los totales del mes se derivan de basket +
    // amount (no de type), así que esto no altera la consolidación y evita
    // complejidad. name/category caen a un default legible si vienen vacíos.
    const name = it.comercio || "Movimiento de tarjeta";
    const category = it.categoria || "otros";
    return {
      userId: user.id,
      name,
      category,
      type: "variable",
      basket: it.canasta,
      // columna legacy NOT NULL: derivada del basket (igual que createExpenseAction)
      classification: classificationFromBasket(it.canasta as Basket),
      periodicity: "monthly",
      amount: decimal(it.monto),
      year: period.year,
      month: period.month,
      purchaseDate: parsePurchaseDate(it.fecha),
    };
  });

  try {
    await prisma.expense.createMany({ data: rows });
  } catch (err) {
    console.error("[createExpensesBatch] failed:", err);
    return {
      error: `Error al crear: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // UNA sola consolidación del período (NO una por gasto).
  try {
    await consolidatePeriodFromLiveEntities(user.id, period);
  } catch (err) {
    console.error("[createExpensesBatch] reconsolidate failed:", err);
  }

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/history");

  return { ok: true, creados: rows.length };
}
