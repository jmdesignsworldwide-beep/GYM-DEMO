"use server";

import { revalidatePath } from "next/cache";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/perfil";

export type ClienteResult = { ok: boolean; error?: string };

const DOMINIO = "jmfit.local";

function expiraEn(dias: number | null): string | null {
  if (dias == null) return null; // sin vencimiento
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString();
}

export async function crearCuentaCliente(input: {
  usuario: string;
  password: string;
  dias: number | null;
}): Promise<ClienteResult> {
  const sup = await requireSuperAdmin();

  const usuario = (input.usuario ?? "").trim().toLowerCase();
  const password = input.password ?? "";
  if (!/^[a-z0-9._-]{3,}$/.test(usuario)) {
    return { ok: false, error: "Usuario inválido (mín. 3, sin espacios)." };
  }
  if (password.length < 6) return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };

  const sb = getAdminSupabase();
  const { data: created, error } = await sb.auth.admin.createUser({
    email: `${usuario}@${DOMINIO}`,
    password,
    email_confirm: true,
  });
  if (error || !created?.user) return { ok: false, error: "Ese usuario ya existe o no se pudo crear." };

  const { error: pErr } = await sb.from("perfiles").insert({
    user_id: created.user.id,
    username: usuario,
    rol: "admin", // el cliente explora todo el gym
    super_admin: false,
    activo: true,
    acceso_expira: expiraEn(input.dias),
    creado_por: sup.userId,
  });
  if (pErr) return { ok: false, error: "Cuenta creada, pero falló el perfil." };

  revalidatePath("/configuracion");
  return { ok: true };
}

export async function renovarAcceso(userId: string, dias: number): Promise<ClienteResult> {
  await requireSuperAdmin();
  const d = Number(dias);
  if (!d || d <= 0) return { ok: false, error: "Días inválidos." };

  const sb = getAdminSupabase();
  const { data: perfil } = await sb
    .from("perfiles")
    .select("acceso_expira,creado_por")
    .eq("user_id", userId)
    .single();
  if (!perfil || !perfil.creado_por) return { ok: false, error: "Cuenta de cliente no encontrada." };

  // Extiende desde hoy o desde la fecha vigente (la mayor).
  const ahora = Date.now();
  const actual = perfil.acceso_expira ? new Date(perfil.acceso_expira as string).getTime() : ahora;
  const base = Math.max(ahora, actual);
  const nueva = new Date(base + d * 86400000).toISOString();

  const { error } = await sb.from("perfiles").update({ acceso_expira: nueva }).eq("user_id", userId);
  if (error) return { ok: false, error: "No se pudo renovar." };

  await sb.auth.admin.updateUserById(userId, { ban_duration: "none" });
  revalidatePath("/configuracion");
  return { ok: true };
}

export async function revocarAcceso(userId: string): Promise<ClienteResult> {
  await requireSuperAdmin();
  const sb = getAdminSupabase();
  const { data: perfil } = await sb
    .from("perfiles")
    .select("creado_por")
    .eq("user_id", userId)
    .single();
  if (!perfil || !perfil.creado_por) return { ok: false, error: "Cuenta de cliente no encontrada." };

  // Vence ya y bloquea el acceso real.
  const { error } = await sb
    .from("perfiles")
    .update({ acceso_expira: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) return { ok: false, error: "No se pudo revocar." };

  await sb.auth.admin.updateUserById(userId, { ban_duration: "876000h" });
  revalidatePath("/configuracion");
  return { ok: true };
}
