import { getServerSupabase } from "@/lib/supabase/server";

export const OBJETIVOS_PT = [
  "Ganar masa muscular",
  "Bajar grasa",
  "Acondicionamiento general",
  "Fuerza",
  "Movilidad y postura",
  "Rendimiento deportivo",
] as const;

export type PlanPt = {
  id: string;
  miembroId: string;
  miembroNombre: string;
  miembroFoto: string | null;
  entrenadorId: string | null;
  entrenadorNombre: string | null;
  sesionesIncluidas: number;
  precioSesionAdicional: number;
  objetivo: string | null;
  activo: boolean;
  usadas: number; // sesiones incluidas completadas
  adicionales: number; // sesiones adicionales
  proximas: number; // reservadas a futuro
};

export type SesionPt = {
  id: string;
  fecha: string;
  estado: string; // reservada | completada | cancelada
  tipo: string; // incluida | adicional
  comision: number;
  nota: string | null;
};

export type Progreso = {
  id: string;
  fecha: string;
  peso: number | null;
  grasa: number | null;
  cintura: number | null;
  pecho: number | null;
  brazo: number | null;
  nota: string | null;
};

export type EntrenadorOpcion = { id: string; nombre: string };

export async function getPlanes(): Promise<PlanPt[]> {
  const sb = getServerSupabase();
  const { data: planesRaw } = await sb
    .from("planes_pt")
    .select(
      "id,miembro_id,entrenador_id,sesiones_incluidas,precio_sesion_adicional,objetivo,activo,miembros(nombre,foto_url)",
    )
    .eq("activo", true)
    .order("created_at", { ascending: false });

  const planes = planesRaw ?? [];

  // nombres de entrenadores
  const entIds = Array.from(new Set(planes.map((p) => p.entrenador_id).filter(Boolean))) as string[];
  const entNombres: Record<string, string> = {};
  if (entIds.length) {
    const { data: emps } = await sb.from("empleados").select("id,nombre").in("id", entIds);
    (emps ?? []).forEach((e) => (entNombres[e.id as string] = e.nombre as string));
  }

  // sesiones por miembro
  const miembroIds = planes.map((p) => p.miembro_id as string);
  const conteo: Record<string, { usadas: number; adicionales: number; proximas: number }> = {};
  if (miembroIds.length) {
    const { data: ses } = await sb
      .from("sesiones_pt")
      .select("miembro_id,estado,tipo")
      .in("miembro_id", miembroIds);
    (ses ?? []).forEach((s) => {
      const k = s.miembro_id as string;
      conteo[k] ??= { usadas: 0, adicionales: 0, proximas: 0 };
      if (s.estado === "completada" && s.tipo === "incluida") conteo[k].usadas++;
      if (s.tipo === "adicional") conteo[k].adicionales++;
      if (s.estado === "reservada") conteo[k].proximas++;
    });
  }

  return planes.map((p) => {
    const m = p.miembros as unknown as { nombre?: string; foto_url?: string } | null;
    const c = conteo[p.miembro_id as string] ?? { usadas: 0, adicionales: 0, proximas: 0 };
    return {
      id: p.id as string,
      miembroId: p.miembro_id as string,
      miembroNombre: m?.nombre ?? "Miembro",
      miembroFoto: m?.foto_url ?? null,
      entrenadorId: (p.entrenador_id as string) ?? null,
      entrenadorNombre: p.entrenador_id ? entNombres[p.entrenador_id as string] ?? null : null,
      sesionesIncluidas: Number(p.sesiones_incluidas),
      precioSesionAdicional: Number(p.precio_sesion_adicional),
      objetivo: (p.objetivo as string) ?? null,
      activo: p.activo as boolean,
      usadas: c.usadas,
      adicionales: c.adicionales,
      proximas: c.proximas,
    };
  });
}

export async function getEntrenadores(): Promise<EntrenadorOpcion[]> {
  const sb = getServerSupabase();
  const { data } = await sb
    .from("empleados")
    .select("id,nombre")
    .eq("estado", "activo")
    .in("puesto", ["entrenador", "instructor"])
    .order("nombre");
  return (data ?? []).map((e) => ({ id: e.id as string, nombre: e.nombre as string }));
}

/** Miembros sin plan de PT activo (para crear uno nuevo). */
export async function getMiembrosSinPlan(): Promise<{ id: string; nombre: string; fotoUrl: string | null }[]> {
  const sb = getServerSupabase();
  const { data: planes } = await sb.from("planes_pt").select("miembro_id").eq("activo", true);
  const conPlan = new Set((planes ?? []).map((p) => p.miembro_id as string));
  const { data: miembros } = await sb.from("miembros").select("id,nombre,foto_url").order("nombre");
  return (miembros ?? [])
    .filter((m) => !conPlan.has(m.id as string))
    .map((m) => ({ id: m.id as string, nombre: m.nombre as string, fotoUrl: (m.foto_url as string) ?? null }));
}
