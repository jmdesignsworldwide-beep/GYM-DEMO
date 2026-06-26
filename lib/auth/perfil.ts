import { getSupabaseServer } from "@/lib/supabase/ssr-server";

export type Rol = "admin" | "cajero";
export type Perfil = { userId: string; username: string | null; rol: Rol };

/** Perfil del usuario actual (desde la sesión en cookies). null si no hay. */
export async function getSessionPerfil(): Promise<Perfil | null> {
  const sb = getSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;

  const { data } = await sb
    .from("perfiles")
    .select("username,rol,activo")
    .eq("user_id", user.id)
    .single();

  if (!data || data.activo === false) return null;
  return { userId: user.id, username: data.username, rol: data.rol as Rol };
}

export function esAdmin(p: Perfil | null): boolean {
  return p?.rol === "admin";
}

/** Para Server Actions sensibles: lanza si no es admin. */
export async function requireAdmin(): Promise<Perfil> {
  const p = await getSessionPerfil();
  if (!p || p.rol !== "admin") throw new Error("No autorizado");
  return p;
}

/** Para Server Actions: lanza si no hay sesión válida. */
export async function requireSesion(): Promise<Perfil> {
  const p = await getSessionPerfil();
  if (!p) throw new Error("No autorizado");
  return p;
}
