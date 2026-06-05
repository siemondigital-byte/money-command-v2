import Link from "next/link";

export const metadata = { title: "Dashboard · The Money Command" };

export default function DashboardPlaceholder() {
  return (
    <div className="fade-up flex flex-col gap-6">
      <div>
        <div className="label mb-1">Sprint 1</div>
        <h1>Dashboard</h1>
        <p
          style={{ color: "var(--muted)", marginTop: "8px", fontSize: "13px" }}
        >
          Pendiente para Sprint 3. Por ahora la foundation queda lista para
          cargar Settings y Monthly Entry.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: "12px",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        }}
      >
        <Link href="/settings" className="card" style={{ textDecoration: "none" }}>
          <div className="label mb-2">Paso 1</div>
          <h3 style={{ marginBottom: "8px" }}>Configurar perfil</h3>
          <p style={{ fontSize: "12px", color: "var(--muted)" }}>
            Brújula, supuestos, método preferido, moneda e idioma.
          </p>
        </Link>

        <Link href="/monthly" className="card" style={{ textDecoration: "none" }}>
          <div className="label mb-2">Paso 2</div>
          <h3 style={{ marginBottom: "8px" }}>Registrar tu mes</h3>
          <p style={{ fontSize: "12px", color: "var(--muted)" }}>
            Ingresos, gastos, deudas y activos del mes en curso.
          </p>
        </Link>
      </div>
    </div>
  );
}
