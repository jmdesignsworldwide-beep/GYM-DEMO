import { KioscoView } from "@/components/acceso/KioscoView";
import { getMiembros } from "@/lib/miembros/data";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AccesoPage() {
  const miembros = await getMiembros();

  const sb = getServerSupabase();
  const hoy = new Date().toISOString().slice(0, 10);
  const { data } = await sb
    .from("accesos")
    .select("miembro_id")
    .is("salida", null)
    .gte("entrada", hoy)
    .limit(3000);
  const enGym = new Set((data ?? []).map((a) => a.miembro_id)).size;

  return <KioscoView miembros={miembros} enGymInicial={enGym} />;
}
