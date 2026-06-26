import { DashboardView } from "@/components/dashboard/DashboardView";
import { getDashboardData } from "@/lib/dashboard/data";

// Siempre fresco: el dashboard refleja los datos actuales de Supabase.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardView data={data} />;
}
