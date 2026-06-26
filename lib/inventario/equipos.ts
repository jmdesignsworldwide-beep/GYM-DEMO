import { getServerSupabase } from "@/lib/supabase/server";
import { getSupabase } from "@/lib/supabase/client";

export type Equipo = {
  id: string;
  nombre: string;
  categoria: string;
  estado: string;
  ultimaRevision: string | null;
  proximoMantenimiento: string | null;
  notas: string | null;
};

export type Mantenimiento = {
  id: string;
  fecha: string;
  descripcion: string | null;
  costo: number | null;
};

export const CATEGORIAS_EQUIPO = ["cardio", "fuerza", "funcional", "accesorios"] as const;
export const ESTADOS_EQUIPO = ["operativo", "en mantenimiento", "fuera de servicio"] as const;

export async function getEquipos(): Promise<Equipo[]> {
  const sb = getServerSupabase();
  const { data } = await sb
    .from("equipos")
    .select("id,nombre,categoria,estado,ultima_revision,proximo_mantenimiento,notas")
    .order("nombre")
    .limit(500);
  return (data ?? []).map((e) => ({
    id: e.id as string,
    nombre: e.nombre as string,
    categoria: e.categoria as string,
    estado: e.estado as string,
    ultimaRevision: (e.ultima_revision as string) ?? null,
    proximoMantenimiento: (e.proximo_mantenimiento as string) ?? null,
    notas: (e.notas as string) ?? null,
  }));
}

export async function getMantenimientos(equipoId: string): Promise<Mantenimiento[]> {
  const sb = getSupabase();
  const { data } = await sb
    .from("mantenimientos")
    .select("id,fecha,descripcion,costo")
    .eq("equipo_id", equipoId)
    .order("fecha", { ascending: false })
    .limit(50);
  return (data ?? []).map((m) => ({
    id: m.id as string,
    fecha: m.fecha as string,
    descripcion: (m.descripcion as string) ?? null,
    costo: m.costo == null ? null : Number(m.costo),
  }));
}

export function estadoEquipoInfo(estado: string): { label: string; badge: string } {
  switch (estado) {
    case "operativo":
      return { label: "Operativo", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" };
    case "en mantenimiento":
      return { label: "En mantenimiento", badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400" };
    case "fuera de servicio":
      return { label: "Fuera de servicio", badge: "bg-red-500/10 text-red-600 dark:text-red-400" };
    default:
      return { label: estado, badge: "bg-bg-3 text-ink-muted" };
  }
}

// Alerta de mantenimiento por fecha (en vivo). Devuelve null si no aplica.
export function mantenimientoInfo(
  proximo: string | null,
  hoy: string,
): { texto: string; clase: string; urgente: boolean } | null {
  if (!proximo) return null;
  const dias = Math.round(
    (Date.parse(`${proximo}T00:00:00Z`) - Date.parse(`${hoy}T00:00:00Z`)) / 86400000,
  );
  if (dias < 0)
    return {
      texto: `Mantenimiento vencido hace ${Math.abs(dias)} ${Math.abs(dias) === 1 ? "día" : "días"}`,
      clase: "text-red-600 dark:text-red-400",
      urgente: true,
    };
  if (dias <= 7)
    return {
      texto: `Mantenimiento en ${dias} ${dias === 1 ? "día" : "días"}`,
      clase: "text-amber-600 dark:text-amber-400",
      urgente: true,
    };
  return { texto: `Próximo mantenimiento en ${dias} días`, clase: "text-ink-faint", urgente: false };
}
