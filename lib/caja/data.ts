import { getServerSupabase } from "@/lib/supabase/server";

export type EgresoItem = {
  id: string;
  monto: number;
  categoria: string;
  nota: string | null;
  fecha: string;
};

export type Sesion = {
  id: string;
  base: number;
  abierta_por_nombre: string | null;
  abierta_at: string;
};

export type CajaData = {
  refDate: string;
  fechaLabel: string;
  sesion: Sesion | null;
  ingresosTotal: number;
  porMetodo: { metodo: string; total: number }[];
  ingresosEfectivo: number;
  egresosTotal: number;
  egresos: EgresoItem[];
  balance: number;
  esperadoEfectivo: number;
};

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export async function getCajaData(): Promise<CajaData> {
  const sb = getServerSupabase();
  const [pagosRes, egresosRes, sesionRes] = await Promise.all([
    sb.from("pagos").select("monto,metodo,fecha").order("fecha", { ascending: false }).limit(3000),
    sb.from("egresos").select("id,monto,categoria,nota,fecha").order("fecha", { ascending: false }).limit(2000),
    sb
      .from("caja_sesiones")
      .select("id,base,abierta_por_nombre,abierta_at")
      .eq("estado", "abierta")
      .order("abierta_at", { ascending: false })
      .limit(1),
  ]);

  const pagos = (pagosRes.data ?? []).map((p) => ({
    monto: Number(p.monto),
    metodo: p.metodo as string,
    fecha: p.fecha as string,
  }));

  const refDate = pagos.length ? pagos[0].fecha.slice(0, 10) : new Date().toISOString().slice(0, 10);

  const hoyPagos = pagos.filter((p) => p.fecha.slice(0, 10) === refDate);
  const ingresosTotal = hoyPagos.reduce((s, p) => s + p.monto, 0);

  const metodoMap = new Map<string, number>();
  for (const p of hoyPagos) metodoMap.set(p.metodo, (metodoMap.get(p.metodo) ?? 0) + p.monto);
  const porMetodo = Array.from(metodoMap, ([metodo, total]) => ({ metodo, total })).sort(
    (a, b) => b.total - a.total,
  );
  const ingresosEfectivo = metodoMap.get("efectivo") ?? 0;

  const egresos: EgresoItem[] = (egresosRes.data ?? [])
    .map((e) => ({
      id: e.id as string,
      monto: Number(e.monto),
      categoria: e.categoria as string,
      nota: (e.nota as string) ?? null,
      fecha: e.fecha as string,
    }))
    .filter((e) => e.fecha.slice(0, 10) === refDate);
  const egresosTotal = egresos.reduce((s, e) => s + e.monto, 0);

  const sesionRow = sesionRes.data?.[0];
  const sesion: Sesion | null = sesionRow
    ? {
        id: sesionRow.id as string,
        base: Number(sesionRow.base),
        abierta_por_nombre: (sesionRow.abierta_por_nombre as string) ?? null,
        abierta_at: sesionRow.abierta_at as string,
      }
    : null;

  const balance = ingresosTotal - egresosTotal;
  const esperadoEfectivo = (sesion?.base ?? 0) + ingresosEfectivo - egresosTotal;

  const d = new Date(`${refDate}T00:00:00Z`);
  const cruda = `${DIAS[d.getUTCDay()]}, ${d.getUTCDate()} de ${MESES[d.getUTCMonth()]}`;
  const fechaLabel = cruda.charAt(0).toUpperCase() + cruda.slice(1);

  return {
    refDate,
    fechaLabel,
    sesion,
    ingresosTotal,
    porMetodo,
    ingresosEfectivo,
    egresosTotal,
    egresos,
    balance,
    esperadoEfectivo,
  };
}
