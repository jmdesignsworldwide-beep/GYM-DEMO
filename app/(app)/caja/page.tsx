import { CajaView } from "@/components/caja/CajaView";
import { getCajaData } from "@/lib/caja/data";

export const dynamic = "force-dynamic";

export default async function CajaPage() {
  const data = await getCajaData();
  return <CajaView data={data} />;
}
