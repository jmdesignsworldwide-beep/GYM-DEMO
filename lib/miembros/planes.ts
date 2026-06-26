// Planes del gym: fuente única de precio (mensual base, RD$) y duración (meses).
// El cargo de una renovación = precio_mensual del miembro × meses del plan.
export const PLANES = [
  { nombre: "Mensual", precio: 1800, meses: 1 },
  { nombre: "Mensual + clases", precio: 2500, meses: 1 },
  { nombre: "Estudiante", precio: 1200, meses: 1 },
  { nombre: "Trimestral", precio: 1600, meses: 3 },
  { nombre: "Anual", precio: 1500, meses: 12 },
] as const;

export function planInfo(nombre: string) {
  return PLANES.find((p) => p.nombre === nombre);
}

export function precioDePlan(nombre: string): number {
  return planInfo(nombre)?.precio ?? 0;
}

export function mesesDePlan(nombre: string): number {
  return planInfo(nombre)?.meses ?? 1;
}

export const METODOS = ["efectivo", "transferencia", "tarjeta"] as const;
export const CATEGORIAS = [
  "mensualidad",
  "clases",
  "producto",
  "entrenamiento personal",
  "otro",
] as const;
