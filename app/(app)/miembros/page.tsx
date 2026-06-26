import { MiembrosView } from "@/components/miembros/MiembrosView";
import { getMiembros } from "@/lib/miembros/data";

export const dynamic = "force-dynamic";

export default async function MiembrosPage() {
  const miembros = await getMiembros();
  return <MiembrosView miembros={miembros} />;
}
