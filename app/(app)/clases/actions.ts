"use server";

import { revalidatePath } from "next/cache";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { requireAdmin, requireSesion } from "@/lib/auth/perfil";
import type { MiembroInscrito } from "@/lib/clases/data";

export type ClaseResult = { ok: boolean; error?: string };

function revalidar() {
  revalidatePath("/clases");
  revalidatePath("/empleados");
  revalidatePath("/dashboard");
}

export async function guardarClase(input: {
  id?: string | null;
  disciplina: string;
  instructorId: string;
  diaSemana: number;
  hora: string;
  duracionMin: number;
  capacidad: number;
  sala: string;
  comision: number;
}): Promise<ClaseResult> {
  await requireAdmin();
  if (!input.disciplina) return { ok: false, error: "Selecciona una disciplina." };
  if (!input.instructorId) return { ok: false, error: "Selecciona un instructor." };
  if (!input.hora) return { ok: false, error: "Indica la hora." };
  if (!input.capacidad || input.capacidad <= 0) return { ok: false, error: "Capacidad inválida." };

  const sb = getAdminSupabase();
  const row = {
    disciplina: input.disciplina,
    instructor_id: input.instructorId,
    dia_semana: input.diaSemana,
    hora: input.hora,
    duracion_min: input.duracionMin || 60,
    capacidad: input.capacidad,
    sala: input.sala || null,
    comision: input.comision || 0,
  };

  if (input.id) {
    const { error } = await sb.from("clases").update(row).eq("id", input.id);
    if (error) return { ok: false, error: "No se pudo guardar la clase." };
  } else {
    const { error } = await sb.from("clases").insert({ ...row, activa: true });
    if (error) return { ok: false, error: "No se pudo crear la clase." };
  }
  revalidar();
  return { ok: true };
}

export async function eliminarClase(id: string): Promise<ClaseResult> {
  await requireAdmin();
  const sb = getAdminSupabase();
  const { error } = await sb.from("clases").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar la clase." };
  revalidar();
  return { ok: true };
}

/** Inscribir un miembro. Si la clase está llena → entra a lista de espera. */
export async function inscribirMiembro(
  claseId: string,
  miembroId: string,
): Promise<ClaseResult & { estado?: string }> {
  await requireSesion();
  const sb = getAdminSupabase();

  const { data: clase } = await sb.from("clases").select("capacidad").eq("id", claseId).single();
  if (!clase) return { ok: false, error: "Clase no encontrada." };

  const { count } = await sb
    .from("inscripciones")
    .select("id", { count: "exact", head: true })
    .eq("clase_id", claseId)
    .eq("estado", "inscrito");

  const estado = (count ?? 0) >= (clase.capacidad as number) ? "espera" : "inscrito";

  const { error } = await sb.from("inscripciones").insert({
    clase_id: claseId,
    miembro_id: miembroId,
    estado,
  });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "Ese miembro ya está inscrito." };
    return { ok: false, error: "No se pudo inscribir." };
  }
  revalidar();
  return { ok: true, estado };
}

/** Quitar una inscripción. Si liberó un cupo, promueve al primero en espera. */
export async function quitarInscripcion(inscripcionId: string): Promise<ClaseResult> {
  await requireSesion();
  const sb = getAdminSupabase();

  const { data: insc } = await sb
    .from("inscripciones")
    .select("clase_id,estado")
    .eq("id", inscripcionId)
    .single();
  if (!insc) return { ok: false, error: "Inscripción no encontrada." };

  const { error } = await sb.from("inscripciones").delete().eq("id", inscripcionId);
  if (error) return { ok: false, error: "No se pudo quitar." };

  // Si salió un inscrito, sube al primero de la lista de espera.
  if (insc.estado === "inscrito") {
    const { data: siguiente } = await sb
      .from("inscripciones")
      .select("id")
      .eq("clase_id", insc.clase_id as string)
      .eq("estado", "espera")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (siguiente) {
      await sb.from("inscripciones").update({ estado: "inscrito" }).eq("id", siguiente.id as string);
    }
  }
  revalidar();
  return { ok: true };
}

/** Registrar asistencia de un miembro a la clase (genera comisión al instructor). */
export async function registrarAsistencia(
  claseId: string,
  miembroId: string,
): Promise<ClaseResult> {
  await requireSesion();
  const sb = getAdminSupabase();
  const hoy = new Date().toISOString().slice(0, 10);

  // evita duplicado del mismo día
  const { data: ya } = await sb
    .from("asistencias_clase")
    .select("id")
    .eq("clase_id", claseId)
    .eq("miembro_id", miembroId)
    .eq("fecha", hoy)
    .maybeSingle();
  if (ya) return { ok: true };

  const { error } = await sb
    .from("asistencias_clase")
    .insert({ clase_id: claseId, miembro_id: miembroId, fecha: hoy });
  if (error) return { ok: false, error: "No se pudo registrar la asistencia." };

  // Comisión al instructor (una vez por clase y día).
  const { data: clase } = await sb
    .from("clases")
    .select("instructor_id,comision,disciplina")
    .eq("id", claseId)
    .single();
  if (clase?.instructor_id && Number(clase.comision) > 0) {
    const { data: comYa } = await sb
      .from("comisiones")
      .select("id")
      .eq("empleado_id", clase.instructor_id as string)
      .eq("origen", "clase")
      .eq("referencia_id", claseId)
      .gte("fecha", hoy)
      .maybeSingle();
    if (!comYa) {
      await sb.from("comisiones").insert({
        empleado_id: clase.instructor_id,
        monto: Number(clase.comision),
        origen: "clase",
        referencia_id: claseId,
        nota: `${clase.disciplina} impartida`,
      });
    }
  }

  revalidar();
  return { ok: true };
}

/** Inscritos + lista de espera de una clase (para el detalle). */
export async function getInscritos(claseId: string): Promise<MiembroInscrito[]> {
  await requireSesion();
  const sb = getAdminSupabase();
  const { data } = await sb
    .from("inscripciones")
    .select("id,miembro_id,estado,created_at,miembros(nombre,foto_url)")
    .eq("clase_id", claseId)
    .order("estado", { ascending: true })
    .order("created_at", { ascending: true });

  return (data ?? []).map((i) => {
    const m = i.miembros as unknown as { nombre?: string; foto_url?: string } | null;
    return {
      inscripcionId: i.id as string,
      miembroId: i.miembro_id as string,
      nombre: m?.nombre ?? "Miembro",
      fotoUrl: m?.foto_url ?? null,
      estado: i.estado as string,
    };
  });
}

/** Miembros activos disponibles para inscribir (no inscritos aún en la clase). */
export async function getMiembrosDisponibles(
  claseId: string,
): Promise<{ id: string; nombre: string; fotoUrl: string | null }[]> {
  await requireSesion();
  const sb = getAdminSupabase();

  const { data: yaIns } = await sb.from("inscripciones").select("miembro_id").eq("clase_id", claseId);
  const excluir = new Set((yaIns ?? []).map((i) => i.miembro_id as string));

  const { data: miembros } = await sb
    .from("miembros")
    .select("id,nombre,foto_url")
    .order("nombre");

  return (miembros ?? [])
    .filter((m) => !excluir.has(m.id as string))
    .map((m) => ({
      id: m.id as string,
      nombre: m.nombre as string,
      fotoUrl: (m.foto_url as string) ?? null,
    }));
}
