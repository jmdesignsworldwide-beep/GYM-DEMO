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

const MESES_CORTO = [
  "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic",
];

function hora12(iso: string): string {
  const hh = Number(iso.slice(11, 13));
  const mm = iso.slice(14, 16);
  const ampm = hh >= 12 ? "p.m." : "a.m.";
  return `${((hh + 11) % 12) + 1}:${mm} ${ampm}`;
}

// ISO (UTC) → '24 jun · 2:30 p.m.'
export function formatFechaHora(iso: string): string {
  const m = Number(iso.slice(5, 7));
  const d = Number(iso.slice(8, 10));
  return `${d} ${MESES_CORTO[(m - 1) % 12]} · ${hora12(iso)}`;
}

// solo la hora '2:30 p.m.'
export function formatHora(iso: string): string {
  return hora12(iso);
}
