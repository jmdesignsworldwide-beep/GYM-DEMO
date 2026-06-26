import { redirect } from "next/navigation";
import { ExpiradoView } from "@/components/ExpiradoView";
import { getSessionPerfil } from "@/lib/auth/perfil";

export const dynamic = "force-dynamic";

export default async function ExpiradoPage() {
  const perfil = await getSessionPerfil();

  // Sin sesión → al login. Sesión vigente → al sistema (esta pantalla es
  // solo para cuentas cuyo acceso de demostración ya venció).
  if (!perfil) redirect("/login");
  if (!perfil.expirado) redirect("/dashboard");

  return <ExpiradoView />;
}
