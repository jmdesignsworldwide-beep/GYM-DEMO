import { ClasesView } from "@/components/clases/ClasesView";
import { getClases, getInstructores } from "@/lib/clases/data";
import { getSessionPerfil } from "@/lib/auth/perfil";

export const dynamic = "force-dynamic";

export default async function ClasesPage() {
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
  const [clases, instructores] = await Promise.all([getClases(), getInstructores()]);
  return <ClasesView clases={clases} instructores={instructores} esAdmin={esAdmin} />;
}
