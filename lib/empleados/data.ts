import { getServerSupabase } from "@/lib/supabase/server";

export type Empleado = {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string | null;
  fotoUrl: string | null;
  puesto: string;
  especialidades: string[];
  fechaIngreso: string; // YYYY-MM-DD
  salario: number | null; // null = no visible (cajero)
  horario: string | null;
  estado: string; // activo | inactivo
  notas: string | null;
};

export const PUESTOS = [
  "instructor",
  "entrenador",
  "recepcionista",
  "mantenimiento",
  "gerente",
] as const;

export const ESPECIALIDADES = [
  "spinning",
  "yoga",
  "zumba",
  "crossfit",
  "funcional",
  "baile",
  "pilates",
  "fuerza",
  "hipertrofia",
  "movilidad",
  "cardio",
  "rehabilitacion",
] as const;

// Los puestos que pueden impartir clases / dar entrenamiento personal.
export const PUESTOS_ENTRENA = ["instructor", "entrenador"];

const COLS =
  "id,nombre,cedula,telefono,foto_url,puesto,especialidades,fecha_ingreso,salario,horario,estado,notas";

function mapRow(e: Record<string, unknown>, verSalario: boolean): Empleado {
  return {
    id: e.id as string,
    nombre: e.nombre as string,
    cedula: e.cedula as string,
    telefono: (e.telefono as string) ?? null,
    fotoUrl: (e.foto_url as string) ?? null,
    puesto: e.puesto as string,
    especialidades: (e.especialidades as string[]) ?? [],
    fechaIngreso: (e.fecha_ingreso as string) ?? "",
    salario: verSalario ? Number(e.salario ?? 0) : null,
    horario: (e.horario as string) ?? null,
    estado: (e.estado as string) ?? "activo",
    notas: (e.notas as string) ?? null,
  };
}

/** Lista de empleados. `verSalario` solo true para admin (dato sensible). */
export async function getEmpleados(verSalario: boolean): Promise<Empleado[]> {
  const sb = getServerSupabase();
  const { data } = await sb
    .from("empleados")
    .select(COLS)
    .order("estado")
    .order("nombre");
  return (data ?? []).map((r) => mapRow(r, verSalario));
}

export const PUESTO_LABEL: Record<string, string> = {
  instructor: "Instructor",
  entrenador: "Entrenador personal",
  recepcionista: "Recepcionista",
  mantenimiento: "Mantenimiento",
  gerente: "Gerente",
};

export function estadoEmpleado(estado: string): { label: string; badge: string; dot: string } {
  if (estado === "inactivo") {
    return {
      label: "Inactivo",
      badge: "bg-bg-3 text-ink-muted",
      dot: "bg-zinc-400",
    };
  }
  return {
    label: "Activo",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  };
}
