import { getSupabase } from "@/lib/supabase/client";

export type PagoHist = {
  id: string;
  monto: number;
  metodo: string;
  categoria: string;
  fecha: string;
};

export type AccesoHist = {
  id: string;
  entrada: string;
  salida: string | null;
};

/**
 * Historial DEL miembro indicado (filtrado por su miembro_id). Nunca mezcla
 * datos de otros miembros.
 */
export async function getHistorial(
  miembroId: string,
): Promise<{ pagos: PagoHist[]; accesos: AccesoHist[] }> {
  const sb = getSupabase();
  const [pagosRes, accesosRes] = await Promise.all([
    sb
      .from("pagos")
      .select("id,monto,metodo,categoria,fecha")
      .eq("miembro_id", miembroId)
      .order("fecha", { ascending: false })
      .limit(50),
    sb
      .from("accesos")
      .select("id,entrada,salida")
      .eq("miembro_id", miembroId)
      .order("entrada", { ascending: false })
      .limit(50),
  ]);

  const pagos = (pagosRes.data ?? []).map((p) => ({
    id: p.id as string,
    monto: Number(p.monto),
    metodo: p.metodo as string,
    categoria: p.categoria as string,
    fecha: p.fecha as string,
  }));

  const accesos = (accesosRes.data ?? []) as AccesoHist[];
  return { pagos, accesos };
}
