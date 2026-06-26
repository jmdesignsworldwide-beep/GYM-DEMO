import { ConfiguracionView } from "@/components/configuracion/ConfiguracionView";
import { getSessionPerfil } from "@/lib/auth/perfil";
import { getSupabaseServer } from "@/lib/supabase/ssr-server";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const perfil = await getSessionPerfil();

  // Defensa en profundidad (además del middleware).
  if (!perfil || perfil.rol !== "admin") {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="font-display text-xl font-semibold text-ink">Sin acceso</h1>
        <p className="mt-2 text-sm text-ink-muted">No tienes acceso a esta sección.</p>
      </div>
    );
  }

  const sb = getSupabaseServer();
  const { data } = await sb
    .from("perfiles")
    .select("user_id,username,rol,activo,created_at")
    .order("created_at");

  const usuarios = (data ?? []).map((u) => ({
    userId: u.user_id as string,
    username: (u.username as string) ?? "—",
    rol: u.rol as string,
    activo: u.activo as boolean,
  }));

  return <ConfiguracionView usuarios={usuarios} miUserId={perfil.userId} />;
}
