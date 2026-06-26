import { AppShell } from "@/components/layout/AppShell";
import { WelcomeGate } from "@/components/welcome/WelcomeGate";
import { getSessionPerfil } from "@/lib/auth/perfil";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const perfil = await getSessionPerfil();
  const rol = perfil?.rol ?? "cajero";
  const username = perfil?.username ?? "Usuaria";

  return (
    <>
      <WelcomeGate username={username} />
      <AppShell rol={rol} username={username} accesoExpira={perfil?.accesoExpira ?? null}>
        {children}
      </AppShell>
    </>
  );
}
