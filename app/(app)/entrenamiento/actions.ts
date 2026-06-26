"use server";

import { revalidatePath } from "next/cache";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { requireSesion } from "@/lib/auth/perfil";
import type { SesionPt, Progreso } from "@/lib/entrenamiento/data";

export type PtResult = { ok: boolean; error?: string };

const COMISION_INCLUIDA = 250; // RD$ al entrenador por sesión incluida completada
const COMISION_ADICIONAL_PCT = 0.3; // 30% de la sesión adicional cobrada

function revalidar() {
  revalidatePath("/entrenamiento");
  revalidatePath("/empleados");
  revalidatePath("/caja");
  revalidatePath("/dashboard");
}

export async function guardarPlan(input: {
  id?: string | null;
  miembroId: string;
  entrenadorId: string;
  sesionesIncluidas: number;
  precioSesionAdicional: number;
  objetivo: string;
}): Promise<PtResult> {
  await requireSesion();
  if (!input.miembroId) return { ok: false, error: "Selecciona un miembro." };
  if (!input.entrenadorId) return { ok: false, error: "Selecciona un entrenador." };

  const sb = getAdminSupabase();
  const row = {
    miembro_id: input.miembroId,
    entrenador_id: input.entrenadorId,
    sesiones_incluidas: input.sesionesIncluidas || 0,
    precio_sesion_adicional: input.precioSesionAdicional || 600,
    objetivo: input.objetivo || null,
  };

  if (input.id) {
    const { error } = await sb.from("planes_pt").update(row).eq("id", input.id);
    if (error) return { ok: false, error: "No se pudo guardar el plan." };
  } else {
    const { error } = await sb.from("planes_pt").insert({ ...row, activo: true });
    if (error) return { ok: false, error: "No se pudo crear el plan." };
  }
  revalidar();
  return { ok: true };
}

export async function eliminarPlan(id: string): Promise<PtResult> {
  await requireSesion();
  const sb = getAdminSupabase();
  const { error } = await sb.from("planes_pt").update({ activo: false }).eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar." };
  revalidar();
  return { ok: true };
}

/**
 * Reservar una sesión. Si es adicional, se cobra: crea un pago (entra a Caja,
 * fuente única) y deja la sesión enlazada a ese pago.
 */
export async function reservarSesion(input: {
  miembroId: string;
  entrenadorId: string;
  fecha: string; // ISO datetime-local
  tipo: string; // incluida | adicional
  precioAdicional: number;
  metodo: string;
}): Promise<PtResult> {
  const perfil = await requireSesion();
  if (!input.fecha) return { ok: false, error: "Indica la fecha y hora." };

  const sb = getAdminSupabase();
  const fechaIso = new Date(input.fecha).toISOString();

  let pagoId: string | null = null;
  if (input.tipo === "adicional") {
    const monto = Number(input.precioAdicional);
    if (!monto || monto <= 0) return { ok: false, error: "Precio de la sesión inválido." };
    const { data: pago, error: pErr } = await sb
      .from("pagos")
      .insert({
        miembro_id: input.miembroId,
        monto,
        metodo: input.metodo || "efectivo",
        categoria: "entrenamiento",
      })
      .select("id")
      .single();
    if (pErr) return { ok: false, error: "No se pudo cobrar la sesión." };
    pagoId = pago?.id ?? null;
  }

  const { error } = await sb.from("sesiones_pt").insert({
    miembro_id: input.miembroId,
    entrenador_id: input.entrenadorId,
    fecha: fechaIso,
    estado: "reservada",
    tipo: input.tipo,
    pago_id: pagoId,
    nota: input.tipo === "adicional" ? "Sesión adicional cobrada" : null,
  });
  if (error) return { ok: false, error: "No se pudo reservar la sesión." };

  // si fue cobrada, ya entró a Caja
  void perfil;
  revalidar();
  return { ok: true };
}

