"use server";

import { revalidatePath } from "next/cache";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/perfil";

export type EquipoResult = { ok: boolean; error?: string };

const s = (fd: FormData, k: string) => ((fd.get(k) as string) ?? "").trim();

export async function guardarEquipo(formData: FormData): Promise<EquipoResult> {
  await requireAdmin();
  const id = s(formData, "id") || null;
  const nombre = s(formData, "nombre");
  const categoria = s(formData, "categoria");
  const estado = s(formData, "estado") || "operativo";
  const ultima = s(formData, "ultima_revision") || null;
  const proximo = s(formData, "proximo_mantenimiento") || null;
  const notas = s(formData, "notas") || null;

  if (!nombre) return { ok: false, error: "El nombre es obligatorio." };
  if (!categoria) return { ok: false, error: "Selecciona una categoría." };

  const sb = getAdminSupabase();
  const row = {
    nombre,
    categoria,
    estado,
    ultima_revision: ultima,
    proximo_mantenimiento: proximo,
    notas,
  };

  if (id) {
    const { error } = await sb.from("equipos").update(row).eq("id", id);
    if (error) return { ok: false, error: "No se pudo guardar." };
  } else {
    const { error } = await sb.from("equipos").insert(row);
    if (error) return { ok: false, error: "No se pudo crear el equipo." };
  }

  revalidatePath("/equipos");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function eliminarEquipo(id: string): Promise<EquipoResult> {
  await requireAdmin();
  const sb = getAdminSupabase();
  const { error } = await sb.from("equipos").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar." };
  revalidatePath("/equipos");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function registrarMantenimiento(input: {
  equipoId: string;
  fecha: string;
  descripcion: string;
  costo: number;
  proximaFecha: string;
  comoEgreso: boolean;
}): Promise<EquipoResult> {
  const perfil = await requireAdmin();
  const { equipoId, fecha, descripcion } = input;
  const costo = Number(input.costo) || 0;
  if (!equipoId || !fecha) return { ok: false, error: "Datos incompletos." };

  const sb = getAdminSupabase();

  const { error: mErr } = await sb.from("mantenimientos").insert({
    equipo_id: equipoId,
    fecha,
    descripcion: descripcion?.trim() || null,
    costo: costo > 0 ? costo : null,
    user_id: perfil.userId,
  });
  if (mErr) return { ok: false, error: "No se pudo registrar el mantenimiento." };

  await sb
    .from("equipos")
    .update({
      ultima_revision: fecha,
      proximo_mantenimiento: input.proximaFecha || null,
      estado: "operativo",
    })
    .eq("id", equipoId);

  // Opcional: registrar el costo como egreso en caja.
  if (input.comoEgreso && costo > 0) {
    const { data: eq } = await sb.from("equipos").select("nombre").eq("id", equipoId).single();
    await sb.from("egresos").insert({
      monto: costo,
      categoria: "Mantenimiento",
      nota: eq?.nombre ? `Mantenimiento: ${eq.nombre}` : "Mantenimiento de equipo",
      fecha: new Date().toISOString(),
      user_id: perfil.userId,
    });
    revalidatePath("/caja");
  }

  revalidatePath("/equipos");
  revalidatePath("/dashboard");
  return { ok: true };
}
