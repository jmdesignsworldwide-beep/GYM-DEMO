import { getServerSupabase } from "@/lib/supabase/server";

export type PagoItem = {
  id: string;
  miembroId: string | null;
  miembro: string;
  monto: number;
  metodo: string;
  categoria: string;
  fecha: string;
};

export type Pendiente = { id: string; nombre: string; plan: string; deuda: number };

export type PagosData = {
  pagos: PagoItem[];
  totalDia: number;
  totalMes: number;
  porMetodo: { metodo: string; total: number }[];
  pendientes: Pendiente[];
  totalPorCobrar: number;
  refDate: string;
  refMonth: string;
};

export async function getPagosData(): Promise<PagosData> {
  const sb = getServerSupabase();

  const [pagosRes, miembrosRes] = await Promise.all([
    sb
      .from("pagos")
      .select("id,monto,metodo,categoria,fecha,miembro_id,miembros(nombre)")
      .order("fecha", { ascending: false })
      .limit(3000),
    sb.from("miembros").select("id,nombre,plan,deuda").gt("deuda", 0).limit(2000),
  ]);

  const pagos: PagoItem[] = (pagosRes.data ?? []).map((p) => {
    const rel = p.miembros as { nombre?: string } | { nombre?: string }[] | null;
    const nombre = Array.isArray(rel) ? rel[0]?.nombre : rel?.nombre;
    return {
      id: p.id as string,
      miembroId: (p.miembro_id as string) ?? null,
      miembro: nombre ?? "Miembro",
      monto: Number(p.monto),
      metodo: p.metodo as string,
      categoria: p.categoria as string,
      fecha: p.fecha as string,
    };
  });

  const refDate = pagos.length ? pagos[0].fecha.slice(0, 10) : new Date().toISOString().slice(0, 10);
  const refMonth = refDate.slice(0, 7);

  const delDia = pagos.filter((p) => p.fecha.slice(0, 10) === refDate);
  const delMes = pagos.filter((p) => p.fecha.slice(0, 7) === refMonth);

  const totalDia = delDia.reduce((s, p) => s + p.monto, 0);
  const totalMes = delMes.reduce((s, p) => s + p.monto, 0);

  const metodoMap = new Map<string, number>();
  for (const p of delMes) metodoMap.set(p.metodo, (metodoMap.get(p.metodo) ?? 0) + p.monto);
  const porMetodo = Array.from(metodoMap, ([metodo, total]) => ({ metodo, total })).sort(
    (a, b) => b.total - a.total,
  );

  const pendientes: Pendiente[] = (miembrosRes.data ?? [])
    .map((m) => ({
      id: m.id as string,
      nombre: m.nombre as string,
      plan: m.plan as string,
      deuda: Number(m.deuda),
    }))
    .sort((a, b) => b.deuda - a.deuda);

  const totalPorCobrar = pendientes.reduce((s, p) => s + p.deuda, 0);

  return { pagos, totalDia, totalMes, porMetodo, pendientes, totalPorCobrar, refDate, refMonth };
}
