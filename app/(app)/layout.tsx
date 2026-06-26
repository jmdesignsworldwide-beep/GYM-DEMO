import { AppShell } from "@/components/layout/AppShell";
import { getSessionPerfil } from "@/lib/auth/perfil";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const perfil = await getSessionPerfil();
  const rol = perfil?.rol ?? "cajero";
  const username = perfil?.username ?? "Usuaria";

  return (
    <AppShell rol={rol} username={username} accesoExpira={perfil?.accesoExpira ?? null}>
      {children}
    </AppShell>
  );
}
