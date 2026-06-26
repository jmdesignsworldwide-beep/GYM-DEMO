import { redirect } from "next/navigation";
import { getSessionPerfil } from "@/lib/auth/perfil";

export const dynamic = "force-dynamic";

/**
 * Entrada del sistema. No hay página pública de muestra: al abrir el link el
 * usuario va directo al login, o al sistema si ya tiene una sesión válida.
 */
export default async function Home() {
  const perfil = await getSessionPerfil();
  if (!perfil) redirect("/login");
  if (perfil.expirado) redirect("/expirado");
  redirect("/dashboard");
}
