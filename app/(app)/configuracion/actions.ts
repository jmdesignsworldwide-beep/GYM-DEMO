"use server";

import { revalidatePath } from "next/cache";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/perfil";

export type UsuarioResult = { ok: boolean; error?: string };

const DOMINIO = "jmfit.local";

/**
 * ¿El que llama puede gestionar la cuenta destino? Una cuenta super-admin
 * (la de JM Designs) solo puede ser tocada por otro super-admin. Esto evita
 * que un admin normal —o una cuenta de cliente, que también es rol admin—
 * desactive o cambie la clave de la cuenta dueña del sistema.
 */
async function puedeGestionar(
  sb: ReturnType<typeof getAdminSupabase>,
  targetUserId: string,
  callerEsSuper: boolean,
): Promise<boolean> {
  if (callerEsSuper) return true;
  const { data } = await sb
    .from("perfiles")
    .select("super_admin")
    .eq("user_id", targetUserId)
    .single();
  return data?.super_admin !== true;
}

export async function crearUsuario(input: {
  usuario: string;
  password: string;
  rol: string;
}): Promise<UsuarioResult> {
  await requireAdmin();

  const usuario = (input.usuario ?? "").trim().toLowerCase();
  const password = input.password ?? "";
  const rol = input.rol === "admin" ? "admin" : "cajero";

  if (!/^[a-z0-9._-]{3,}$/.test(usuario)) {
    return { ok: false, error: "Usuario inválido (mín. 3, letras/números/._- sin espacios)." };
  }
  if (password.length < 6) {
    return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const sb = getAdminSupabase();
  const { data: created, error } = await sb.auth.admin.createUser({
    email: `${usuario}@${DOMINIO}`,
    password,
    email_confirm: true,
  });

  if (error || !created?.user) {
    return { ok: false, error: "Ese usuario ya existe o no se pudo crear." };
  }

  const { error: pErr } = await sb
    .from("perfiles")
    .insert({ user_id: created.user.id, username: usuario, rol, activo: true });
  if (pErr) {
    return { ok: false, error: "Usuario creado, pero falló el perfil." };
  }

  revalidatePath("/configuracion");
  return { ok: true };
}

export async function cambiarActivo(userId: string, activo: boolean): Promise<UsuarioResult> {
  const admin = await requireAdmin();
  if (userId === admin.userId) return { ok: false, error: "No puedes desactivar tu propia cuenta." };

  const sb = getAdminSupabase();
  // Blindaje: nadie que no sea super-admin puede tocar una cuenta super-admin.
  if (!(await puedeGestionar(sb, userId, admin.superAdmin))) {
    return { ok: false, error: "No autorizado." };
  }
  const { error } = await sb.from("perfiles").update({ activo }).eq("user_id", userId);
  if (error) return { ok: false, error: "No se pudo actualizar." };
  // Bloquea/reactiva el acceso real del usuario.
  await sb.auth.admin.updateUserById(userId, { ban_duration: activo ? "none" : "876000h" });

  revalidatePath("/configuracion");
  return { ok: true };
}

export async function cambiarPassword(userId: string, password: string): Promise<UsuarioResult> {
  const admin = await requireAdmin();
  if (password.length < 6) return { ok: false, error: "Mínimo 6 caracteres." };

  const sb = getAdminSupabase();
  // Blindaje: solo un super-admin puede cambiar la clave de una cuenta super-admin.
  if (!(await puedeGestionar(sb, userId, admin.superAdmin))) {
    return { ok: false, error: "No autorizado." };
  }
  const { error } = await sb.auth.admin.updateUserById(userId, { password });
  if (error) return { ok: false, error: "No se pudo cambiar la contraseña." };

  revalidatePath("/configuracion");
  return { ok: true };
}
