import { splitMoney } from "@/lib/format";

/**
 * Monto grande con el SÍMBOLO de moneda en chico (≈0.55em del número). Así el
 * "US$" no se come el ancho y el número puede ser más grande y entrar completo
 * en su tarjeta. El tamaño base lo pone el contenedor (clase .v / .big, etc.);
 * acá solo se reparten los tamaños relativos.
 */
export function MoneyAmount({
  value,
  locale,
  currency,
}: {
  value: number;
  locale: string;
  currency: string;
}) {
  const { symbol, number } = splitMoney(value, locale, currency);
  return (
    <>
      <span
        style={{
          fontSize: "0.55em",
          fontWeight: 700,
          marginRight: "0.18em",
          opacity: 0.9,
          verticalAlign: "0.08em",
          whiteSpace: "nowrap",
        }}
      >
        {symbol}
      </span>
      {number}
    </>
  );
}
