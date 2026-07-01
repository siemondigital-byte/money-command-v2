/**
 * Utilidades CLIENT-SIDE del escáner de resúmenes (Etapa 2). Solo corren en el
 * navegador (usan document/Image/FileReader/pdf.js). Preparan el archivo para
 * mandarlo a scanStatementAction: comprimir imágenes, y DESBLOQUEAR PDFs
 * protegidos con contraseña ENTERAMENTE en el navegador.
 *
 * SEGURIDAD: la contraseña del PDF se usa SOLO acá (pdf.js, en el browser) y
 * NUNCA se incluye en lo que se envía al servidor. Al servidor solo va el
 * contenido ya desbloqueado (imagen JPEG de las páginas) o el PDF sin proteger.
 */

export interface PreparedFile {
  /** El archivo listo para enviar como Blob (imagen JPEG o PDF). */
  blob: Blob;
  mimeType: string;
}

const MAX_IMAGE_DIM = 1024;
// Payload liviano: calidad media, tope de páginas más bajo y escala menor.
const JPEG_QUALITY = 0.7;
const MAX_PDF_PAGES = 8;
const COMBINED_WIDTH = 1024;
const PDF_RENDER_SCALE = 1.3;

export function isPdf(file: File): boolean {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

export function isImage(file: File): boolean {
  return file.type.startsWith("image/");
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("No se pudo generar la imagen.")),
      "image/jpeg",
      quality,
    );
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo cargar la imagen."));
    };
    img.src = url;
  });
}

/** Comprime/redimensiona una imagen a JPEG (~1024px) para no exceder el límite. */
export async function compressImage(file: File): Promise<PreparedFile> {
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_IMAGE_DIM / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen.");
  ctx.drawImage(img, 0, 0, w, h);
  const blob = await canvasToBlob(canvas, JPEG_QUALITY);
  return { blob, mimeType: "image/jpeg" };
}

/** PDF sin protección: se manda tal cual (el File ya es un Blob). */
export function pdfToBlob(file: File): PreparedFile {
  return { blob: file, mimeType: "application/pdf" };
}

// pdf.js se carga dinámicamente (no entra al bundle inicial). El worker usa el
// .mjs bundleado.
async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
  }
  return pdfjs;
}

/** Detecta (en el navegador) si el PDF está protegido con contraseña. */
export async function isPdfPasswordProtected(file: File): Promise<boolean> {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  try {
    await pdfjs.getDocument({ data }).promise;
    return false;
  } catch (err) {
    return (err as { name?: string })?.name === "PasswordException";
  }
}

/** Error de contraseña incorrecta al desbloquear (para mensaje amable en la UI). */
export class WrongPasswordError extends Error {
  constructor() {
    super("Contraseña incorrecta.");
    this.name = "WrongPasswordError";
  }
}

// El texto es liviano, así que podemos recorrer más páginas que en el render.
const MAX_PDF_TEXT_PAGES = 30;

/**
 * Extrae el TEXTO del PDF con pdf.js (getTextContent por página), en el
 * navegador. Camino principal para PDFs de texto: se manda ese texto (pocos KB)
 * al server, sin renderizar a imagen. `password` (si el PDF está protegido) se
 * usa SOLO acá y nunca sale del navegador. Devuelve "" si el PDF no tiene texto
 * (escaneado) → el llamador cae al fallback de imagen.
 */
export async function extractPdfText(
  file: File,
  password?: string,
): Promise<string> {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());

  let doc;
  try {
    doc = await pdfjs.getDocument(
      password ? { data, password } : { data },
    ).promise;
  } catch (err) {
    if ((err as { name?: string })?.name === "PasswordException") {
      throw new WrongPasswordError();
    }
    throw new Error("No se pudo abrir el PDF.");
  }

  const pageCount = Math.min(doc.numPages, MAX_PDF_TEXT_PAGES);
  const parts: string[] = [];
  for (let p = 1; p <= pageCount; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((it) => ("str" in it ? it.str : ""))
      .join(" ");
    parts.push(pageText);
  }
  return parts.join("\n").trim();
}

/** ¿Hay suficiente texto como para usar el camino de texto (vs imagen)? */
export function hasEnoughText(text: string): boolean {
  return text.trim().length >= 40;
}

/**
 * Desbloquea el PDF con la contraseña (SOLO en el navegador) y lo renderiza a
 * UNA imagen JPEG con las páginas apiladas. La contraseña no sale de acá.
 */
export async function unlockPdfToImage(
  file: File,
  password: string,
): Promise<PreparedFile> {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());

  let doc;
  try {
    doc = await pdfjs.getDocument({ data, password }).promise;
  } catch (err) {
    const e = err as { name?: string; code?: number };
    // PasswordException con code 2 = contraseña incorrecta.
    if (e?.name === "PasswordException") throw new WrongPasswordError();
    throw new Error("No se pudo abrir el PDF.");
  }

  const pageCount = Math.min(doc.numPages, MAX_PDF_PAGES);
  const canvases: HTMLCanvasElement[] = [];
  for (let p = 1; p <= pageCount; p++) {
    const page = await doc.getPage(p);
    const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo renderizar el PDF.");
    // El cast evita fricción con variantes de tipos de RenderParameters.
    await page.render({ canvasContext: ctx, viewport, canvas } as never).promise;
    canvases.push(canvas);
  }

  // Apilar verticalmente, escalando cada página a un ancho común.
  const targetW = Math.min(
    COMBINED_WIDTH,
    Math.max(...canvases.map((c) => c.width)),
  );
  const scaled = canvases.map((c) => ({
    src: c,
    w: targetW,
    h: Math.round((c.height * targetW) / c.width),
  }));
  const totalH = scaled.reduce((s, x) => s + x.h, 0);
  const combined = document.createElement("canvas");
  combined.width = targetW;
  combined.height = Math.max(1, totalH);
  const cctx = combined.getContext("2d");
  if (!cctx) throw new Error("No se pudo procesar el PDF.");
  cctx.fillStyle = "#ffffff";
  cctx.fillRect(0, 0, combined.width, combined.height);
  let y = 0;
  for (const s of scaled) {
    cctx.drawImage(s.src, 0, y, s.w, s.h);
    y += s.h;
  }
  const blob = await canvasToBlob(combined, JPEG_QUALITY);
  return { blob, mimeType: "image/jpeg" };
}
