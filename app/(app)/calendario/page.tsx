import { CalendarioView } from "@/components/calendario/CalendarioView";
import { getMiembros } from "@/lib/miembros/data";

export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
  const miembros = await getMiembros();
  return <CalendarioView miembros={miembros} />;
}
