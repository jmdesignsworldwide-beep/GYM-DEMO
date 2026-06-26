import { PagosView } from "@/components/pagos/PagosView";
import { getPagosData } from "@/lib/pagos/data";

export const dynamic = "force-dynamic";

export default async function PagosPage() {
  const data = await getPagosData();
  return <PagosView data={data} />;
}
