export type EstadoKey = "activo" | "vencido" | "congelado" | "cancelado";

export const ESTADOS: { key: EstadoKey; label: string }[] = [
  { key: "activo", label: "Activos" },
  { key: "vencido", label: "Vencidos" },
  { key: "congelado", label: "Congelados" },
  { key: "cancelado", label: "Cancelados" },
];

type Info = { label: string; badge: string; dot: string };

// Colores semánticos que funcionan en ambos temas (texto con dark: variante).
export function estadoInfo(estado: string): Info {
  switch (estado) {
    case "activo":
      return {
        label: "Activo",
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        dot: "bg-emerald-500",
      };
    case "vencido":
      return {
        label: "Vencido",
        badge: "bg-red-500/10 text-red-600 dark:text-red-400",
        dot: "bg-red-500",
      };
    case "congelado":
      return {
        label: "Congelado",
        badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
        dot: "bg-sky-500",
      };
    case "cancelado":
      return {
        label: "Cancelado",
        badge: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
        dot: "bg-zinc-500",
      };
    default:
      return {
        label: estado,
        badge: "bg-bg-3 text-ink-muted",
        dot: "bg-ink-faint",
      };
  }
}

// Fecha de hoy (UTC) como 'YYYY-MM-DD'.
export function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Estado EFECTIVO calculado en vivo:
 * - congelado/cancelado son manuales → se respetan tal cual.
 * - activo vs vencido se deriva de la fecha: activo SOLO si vence > hoy
 *   (el día de vencimiento ya cuenta como vencido).
 * Única fuente de verdad para lista, ficha, filtros y dashboard.
 */
export function estadoEfectivo(
  estado: string,
  fechaVencimiento: string,
  hoy: string = hoyISO(),
): string {
  if (estado === "congelado" || estado === "cancelado") return estado;
  return fechaVencimiento > hoy ? "activo" : "vencido";
}

// Normaliza para búsqueda (minúsculas, sin acentos).
export function normaliza(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
