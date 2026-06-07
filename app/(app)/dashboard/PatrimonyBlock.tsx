import { formatMoney } from "@/lib/format";

/**
 * Patrimonio / Inversiones (mockup 03 · Progreso mensual), ANEXO REDISENO §3.
 *
 * Reemplaza la dona. Tarjetas KPI (Balance acumulado, Capital aportado, Interés
 * ganado) + gráfico de crecimiento estilo barras apiladas (Capital + Interés).
 * Reusa los cálculos de Investments (projectedValue); acá solo presenta.
 *
 * Componente sin estado: recibe las series ya calculadas en el server.
 */
export function PatrimonyBlock({
  horizon,
  balance,
  capital,
  interest,
  cols,
  xLabels,
  hasAssets,
  locale,
  currency,
}: {
  horizon: number;
  balance: number;
  capital: number;
  interest: number;
  /** Una columna por año: altura de capital e interés como % del máximo. */
  cols: { k: number; i: number }[];
  /** Etiquetas del eje X (alineadas con cols; "" donde no se muestra). */
  xLabels: string[];
  hasAssets: boolean;
  locale: string;
  currency: string;
}) {
  const moneyShort = (n: number) =>
    formatMoney(n, locale, currency, { maxFractionDigits: 0 });

  return (
    <section className="d-card top-mint" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="d-section-label">Patrimonio · proyección a {horizon} años</div>

      {!hasAssets ? (
        <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>
          Cargá posiciones en{" "}
          <a href="/investments" style={{ color: "var(--accent-2)" }}>Inversiones</a>{" "}
          para ver crecer tu capital por interés compuesto.
        </p>
      ) : (
        <>
          {/* KPIs */}
          <div className="d-kpis patrimony">
            <div className="d-kpi hero mint top-mint">
              <div className="lab">Balance acumulado · {horizon}A</div>
              <div className="v">{moneyShort(balance)}</div>
              <div className="ctx plain">Capital + interés</div>
            </div>
            <div className="d-kpi sky top-sky">
              <div className="lab">Capital aportado</div>
              <div className="v">{moneyShort(capital)}</div>
              <div className="ctx plain">depósito + aportes</div>
            </div>
            <div className="d-kpi mint top-gold">
              <div className="lab">Interés ganado</div>
              <div className="v" style={{ color: "var(--gold)" }}>{moneyShort(interest)}</div>
              <div className="ctx plain">crecimiento compuesto</div>
            </div>
          </div>

          {/* Leyenda */}
          <div className="d-legend">
            <span>
              <span className="sw" style={{ background: "var(--accent-2)" }} />
              Capital
            </span>
            <span>
              <span className="sw" style={{ background: "var(--accent)" }} />
              Interés
            </span>
          </div>

          {/* Gráfico de barras apiladas Capital + Interés */}
          <div>
            <div className="d-chart">
              {cols.map((c, idx) => (
                <div className="col" key={idx} title={`Año ${idx + 1}`}>
                  <div className="seg i" style={{ height: `${c.i}%` }} />
                  <div className="seg k" style={{ height: `${c.k}%` }} />
                </div>
              ))}
            </div>
            <div className="d-chart-x">
              {xLabels.map((l, idx) => (
                <span key={idx}>{l}</span>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