/** Completar una sesión → genera comisión al entrenador (organismo → M1). */
export async function completarSesion(sesionId: string): Promise<PtResult> {
  await requireSesion();
  const sb = getAdminSupabase();

  const { data: ses } = await sb
    .from("sesiones_pt")
    .select("entrenador_id,tipo,estado,pago_id")
    .eq("id", sesionId)
    .single();
  if (!ses) return { ok: false, error: "Sesión no encontrada." };
  if (ses.estado === "completada") return { ok: true };

  let comision = COMISION_INCLUIDA;
  if (ses.tipo === "adicional" && ses.pago_id) {
    const { data: pago } = await sb.from("pagos").select("monto").eq("id", ses.pago_id as string).single();
    comision = Math.round(Number(pago?.monto ?? 0) * COMISION_ADICIONAL_PCT);
  }

  const { error } = await sb
    .from("sesiones_pt")
    .update({ estado: "completada", comision })
    .eq("id", sesionId);
  if (error) return { ok: false, error: "No se pudo completar." };

  if (ses.entrenador_id && comision > 0) {
    await sb.from("comisiones").insert({
      empleado_id: ses.entrenador_id,
      monto: comision,
      origen: "sesion_pt",
      referencia_id: sesionId,
      nota: "Sesión de entrenamiento personal",
    });
  }

  revalidar();
  return { ok: true };
}

export async function cancelarSesion(sesionId: string): Promise<PtResult> {
  await requireSesion();
  const sb = getAdminSupabase();
  const { error } = await sb.from("sesiones_pt").update({ estado: "cancelada" }).eq("id", sesionId);
  if (error) return { ok: false, error: "No se pudo cancelar." };
  revalidar();
  return { ok: true };
}

export async function registrarProgreso(input: {
  miembroId: string;
  peso: number | null;
  grasa: number | null;
  cintura: number | null;
  pecho: number | null;
  brazo: number | null;
  nota: string;
}): Promise<PtResult> {
  await requireSesion();
  const sb = getAdminSupabase();
  const { error } = await sb.from("progreso_pt").insert({
    miembro_id: input.miembroId,
    peso: input.peso,
    grasa: input.grasa,
    cintura: input.cintura,
    pecho: input.pecho,
    brazo: input.brazo,
    nota: input.nota || null,
  });
  if (error) return { ok: false, error: "No se pudo registrar el progreso." };
  revalidar();
  return { ok: true };
}

/** Sesiones + progreso de un miembro (para el detalle del plan). */
export async function getDetallePlan(
  miembroId: string,
): Promise<{ sesiones: SesionPt[]; progreso: Progreso[] }> {
  await requireSesion();
  const sb = getAdminSupabase();

  const { data: sesRaw } = await sb
    .from("sesiones_pt")
    .select("id,fecha,estado,tipo,comision,nota")
    .eq("miembro_id", miembroId)
    .order("fecha", { ascending: false });

  const { data: progRaw } = await sb
    .from("progreso_pt")
    .select("id,fecha,peso,grasa,cintura,pecho,brazo,nota")
    .eq("miembro_id", miembroId)
    .order("fecha", { ascending: true });

  const sesiones: SesionPt[] = (sesRaw ?? []).map((s) => ({
    id: s.id as string,
    fecha: s.fecha as string,
    estado: s.estado as string,
    tipo: s.tipo as string,
    comision: Number(s.comision ?? 0),
    nota: (s.nota as string) ?? null,
  }));

  const progreso: Progreso[] = (progRaw ?? []).map((p) => ({
    id: p.id as string,
    fecha: p.fecha as string,
    peso: p.peso != null ? Number(p.peso) : null,
    grasa: p.grasa != null ? Number(p.grasa) : null,
    cintura: p.cintura != null ? Number(p.cintura) : null,
    pecho: p.pecho != null ? Number(p.pecho) : null,
    brazo: p.brazo != null ? Number(p.brazo) : null,
    nota: (p.nota as string) ?? null,
  }));

  return { sesiones, progreso };
}
