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

const MESES_LARGO = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// 'YYYY-MM-DD' → '24 de junio de 2026'
export function formatFechaCorta(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return `${d} de ${MESES_LARGO[(m - 1) % 12]} de ${y}`;
}
