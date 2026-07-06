/**
 * Footer discreto del producto. Aparece al pie del layout de la app y del login.
 * El texto llega por prop (ya resuelto por idioma en el server) para que funcione
 * igual en rutas con sesión (dict del perfil) y sin sesión (default).
 */
export function Footer({
  footer,
}: {
  footer: { poweredBy: string; rights: string };
}) {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: "11px", color: "var(--hint)", margin: 0 }}>
        {footer.poweredBy}{" "}
        <a
          href="https://siemondigital.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--muted)" }}
        >
          Siemon Digital
        </a>{" "}
        — {footer.rights}
      </p>
    </footer>
  );
}
