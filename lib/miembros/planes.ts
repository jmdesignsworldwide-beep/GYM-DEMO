export const PLANES = [
  { nombre: "Mensual", precio: 1800 },
  { nombre: "Mensual + clases", precio: 2500 },
  { nombre: "Anual", precio: 1500 },
  { nombre: "Estudiante", precio: 1200 },
] as const;

export function precioDePlan(plan: string): number {
  return PLANES.find((p) => p.nombre === plan)?.precio ?? 0;
}
