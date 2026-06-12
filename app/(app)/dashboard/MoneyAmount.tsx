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
  // El signo negativo va ANTES del símbolo y a tamaño completo (ej. "-US$ 500",
  // no "US$ -500"), para que el monto negativo de "sin asignar" se lea claro.
  const negative = number.startsWith("-");
  const digits = negative ? number.slice(1) : number;
  return (
    <>
      {negative && "-"}
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
      {digits}
    </>
  );
}
