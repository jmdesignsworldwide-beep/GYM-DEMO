import { EquiposView } from "@/components/equipos/EquiposView";
import { getEquipos } from "@/lib/inventario/equipos";
import { getSessionPerfil } from "@/lib/auth/perfil";

export const dynamic = "force-dynamic";

export default async function EquiposPage() {
  const perfil = await getSessionPerfil();
  if (!perfil || perfil.rol !== "admin") {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="font-display text-xl font-semibold text-ink">Sin acceso</h1>
        <p className="mt-2 text-sm text-ink-muted">No tienes acceso a esta sección.</p>
      </div>
    );
  }
  const equipos = await getEquipos();
  return <EquiposView equipos={equipos} />;
}
