import { CajaView } from "@/components/caja/CajaView";
import { getCajaData } from "@/lib/caja/data";
import { getSessionPerfil } from "@/lib/auth/perfil";

export const dynamic = "force-dynamic";

export default async function CajaPage() {
  const perfil = await getSessionPerfil();
  const rol = perfil?.rol ?? "cajero";
  const data = await getCajaData(rol);
  return <CajaView data={data} rol={rol} />;
}
