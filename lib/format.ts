// Formato de moneda dominicana (RD$) sin decimales para montos grandes.
export function formatRD(n: number, decimals = 0): string {
  return (
    "RD$ " +
    new Intl.NumberFormat("es-DO", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(n)
  );
}

// Inicial para avatares.
export function inicial(nombre: string): string {
  return (nombre.trim().charAt(0) || "M").toUpperCase();
}
