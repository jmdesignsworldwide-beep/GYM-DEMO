import { getServerSupabase } from "@/lib/supabase/server";

// ── Tipos del dashboard ─────────────────────────────────────────────
export type MiembroLite = {
  id: string;
  nombre: string;
  plan: string;
  telefono: string;
  precio_mensual: number;
  estado: string;
  fecha_vencimiento: string; // YYYY-MM-DD
};

export type AccesoReciente = MiembroLite & { hora: string };
export type PuntoTendencia = { mes: string; total: number };

export type DashboardData = {
  fechaLabel: string;
  cajaHoy: {
    total: number;
    porMetodo: { metodo: string; total: number }[];
    porCategoria: { categoria: string; total: number }[];
  };
  ingresosMes: number;
  miembrosActivos: number;
  totalMiembros: number;
  vencidos: number;
  planes: { plan: string; count: number }[];
  enGymAhora: number;
  enGymLista: MiembroLite[];
  vencenSemana: MiembroLite[];
  vencenHoy: MiembroLite[];
  pendientes: MiembroLite[];
  ultimosAccesos: AccesoReciente[];
  tendencia: PuntoTendencia[];
};

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES_LARGO = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function horaLabel(iso: string): string {
  const hh = Number(iso.slice(11, 13));
  const mm = iso.slice(14, 16);
  const ampm = hh >= 12 ? "p.m." : "a.m.";
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${mm} ${ampm}`;
}

function addDaysUTC(ymd: string, days: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function sumBy<T>(rows: T[], pick: (r: T) => number): number {
  return rows.reduce((s, r) => s + pick(r), 0);
}

function groupSum<T>(rows: T[], key: (r: T) => string, val: (r: T) => number) {
  const map = new Map<string, number>();
  for (const r of rows) map.set(key(r), (map.get(key(r)) ?? 0) + val(r));
  return Array.from(map, ([k, total]) => ({ key: k, total })).sort((a, b) => b.total - a.total);
}

export async function getDashboardData(): Promise<DashboardData> {
  const sb = getServerSupabase();

  const [miembrosRes, pagosRes, accesosRes] = await Promise.all([
    sb.from("miembros").select("id,nombre,plan,telefono,precio_mensual,estado,fecha_vencimiento").limit(1000),
    sb.from("pagos").select("monto,metodo,categoria,fecha").limit(3000),
    sb.from("accesos").select("entrada,salida,miembro_id").limit(3000),
  ]);

  const miembros = (miembrosRes.data ?? []).map((m) => ({
    ...m,
    precio_mensual: Number(m.precio_mensual),
  })) as MiembroLite[];

  const pagos = (pagosRes.data ?? []).map((p) => ({
    monto: Number(p.monto),
    metodo: p.metodo as string,
    categoria: p.categoria as string,
    fecha: p.fecha as string,
  }));

  const accesos = (accesosRes.data ?? []) as {
    entrada: string;
    salida: string | null;
    miembro_id: string;
  }[];

  const miembroPorId = new Map(miembros.map((m) => [m.id, m]));

  // Día de referencia = el día más reciente con pagos (mantiene el demo vivo).
  const refDate =
    pagos.length > 0
      ? pagos.map((p) => p.fecha.slice(0, 10)).sort().at(-1)!
      : new Date().toISOString().slice(0, 10);
  const refMonth = refDate.slice(0, 7);

  // Caja del día
  const hoyPagos = pagos.filter((p) => p.fecha.slice(0, 10) === refDate);
  const cajaHoy = {
    total: sumBy(hoyPagos, (p) => p.monto),
    porMetodo: groupSum(hoyPagos, (p) => p.metodo, (p) => p.monto).map((g) => ({
      metodo: g.key,
      total: g.total,
    })),
    porCategoria: groupSum(hoyPagos, (p) => p.categoria, (p) => p.monto).map((g) => ({
      categoria: g.key,
      total: g.total,
    })),
  };

  const ingresosMes = sumBy(
    pagos.filter((p) => p.fecha.slice(0, 7) === refMonth),
    (p) => p.monto,
  );

  // Tendencia: últimos 8 meses
  const ry = Number(refMonth.slice(0, 4));
  const rm = Number(refMonth.slice(5, 7));
  const tendencia: PuntoTendencia[] = [];
  for (let k = 7; k >= 0; k--) {
    const d = new Date(Date.UTC(ry, rm - 1 - k, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    tendencia.push({
      mes: MESES[d.getUTCMonth()],
      total: sumBy(pagos.filter((p) => p.fecha.slice(0, 7) === key), (p) => p.monto),
    });
  }

  const miembrosActivos = miembros.filter((m) => m.estado === "activo").length;

  // Gente en el gym ahora: miembros DISTINTOS con acceso activo (salida null).
  const enGymIds = new Set<string>();
  const enGymLista: MiembroLite[] = [];
  for (const a of accesos) {
    if (a.salida !== null) continue;
    if (enGymIds.has(a.miembro_id)) continue;
    enGymIds.add(a.miembro_id);
    const m = miembroPorId.get(a.miembro_id);
    if (m) enGymLista.push(m);
  }
  const enGymAhora = enGymLista.length;

  // Resumen por plan
  const planMap = new Map<string, number>();
  for (const m of miembros) planMap.set(m.plan, (planMap.get(m.plan) ?? 0) + 1);
  const planes = Array.from(planMap, ([plan, count]) => ({ plan, count })).sort(
    (a, b) => b.count - a.count,
  );

  const semanaFin = addDaysUTC(refDate, 6);
  const vencenHoy = miembros.filter((m) => m.fecha_vencimiento === refDate);
  const vencenSemana = miembros
    .filter((m) => m.fecha_vencimiento >= refDate && m.fecha_vencimiento <= semanaFin)
    .sort((a, b) => a.fecha_vencimiento.localeCompare(b.fecha_vencimiento));

  const pendientes: MiembroLite[] = miembros
    .filter((m) => m.estado === "vencido")
    .sort((a, b) => b.precio_mensual - a.precio_mensual);

  // Últimos accesos: miembros DISTINTOS, del más reciente al más antiguo.
  const vistos = new Set<string>();
  const ultimosAccesos: AccesoReciente[] = [];
  for (const a of [...accesos].sort((x, y) => y.entrada.localeCompare(x.entrada))) {
    if (vistos.has(a.miembro_id)) continue;
    const m = miembroPorId.get(a.miembro_id);
    if (!m) continue;
    vistos.add(a.miembro_id);
    ultimosAccesos.push({ ...m, hora: horaLabel(a.entrada) });
    if (ultimosAccesos.length >= 8) break;
  }

  // Etiqueta de fecha en español: solo la inicial en mayúscula ("Miércoles, 24 de junio").
  const dref = new Date(`${refDate}T00:00:00Z`);
  const fechaCruda = `${DIAS[dref.getUTCDay()]}, ${dref.getUTCDate()} de ${MESES_LARGO[dref.getUTCMonth()]}`;
  const fechaLabel = fechaCruda.charAt(0).toUpperCase() + fechaCruda.slice(1);

  return {
    fechaLabel,
    cajaHoy,
    ingresosMes,
    miembrosActivos,
    totalMiembros: miembros.length,
    vencidos: pendientes.length,
    planes,
    enGymAhora,
    enGymLista,
    vencenSemana,
    vencenHoy,
    pendientes,
    ultimosAccesos,
    tendencia,
  };
}
