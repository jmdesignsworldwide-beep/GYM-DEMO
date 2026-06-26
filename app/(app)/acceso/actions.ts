"use server";

import { revalidatePath } from "next/cache";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { requireSesion } from "@/lib/auth/perfil";
import { estadoEfectivo } from "@/lib/miembros/estado";

export type AccesoResult = { ok: boolean; error?: string };

/**
 * Registra la entrada de un miembro. Valida la vigencia EN EL SERVIDOR:
 * solo se registra si la membresía está activa (estado por fecha en vivo).
 */
export async function registrarAcceso(miembroId: string): Promise<AccesoResult> {
  await requireSesion();
  if (!miembroId) return { ok: false, error: "Miembro no válido." };

  const sb = getAdminSupabase();
  const { data: m, error } = await sb
    .from("miembros")
    .select("estado,fecha_vencimiento")
    .eq("id", miembroId)
    .single();
  if (error || !m) return { ok: false, error: "No se encontró el miembro." };

  if (estadoEfectivo(m.estado as string, m.fecha_vencimiento as string) !== "activo") {
    return { ok: false, error: "La membresía no está vigente." };
  }

  const { error: aErr } = await sb.from("accesos").insert({
    miembro_id: miembroId,
    entrada: new Date().toISOString(),
    salida: null,
  });
  if (aErr) return { ok: false, error: "No se pudo registrar el acceso." };

  revalidatePath("/dashboard");
  revalidatePath("/acceso");
  return { ok: true };
}
