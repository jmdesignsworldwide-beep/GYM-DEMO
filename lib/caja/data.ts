import { getServerSupabase } from "@/lib/supabase/server";

export type EgresoItem = {
  id: string;
  monto: number;
  categoria: string;
  nota: string | null;
  fecha: string;
};

export type Movimiento = {
  id: string;
  tipo: "ingreso" | "egreso";
  etiqueta: string;
  metodo: string | null;
  monto: number;
  fecha: string;
};

export type Cierre = {
  id: string;
  abierta_por_nombre: string | null;
  base: number;
  efectivo_contado: number | null;
  abierta_at: string;
  cerrada_at: string | null;
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
  movimientos: Movimiento[];
  balance: number;
  esperadoEfectivo: number;
  // Solo admin:
  reportes?: {
    semana: { ingresos: number; egresos: number };
    mes: { ingresos: number; egresos: number };
  };
  cierres?: Cierre[];
};

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function addDays(ymd: string, n: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export async function getCajaData(rol: string): Promise<CajaData> {
  const esAdmin = rol === "admin";
  const sb = getServerSupabase();
  const [pagosRes, egresosRes, sesionRes, cierresRes] = await Promise.all([
    sb.from("pagos").select("id,monto,metodo,categoria,fecha").order("fecha", { ascending: false }).limit(3000),
    sb.from("egresos").select("id,monto,categoria,nota,fecha").order("fecha", { ascending: false }).limit(3000),
    sb
      .from("caja_sesiones")
      .select("id,base,abierta_por_nombre,abierta_at")
      .eq("estado", "abierta")
      .order("abierta_at", { ascending: false })
      .limit(1),
    esAdmin
      ? sb
          .from("caja_sesiones")
          .select("id,abierta_por_nombre,base,efectivo_contado,abierta_at,cerrada_at")
          .eq("estado", "cerrada")
          .order("cerrada_at", { ascending: false })
          .limit(10)
      : Promise.resolve({ data: [] }),
  ]);

  const pagos = (pagosRes.data ?? []).map((p) => ({
    id: p.id as string,
    monto: Number(p.monto),
    metodo: p.metodo as string,
    categoria: p.categoria as string,
    fecha: p.fecha as string,
  }));
  const egresosAll = (egresosRes.data ?? []).map((e) => ({
    id: e.id as string,
    monto: Number(e.monto),
    categoria: e.categoria as string,
    nota: (e.nota as string) ?? null,
    fecha: e.fecha as string,
  }));

  const refDate = pagos.length ? pagos[0].fecha.slice(0, 10) : new Date().toISOString().slice(0, 10);
  const refMonth = refDate.slice(0, 7);

  const hoyPagos = pagos.filter((p) => p.fecha.slice(0, 10) === refDate);
  const ingresosTotal = hoyPagos.reduce((s, p) => s + p.monto, 0);

  const metodoMap = new Map<string, number>();
  for (const p of hoyPagos) metodoMap.set(p.metodo, (metodoMap.get(p.metodo) ?? 0) + p.monto);
  const porMetodo = Array.from(metodoMap, ([metodo, total]) => ({ metodo, total })).sort(
    (a, b) => b.total - a.total,
  );
  const ingresosEfectivo = metodoMap.get("efectivo") ?? 0;

  const egresos = egresosAll.filter((e) => e.fecha.slice(0, 10) === refDate);
  const egresosTotal = egresos.reduce((s, e) => s + e.monto, 0);

  const movimientos: Movimiento[] = [
    ...hoyPagos.map((p) => ({
      id: `p-${p.id}`,
      tipo: "ingreso" as const,
      etiqueta: cap(p.categoria),
      metodo: p.metodo,
      monto: p.monto,
      fecha: p.fecha,
    })),
    ...egresos.map((e) => ({
      id: `e-${e.id}`,
      tipo: "egreso" as const,
      etiqueta: e.categoria,
      metodo: null,
      monto: e.monto,
      fecha: e.fecha,
    })),
  ].sort((a, b) => b.fecha.localeCompare(a.fecha));

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

  const base: CajaData = {
    refDate,
    fechaLabel,
    sesion,
    ingresosTotal,
    porMetodo,
    ingresosEfectivo,
    egresosTotal,
    egresos,
    movimientos,
    balance,
    esperadoEfectivo,
  };

  // Reportes y cierres: SOLO admin (el servidor no los entrega al cajero).
  if (esAdmin) {
    const semanaIni = addDays(refDate, -6);
    const inRange = (f: string) => f.slice(0, 10) >= semanaIni && f.slice(0, 10) <= refDate;
    const inMonth = (f: string) => f.slice(0, 7) === refMonth;
    base.reportes = {
      semana: {
        ingresos: pagos.filter((p) => inRange(p.fecha)).reduce((s, p) => s + p.monto, 0),
        egresos: egresosAll.filter((e) => inRange(e.fecha)).reduce((s, e) => s + e.monto, 0),
      },
      mes: {
        ingresos: pagos.filter((p) => inMonth(p.fecha)).reduce((s, p) => s + p.monto, 0),
        egresos: egresosAll.filter((e) => inMonth(e.fecha)).reduce((s, e) => s + e.monto, 0),
      },
    };
    base.cierres = (cierresRes.data ?? []).map((c) => ({
      id: c.id as string,
      abierta_por_nombre: (c.abierta_por_nombre as string) ?? null,
      base: Number(c.base),
      efectivo_contado: c.efectivo_contado == null ? null : Number(c.efectivo_contado),
      abierta_at: c.abierta_at as string,
      cerrada_at: (c.cerrada_at as string) ?? null,
    }));
  }

  return base;
}
