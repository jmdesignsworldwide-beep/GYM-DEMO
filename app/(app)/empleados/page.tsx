import { EmpleadosView } from "@/components/empleados/EmpleadosView";
import { getEmpleados } from "@/lib/empleados/data";
import { getSessionPerfil } from "@/lib/auth/perfil";

export const dynamic = "force-dynamic";

export default async function EmpleadosPage() {
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
  const empleados = await getEmpleados(esAdmin);
  return <EmpleadosView empleados={empleados} esAdmin={esAdmin} />;
}
