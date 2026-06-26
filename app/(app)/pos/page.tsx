import { PosView } from "@/components/pos/PosView";
import { getProductos } from "@/lib/caja/productos";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const productos = await getProductos();
  return <PosView productos={productos} />;
}
