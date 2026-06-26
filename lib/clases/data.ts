import { getServerSupabase } from "@/lib/supabase/server";

export const DISCIPLINAS = [
  "spinning",
  "zumba",
  "yoga",
  "funcional",
  "crossfit",
  "baile",
] as const;

export const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
export const DIAS_CORTO = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export type Clase = {
  id: string;
  disciplina: string;
  instructorId: string | null;
  instructorNombre: string | null;
  diaSemana: number;
  hora: string; // HH:MM
  duracionMin: number;
  capacidad: number;
  sala: string | null;
  comision: number;
  inscritos: number; // estado=inscrito
  espera: number; // estado=espera
};

export type InstructorOpcion = { id: string; nombre: string; puesto: string };

export type MiembroInscrito = {
  inscripcionId: string;
  miembroId: string;
  nombre: string;
  fotoUrl: string | null;
  estado: string; // inscrito | espera
};

function hhmm(t: string): string {
  return (t ?? "").slice(0, 5);
}

/** Todas las clases activas con su instructor y conteo de inscritos/espera. */
export async function getClases(): Promise<Clase[]> {
  const sb = getServerSupabase();
  const { data: clasesRaw } = await sb
    .from("clases")
    .select("id,disciplina,instructor_id,dia_semana,hora,duracion_min,capacidad,sala,comision")
    .eq("activa", true)
    .order("dia_semana")
    .order("hora");

  const clases = clasesRaw ?? [];

  // instructores
  const ids = Array.from(new Set(clases.map((c) => c.instructor_id).filter(Boolean))) as string[];
  const nombres: Record<string, string> = {};
  if (ids.length) {
    const { data: emps } = await sb.from("empleados").select("id,nombre").in("id", ids);
    (emps ?? []).forEach((e) => {
      nombres[e.id as string] = e.nombre as string;
    });
  }

  // conteos de inscripciones
  const { data: ins } = await sb.from("inscripciones").select("clase_id,estado");
  const cnt: Record<string, { inscritos: number; espera: number }> = {};
  (ins ?? []).forEach((i) => {
    const k = i.clase_id as string;
    cnt[k] ??= { inscritos: 0, espera: 0 };
    if (i.estado === "espera") cnt[k].espera++;
    else cnt[k].inscritos++;
  });

  return clases.map((c) => ({
    id: c.id as string,
    disciplina: c.disciplina as string,
    instructorId: (c.instructor_id as string) ?? null,
    instructorNombre: c.instructor_id ? nombres[c.instructor_id as string] ?? null : null,
    diaSemana: c.dia_semana as number,
    hora: hhmm(c.hora as string),
    duracionMin: c.duracion_min as number,
    capacidad: c.capacidad as number,
    sala: (c.sala as string) ?? null,
    comision: Number(c.comision ?? 0),
    inscritos: cnt[c.id as string]?.inscritos ?? 0,
    espera: cnt[c.id as string]?.espera ?? 0,
  }));
}

/** Instructores y entrenadores activos (para asignar a una clase). */
export async function getInstructores(): Promise<InstructorOpcion[]> {
  const sb = getServerSupabase();
  const { data } = await sb
    .from("empleados")
    .select("id,nombre,puesto")
    .eq("estado", "activo")
    .in("puesto", ["instructor", "entrenador"])
    .order("nombre");
  return (data ?? []).map((e) => ({
    id: e.id as string,
    nombre: e.nombre as string,
    puesto: e.puesto as string,
  }));
}
