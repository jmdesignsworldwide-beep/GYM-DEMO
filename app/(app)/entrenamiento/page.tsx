import { EntrenamientoView } from "@/components/entrenamiento/EntrenamientoView";
import { getPlanes, getEntrenadores, getMiembrosSinPlan } from "@/lib/entrenamiento/data";
import { getSessionPerfil } from "@/lib/auth/perfil";

export const dynamic = "force-dynamic";

export default async function EntrenamientoPage() {
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
  const [planes, entrenadores, miembrosSinPlan] = await Promise.all([
    getPlanes(),
    getEntrenadores(),
    getMiembrosSinPlan(),
  ]);
  return (
    <EntrenamientoView
      planes={planes}
      entrenadores={entrenadores}
      miembrosSinPlan={miembrosSinPlan}
      esAdmin={esAdmin}
    />
  );
}
