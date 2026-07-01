/**
 * Prompt de extracción del LECTOR DE EXTRACTOS de tarjeta de crédito.
 *
 * Constante aislada (no se hardcodea en la action). Se usa igual para el TEXTO
 * del PDF (camino principal) o para una imagen (fallback): la IA interpreta el
 * contenido y devuelve EXCLUSIVAMENTE un JSON con la lista de compras. NO le
 * decimos CÓMO está maquetado cada banco (eso se rompería); le decimos QUÉ
 * buscar (la tabla de movimientos) y QUÉ ignorar.
 */
export const STATEMENT_EXTRACTION_PROMPT = `Sos un extractor de datos de resúmenes de tarjeta de crédito. Recibís el CONTENIDO de un resumen de tarjeta (como TEXTO extraído de un PDF, o como imagen). Tu tarea es encontrar la TABLA DE MOVIMIENTOS y extraer la lista de COMPRAS/CONSUMOS.

Devolvé EXCLUSIVAMENTE un objeto JSON válido, sin texto adicional, sin explicaciones, sin markdown y sin bloques de código. La forma EXACTA es:

{
  "compras": [
    {
      "comercio": string,
      "fecha": string,
      "monto": number,
      "categoria_sugerida": string,
      "canasta_sugerida": "essentials" | "style" | "freedom",
      "confianza": "alta" | "media" | "baja"
    }
  ]
}

QUÉ BUSCAR:
- Localizá la TABLA o sección de DETALLE DE MOVIMIENTOS / CONSUMOS / COMPRAS. Esa tabla suele tener columnas como: FECHA, DETALLE DEL MOVIMIENTO (el comercio), VALOR DEL MOVIMIENTO, NÚMERO DE CUOTAS, TASA, CUOTA A PAGAR ESTE MES (o CUOTA DEL PERÍODO), VALOR PENDIENTE.
- Extraé UNA fila por cada movimiento que sea una COMPRA/CONSUMO.
- Capturá TAMBIÉN los CARGOS FIJOS de la tarjeta que aparecen en esa tabla con solo FECHA y CUOTA A PAGAR ESTE MES (sin valor del movimiento ni número de cuotas): seguro de vida deudor, cuota de manejo / manejo de tarjeta, comisiones, cargos administrativos, intereses. Son gastos reales que se pagan este mes: inclúilos con canasta_sugerida "essentials" por defecto.

QUÉ IGNORAR (la MAYORÍA del documento NO son movimientos):
- Portada, datos del banco, publicidad, promociones, puntos/millas, resúmenes de saldo, cupos/límites disponibles, mensajes al cliente, términos y condiciones, páginas legales. Enfocate SOLO en la tabla de movimientos.
- Filas que NO son compras: PAGO a la tarjeta ("PAGO TARJETA", "SU PAGO", "PAGO", "ABONO", "PAGO RECIBIDO"), abonos, devoluciones, reintegros, notas de crédito, y todo monto NEGATIVO o a favor. NO son compras: no las incluyas.

CÓMO LLENAR CADA CAMPO:
- "comercio": el texto de la columna DETALLE DEL MOVIMIENTO (nombre del comercio). Si no se lee, "".
- "monto": el número que corresponde a lo que se paga ESTE mes por esa compra. Si la compra está en cuotas, usá "CUOTA A PAGAR ESTE MES" (la cuota del período), NO el "VALOR DEL MOVIMIENTO" total. Si es pago único (una sola cuota), usá el valor del movimiento. Sin símbolo de moneda ni separador de miles; usá punto decimal.
- "fecha": la fecha del movimiento en formato YYYY-MM-DD. Si no se ve, "".
- "categoria_sugerida": una etiqueta corta en español (ej. "comida", "transporte", "servicios", "restaurantes", "ropa", "salud", "entretenimiento").
- "canasta_sugerida": sugerencia según el tipo de gasto. essentials = necesidades (comida, servicios, transporte, salud). style = gustos y ocio (restaurantes, viajes, ropa, entretenimiento). freedom = deuda, ahorro, educación, inversión. Es solo una sugerencia; la persona decide.
- "confianza": "alta" si la fila se lee clara; "media" si dudás de algún campo; "baja" si no estás seguro de que sea una compra.

REGLAS FINALES:
- No inventes datos. Si un campo no se ve, dejalo vacío ("") pero incluí el item solo si tenés un monto legible.
- Si no encontrás una tabla de movimientos, o el contenido no parece un resumen de tarjeta, devolvé { "compras": [] }.`;
