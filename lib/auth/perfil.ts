import { getSupabaseServer } from "@/lib/supabase/ssr-server";

export type Rol = "admin" | "cajero";
export type Perfil = {
  userId: string;
  username: string | null;
  rol: Rol;
  superAdmin: boolean;
  accesoExpira: string | null;
  expirado: boolean;
};

/** Perfil del usuario actual (desde la sesión en cookies). null si no hay. */
export async function getSessionPerfil(): Promise<Perfil | null> {
  const sb = getSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;

  const { data } = await sb
    .from("perfiles")
    .select("username,rol,activo,super_admin,acceso_expira")
    .eq("user_id", user.id)
    .single();

  if (!data || data.activo === false) return null;

  const accesoExpira = (data.acceso_expira as string) ?? null;
  const expirado = accesoExpira != null && new Date(accesoExpira).getTime() < Date.now();

  return {
    userId: user.id,
    username: data.username,
    rol: data.rol as Rol,
    superAdmin: data.super_admin === true,
    accesoExpira,
    expirado,
  };
}

export function esAdmin(p: Perfil | null): boolean {
  return p?.rol === "admin";
}

/** Server Actions admin: lanza si no es admin (o si su acceso expiró). */
export async function requireAdmin(): Promise<Perfil> {
  const p = await getSessionPerfil();
  if (!p || p.expirado || p.rol !== "admin") throw new Error("No autorizado");
  return p;
}

/** Server Actions: lanza si no hay sesión válida (o expiró). */
export async function requireSesion(): Promise<Perfil> {
  const p = await getSessionPerfil();
  if (!p || p.expirado) throw new Error("No autorizado");
  return p;
}

/** Solo para Marien (JM Designs): gestión de accesos de cliente. */
export async function requireSuperAdmin(): Promise<Perfil> {
  const p = await getSessionPerfil();
  if (!p || !p.superAdmin) throw new Error("No autorizado");
  return p;
}
