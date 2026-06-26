"use server";

import { revalidatePath } from "next/cache";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { requireSesion } from "@/lib/auth/perfil";
import { calcularMacros, type Comida } from "@/lib/nutricion/data";

export type NutResult = { ok: boolean; error?: string };

function revalidar() {
  revalidatePath("/nutricion");
  revalidatePath("/dashboard");
}

/** Crea o edita un plan. Los macros se calculan en el servidor a partir del peso. */
export async function guardarPlanNutricion(input: {
  id?: string | null;
  miembroId: string;
  objetivo: string;
  peso: number;
  notas: string;
}): Promise<NutResult> {
  await requireSesion();
  if (!input.miembroId) return { ok: false, error: "Selecciona un miembro." };
  if (!input.peso || input.peso <= 0) return { ok: false, error: "Indica el peso del miembro." };

  const macros = calcularMacros(input.peso, input.objetivo);
  const sb = getAdminSupabase();

  const row = {
    miembro_id: input.miembroId,
    objetivo: input.objetivo,
    calorias: macros.calorias,
    proteina_g: macros.proteina,
    carbos_g: macros.carbos,
    grasa_g: macros.grasa,
    notas: input.notas || null,
  };

  if (input.id) {
    const { error } = await sb.from("planes_nutricion").update(row).eq("id", input.id);
    if (error) return { ok: false, error: "No se pudo guardar el plan." };
  } else {
    // Un solo plan activo por miembro: desactiva los anteriores.
    await sb.from("planes_nutricion").update({ activo: false }).eq("miembro_id", input.miembroId).eq("activo", true);
    const { error } = await sb.from("planes_nutricion").insert({ ...row, activo: true });
    if (error) return { ok: false, error: "No se pudo crear el plan." };
  }
  revalidar();
  return { ok: true };
}

export async function eliminarPlanNutricion(id: string): Promise<NutResult> {
  await requireSesion();
  const sb = getAdminSupabase();
  const { error } = await sb.from("planes_nutricion").update({ activo: false }).eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar." };
  revalidar();
  return { ok: true };
}

export async function agregarComida(input: {
  planId: string;
  momento: string;
  descripcion: string;
  calorias: number | null;
}): Promise<NutResult> {
  await requireSesion();
  if (!input.descripcion.trim()) return { ok: false, error: "Escribe la comida." };
  const sb = getAdminSupabase();

  const { count } = await sb
    .from("comidas_plan")
    .select("id", { count: "exact", head: true })
    .eq("plan_id", input.planId);

  const { error } = await sb.from("comidas_plan").insert({
    plan_id: input.planId,
    momento: input.momento,
    descripcion: input.descripcion.trim(),
    calorias: input.calorias,
    orden: count ?? 0,
  });
  if (error) return { ok: false, error: "No se pudo agregar la comida." };
  revalidar();
  return { ok: true };
}

export async function eliminarComida(id: string): Promise<NutResult> {
  await requireSesion();
  const sb = getAdminSupabase();
  const { error } = await sb.from("comidas_plan").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar." };
  revalidar();
  return { ok: true };
}

export async function getComidas(planId: string): Promise<Comida[]> {
  await requireSesion();
  const sb = getAdminSupabase();
  const { data } = await sb
    .from("comidas_plan")
    .select("id,momento,descripcion,calorias,orden")
    .eq("plan_id", planId)
    .order("orden");
  return (data ?? []).map((c) => ({
    id: c.id as string,
    momento: c.momento as string,
    descripcion: c.descripcion as string,
    calorias: c.calorias != null ? Number(c.calorias) : null,
    orden: Number(c.orden ?? 0),
  }));
}

/** Historial de planes de un miembro. */
export async function getHistorialPlanes(
  miembroId: string,
): Promise<{ id: string; objetivo: string; calorias: number; activo: boolean; fecha: string }[]> {
  await requireSesion();
  const sb = getAdminSupabase();
  const { data } = await sb
    .from("planes_nutricion")
    .select("id,objetivo,calorias,activo,created_at")
    .eq("miembro_id", miembroId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((p) => ({
    id: p.id as string,
    objetivo: p.objetivo as string,
    calorias: Number(p.calorias),
    activo: p.activo as boolean,
    fecha: p.created_at as string,
  }));
}
