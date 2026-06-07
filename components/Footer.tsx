/**
 * Footer discreto del producto. Aparece al pie del layout de la app.
 */
export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: "11px", color: "var(--hint)", margin: 0 }}>
        Creado por{" "}
        <a
          href="https://siemondigital.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--muted)" }}
        >
          Siemon Digital
        </a>{" "}
        — Todos los derechos reservados
      </p>
    </footer>
  );
}
