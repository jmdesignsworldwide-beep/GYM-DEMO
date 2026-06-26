import { NutricionView } from "@/components/nutricion/NutricionView";
import { getPlanesNutricion, getMiembrosParaNutricion } from "@/lib/nutricion/data";
import { getSessionPerfil } from "@/lib/auth/perfil";

export const dynamic = "force-dynamic";

export default async function NutricionPage() {
  const perfil = await getSessionPerfil();
  if (!perfil) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="font-display text-xl font-semibold text-ink">Sin acceso</h1>
        <p className="mt-2 text-sm text-ink-muted">Inicia sesión para continuar.</p>
      </div>
    );
  }
  const esAdmin = perfil.rol === "admin";
  const [planes, miembros] = await Promise.all([
    getPlanesNutricion(),
    getMiembrosParaNutricion(),
  ]);
  return <NutricionView planes={planes} miembros={miembros} esAdmin={esAdmin} />;
}
