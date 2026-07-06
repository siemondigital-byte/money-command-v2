"use client";

import { useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { BASKETS, type Basket } from "@/lib/expenses";
import { useTranslations } from "@/lib/i18n/provider";
import {
  scanStatementAction,
  createExpensesBatchAction,
  type StatementItem,
} from "./scan-statement-actions";
import {
  compressImage,
  extractPdfText,
  hasEnoughText,
  isImage,
  isPdf,
  isPdfPasswordProtected,
  pdfToBlob,
  unlockPdfToImage,
  WrongPasswordError,
  type PreparedFile,
} from "./scanner-utils";

/**
 * Escáner de resúmenes de tarjeta (Etapa 2): subir/desbloquear/revisar.
 *
 * NO crea gastos en esta etapa (el botón de confirmar está deshabilitado). La
 * contraseña de un PDF protegido se usa SOLO en el navegador (scanner-utils):
 * al servidor va el contenido ya desbloqueado, nunca la clave.
 */

type Phase =
  | "idle"
  | "preparing"
  | "password"
  | "reading"
  | "review"
  | "creating"
  | "done"
  | "error";

/** Fila editable de la revisión (pre-cargada por la IA, editable por el usuario). */
interface Row {
  key: number;
  comercio: string;
  monto: string; // string para el input
  fecha: string;
  categoria: string;
  canasta: Basket;
  confianza: StatementItem["confianza"];
  include: boolean;
  isDuplicate: boolean;
}

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function StatementScanner({
  existingExpenses,
  activeMonthLabel,
}: {
  /** Gastos ya cargados del período (para marcar posibles duplicados). */
  existingExpenses: { name: string; amount: number }[];
  /** Etiqueta legible del período activo (ej. "Junio 2026"). Los gastos se
   * crean en el mes activo (Opción A / regla del producto). */
  activeMonthLabel: string;
}) {
  const router = useRouter();
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [createdCount, setCreatedCount] = useState(0);
  const pendingFile = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Input aparte para "Tomar foto": accept=image/* + capture=environment abre la
  // cámara trasera en móvil; en escritorio (sin cámara) cae al selector normal.
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Set para dedup: "comercio normalizado|monto". Los gastos existentes hoy no
  // tienen fecha de compra (llega en la Etapa 3), así que el match es por
  // comercio + monto dentro del período.
  const existingKeys = new Set(
    existingExpenses.map((e) => `${norm(e.name)}|${e.amount.toFixed(2)}`),
  );

  function reset() {
    setPhase("idle");
    setErrorMsg(null);
    setPassword("");
    setRows([]);
    setCreatedCount(0);
    pendingFile.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  function buildRows(items: StatementItem[]): Row[] {
    return items.map((it, i) => {
      const key = `${norm(it.comercio)}|${it.monto.toFixed(2)}`;
      return {
        key: i,
        comercio: it.comercio,
        monto: String(it.monto),
        fecha: it.fecha,
        categoria: it.categoria_sugerida,
        canasta: it.canasta_sugerida,
        confianza: it.confianza,
        include: true,
        isDuplicate: existingKeys.has(key),
      };
    });
  }

  /** Manda el FormData al server y procesa el resultado (compartido). */
  async function runExtract(fd: FormData) {
    setPhase("reading");
    setErrorMsg(null);
    try {
      const res = await scanStatementAction(fd);
      if ("error" in res) {
        setErrorMsg(res.error);
        setPhase("error");
      } else {
        // La lista viaja como JSON string (para no exceder el anidamiento de
        // Flight con listas largas); acá la parseamos a StatementItem[].
        const items = JSON.parse(res.itemsJson) as StatementItem[];
        setRows(buildRows(items));
        setPhase("review");
      }
    } catch {
      setErrorMsg(t.expenses.scanner.errRead);
      setPhase("error");
    }
  }

  /** CAMINO PRINCIPAL: manda el TEXTO extraído del PDF (string liviano). */
  function runExtractText(text: string) {
    const fd = new FormData();
    fd.append("text", text);
    return runExtract(fd);
  }

  /**
   * FALLBACK: manda la imagen/PDF como Blob (Next lo streamea), no como base64
   * string gigante: evita "Maximum array nesting exceeded" al transportar el arg.
   */
  function runExtractFile(prepared: PreparedFile) {
    const fd = new FormData();
    fd.append("file", prepared.blob, "statement");
    fd.append("mimeType", prepared.mimeType);
    return runExtract(fd);
  }

  async function handleFile(file: File) {
    reset();
    pendingFile.current = file;
    setPhase("preparing");
    try {
      if (isImage(file)) {
        // Foto: no hay texto que extraer → visión sobre la imagen comprimida.
        const prepared = await compressImage(file);
        await runExtractFile(prepared);
        return;
      }
      if (isPdf(file)) {
        const protectedPdf = await isPdfPasswordProtected(file);
        if (protectedPdf) {
          setPhase("password"); // pedir contraseña (o subir foto)
          return;
        }
        // Elegimos el camino automáticamente: si el PDF tiene texto extraíble,
        // mandamos SOLO el texto (liviano). Si no (PDF escaneado), caemos a imagen.
        const text = await extractPdfText(file);
        if (hasEnoughText(text)) {
          await runExtractText(text);
        } else {
          await runExtractFile(pdfToBlob(file));
        }
        return;
      }
      setErrorMsg(t.expenses.scanner.errUnsupported);
      setPhase("error");
    } catch {
      setErrorMsg(t.expenses.scanner.errPrepare);
      setPhase("error");
    }
  }

  async function handleUnlock() {
    const file = pendingFile.current;
    if (!file || password.trim().length === 0) return;
    setPhase("preparing");
    try {
      // La contraseña se usa SOLO acá (navegador): pdfjs descifra localmente para
      // extraer el texto (o, si no hay, renderizar la imagen). La clave nunca sale.
      const text = await extractPdfText(file, password);
      if (hasEnoughText(text)) {
        await runExtractText(text);
      } else {
        // PDF protegido pero escaneado: al server va la imagen desbloqueada.
        const prepared = await unlockPdfToImage(file, password);
        await runExtractFile(prepared);
      }
    } catch (err) {
      if (err instanceof WrongPasswordError) {
        setErrorMsg(t.expenses.scanner.errWrongPassword);
      } else {
        setErrorMsg(t.expenses.scanner.errUnlock);
      }
      setPhase("password");
    }
  }

  function updateRow(key: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  /** Crea los gastos tildados en el período activo (una sola consolidación). */
  async function doCreate() {
    const sel = rows.filter((r) => r.include && (Number(r.monto) || 0) > 0);
    if (sel.length === 0) {
      setErrorMsg(t.expenses.scanner.errNoValid);
      setPhase("error");
      return;
    }
    setPhase("creating");
    setErrorMsg(null);
    // La lista viaja como STRING JSON (un escalar) para no gatillar el límite de
    // anidamiento de Flight al pasar el argumento al Server Action.
    const payload = sel.map((r) => ({
      comercio: r.comercio,
      monto: Number(r.monto) || 0,
      fecha: r.fecha,
      categoria: r.categoria,
      canasta: r.canasta,
    }));
    try {
      const res = await createExpensesBatchAction(JSON.stringify(payload));
      if ("error" in res) {
        setErrorMsg(res.error);
        setPhase("error");
        return;
      }
      setCreatedCount(res.creados);
      setPhase("done");
      // Refresca la vista de Egresos: los nuevos gastos aparecen en la lista.
      router.refresh();
    } catch {
      setErrorMsg(t.expenses.scanner.errCreate);
      setPhase("error");
    }
  }

  // Resumen
  const selected = rows.filter((r) => r.include);
  const selectedTotal = selected.reduce(
    (s, r) => s + (Number(r.monto) || 0),
    0,
  );
  const lowConf = rows.filter((r) => r.confianza === "baja").length;
  const dupCount = rows.filter((r) => r.isDuplicate).length;

  if (!open) {
    return (
      <button
        type="button"
        className="btn-secondary"
        onClick={() => setOpen(true)}
        style={{ alignSelf: "flex-start" }}
      >
        {t.expenses.scanner.openButton}
      </button>
    );
  }

  return (
    <section className="card flex flex-col gap-4" style={{ borderTop: "2px solid var(--accent-2)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "10px" }}>
        <div className="label">{t.expenses.scanner.title}</div>
        <button type="button" onClick={() => { reset(); setOpen(false); }} style={linkBtn}>
          {t.expenses.scanner.close}
        </button>
      </div>

      {/* Subida */}
      {(phase === "idle" || phase === "error") && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Inputs nativos ocultos: los botones estilizados los disparan (mismo
              look que el resto de la app, sin el "Choose File" gris del navegador).
              - Subir: PDF o imagen, selector de archivo normal.
              - Tomar foto: solo imagen + capture=environment → cámara en móvil. */}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
            style={{ display: "none" }}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
            style={{ display: "none" }}
          />
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              {t.expenses.scanner.uploadButton}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => cameraInputRef.current?.click()}
            >
              {t.expenses.scanner.takePhotoButton}
            </button>
          </div>
          <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
            {t.expenses.scanner.uploadHelp}
          </p>
          {phase === "error" && errorMsg && (
            <p style={{ color: "var(--danger)", fontSize: "12px", margin: 0 }}>{errorMsg}</p>
          )}
        </div>
      )}

      {/* PDF protegido: contraseña (client-side) o foto */}
      {phase === "password" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <p style={{ fontSize: "13px", color: "var(--text)", margin: 0 }}>
            {t.expenses.scanner.passwordIntro}
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.expenses.scanner.passwordPlaceholder}
              aria-label={t.expenses.scanner.passwordAriaLabel}
              autoComplete="off"
              style={{ flex: 1, minWidth: "180px" }}
            />
            <button
              type="button"
              className="btn-primary"
              onClick={() => void handleUnlock()}
              disabled={password.trim().length === 0}
              style={{ opacity: password.trim().length === 0 ? 0.6 : 1 }}
            >
              {t.expenses.scanner.unlockAndRead}
            </button>
          </div>
          <button type="button" onClick={reset} style={linkBtn}>
            {t.expenses.scanner.uploadPhotoInstead}
          </button>
          {errorMsg && (
            <p style={{ color: "var(--danger)", fontSize: "12px", margin: 0 }}>{errorMsg}</p>
          )}
        </div>
      )}

      {/* Cargando */}
      {(phase === "preparing" || phase === "reading" || phase === "creating") && (
        <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>
          {phase === "preparing"
            ? t.expenses.scanner.preparing
            : phase === "reading"
              ? t.expenses.scanner.reading
              : t.expenses.scanner.creating}
        </p>
      )}

      {/* Listo: gastos creados */}
      {phase === "done" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <p style={{ fontSize: "13px", color: "var(--accent)", margin: 0 }}>
            {t.expenses.scanner.donePre} <strong>{createdCount}</strong>{" "}
            {t.expenses.scanner.doneMid} {activeMonthLabel}
            {t.expenses.scanner.doneSuf}
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button type="button" className="btn-secondary" onClick={reset}>
              {t.expenses.scanner.scanAnother}
            </button>
            <button type="button" onClick={() => { reset(); setOpen(false); }} style={linkBtn}>
              {t.expenses.scanner.close}
            </button>
          </div>
        </div>
      )}

      {/* Revisión */}
      {phase === "review" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Advertencias */}
          {(lowConf > 0 || dupCount > 0) && (
            <div
              style={{
                fontSize: "12px",
                color: "var(--gold)",
                background: "rgba(255, 209, 102, 0.08)",
                border: "1px solid rgba(255, 209, 102, 0.3)",
                borderRadius: "8px",
                padding: "8px 10px",
              }}
            >
              {lowConf > 0 && <div>{lowConf} {t.expenses.scanner.lowConfSuf}</div>}
              {dupCount > 0 && <div>{dupCount} {t.expenses.scanner.dupSuf}</div>}
            </div>
          )}

          {/* Resumen */}
          <div style={{ fontSize: "13px", color: "var(--text)" }}>
            <strong>{selected.length}</strong> {t.expenses.scanner.summaryMid}{" "}
            {rows.length} {t.expenses.scanner.summarySuf}{" "}
            <strong style={{ color: "var(--accent)" }}>{selectedTotal.toFixed(2)}</strong>
          </div>

          {/* Filas editables */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {rows.map((r) => (
              <div
                key={r.key}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  background: r.include ? "var(--surface-2)" : "transparent",
                  opacity: r.include ? 1 : 0.55,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                    <input
                      type="checkbox"
                      checked={r.include}
                      onChange={(e) => updateRow(r.key, { include: e.target.checked })}
                    />
                    {t.expenses.scanner.include}
                  </label>
                  <Badge tone={r.confianza === "baja" ? "danger" : r.confianza === "media" ? "gold" : "accent"}>
                    {t.expenses.scanner.confidencePre} {r.confianza}
                  </Badge>
                  {r.isDuplicate && <Badge tone="gold">{t.expenses.scanner.possibleDuplicate}</Badge>}
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <Field label={t.expenses.scanner.fieldMerchant}>
                    <input value={r.comercio} onChange={(e) => updateRow(r.key, { comercio: e.target.value })} />
                  </Field>
                  <Field label={t.expenses.scanner.fieldAmount}>
                    <input type="number" step="0.01" min="0" value={r.monto} onChange={(e) => updateRow(r.key, { monto: e.target.value })} />
                  </Field>
                  <Field label={t.expenses.scanner.fieldDate}>
                    <input type="date" value={r.fecha} onChange={(e) => updateRow(r.key, { fecha: e.target.value })} />
                  </Field>
                  <Field label={t.expenses.scanner.fieldCategory}>
                    <input value={r.categoria} onChange={(e) => updateRow(r.key, { categoria: e.target.value })} />
                  </Field>
                  <Field label={t.expenses.scanner.fieldBasket}>
                    <select value={r.canasta} onChange={(e) => updateRow(r.key, { canasta: e.target.value as Basket })}>
                      {BASKETS.map((b) => (
                        <option key={b} value={b}>{t.labels.baskets[b]}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
            ))}
          </div>

          {/* Nota informativa suave sobre el mes de registro (sin fricción) */}
          <p
            style={{
              fontSize: "12px",
              color: "var(--muted)",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "8px 10px",
              margin: 0,
            }}
          >
            {t.expenses.scanner.monthNotePre}<strong>{activeMonthLabel}</strong>
            {t.expenses.scanner.monthNoteSuf}
          </p>

          {/* Confirmar y crear (Etapa 3) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => void doCreate()}
              disabled={selected.length === 0}
              style={{
                alignSelf: "flex-start",
                opacity: selected.length === 0 ? 0.5 : 1,
                cursor: selected.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              {t.expenses.scanner.confirmCreatePre} {selected.length}{" "}
              {t.expenses.scanner.confirmCreateSuf}
            </button>
          </div>

          <button type="button" onClick={reset} style={linkBtn}>
            {t.expenses.scanner.scanAnother}
          </button>
        </div>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "3px", flex: "1 1 130px", minWidth: 0 }}>
      <span className="label" style={{ fontSize: "10px" }}>{label}</span>
      {children}
    </label>
  );
}

function Badge({ tone, children }: { tone: "accent" | "gold" | "danger"; children: React.ReactNode }) {
  const color =
    tone === "accent" ? "var(--accent)" : tone === "gold" ? "var(--gold)" : "var(--danger)";
  return (
    <span
      style={{
        fontSize: "10px",
        fontFamily: "DM Mono, monospace",
        color,
        border: `1px solid ${color}`,
        borderRadius: "100px",
        padding: "2px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

const linkBtn: CSSProperties = {
  background: "transparent",
  border: "none",
  color: "var(--accent-2)",
  fontSize: "12px",
  cursor: "pointer",
  fontFamily: "DM Mono, monospace",
  padding: 0,
  alignSelf: "flex-start",
};
