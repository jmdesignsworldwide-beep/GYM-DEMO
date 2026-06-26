import { DashboardView } from "@/components/dashboard/DashboardView";
import { getDashboardData } from "@/lib/dashboard/data";
import { getSessionPerfil } from "@/lib/auth/perfil";

// Siempre fresco: el dashboard refleja los datos actuales de Supabase.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [data, perfil] = await Promise.all([getDashboardData(), getSessionPerfil()]);
  return <DashboardView data={data} rol={perfil?.rol ?? "cajero"} />;
}
