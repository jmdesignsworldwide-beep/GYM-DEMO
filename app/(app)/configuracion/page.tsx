import { ConfiguracionView } from "@/components/configuracion/ConfiguracionView";
import { getSessionPerfil } from "@/lib/auth/perfil";
import { getAdminSupabase } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const perfil = await getSessionPerfil();

  if (!perfil || perfil.expirado || perfil.rol !== "admin") {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="font-display text-xl font-semibold text-ink">Sin acceso</h1>
        <p className="mt-2 text-sm text-ink-muted">No tienes acceso a esta sección.</p>
      </div>
    );
  }

  // Lectura con la llave de servicio: la página ya está protegida por rol en
  // el servidor, y el RLS de `perfiles` ahora solo deja que cada quien vea su
  // propia cuenta (o el super-admin todas) por la API directa.
  const sb = getAdminSupabase();
  const { data } = await sb
    .from("perfiles")
    .select("user_id,username,rol,activo,super_admin,acceso_expira,creado_por,created_at")
    .order("created_at");

  const rows = data ?? [];

  const usuarios = rows
    .filter((u) => !u.creado_por)
    // Las cuentas super-admin (JM Designs) solo las ve otro super-admin;
    // así una cuenta de cliente no ve ni gestiona la cuenta dueña del sistema.
    .filter((u) => perfil.superAdmin || u.super_admin !== true)
    .map((u) => ({
      userId: u.user_id as string,
      username: (u.username as string) ?? "—",
      rol: u.rol as string,
      activo: u.activo as boolean,
    }));

  const clientes = rows
    .filter((u) => u.creado_por)
    .map((u) => ({
      userId: u.user_id as string,
      username: (u.username as string) ?? "—",
      accesoExpira: (u.acceso_expira as string) ?? null,
    }));

  return (
    <ConfiguracionView
      usuarios={usuarios}
      miUserId={perfil.userId}
      superAdmin={perfil.superAdmin}
      clientes={clientes}
    />
  );
}
