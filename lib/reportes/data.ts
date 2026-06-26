import { getServerSupabase } from "@/lib/supabase/server";
import { estadoEfectivo, hoyISO } from "@/lib/miembros/estado";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

export type SerieMes = { mes: string; ingresos: number; egresos: number };
export type Punto = { label: string; value: number };
export type ReportesData = {
  refMonthLabel: string;
  // KPIs del mes de referencia
  ingresosMes: number;
  egresosMes: number;
  gananciaMes: number;
  miembrosActivos: number;
  nuevosMes: number;
  accesosMes: number;
  // Series
  ingresosEgresos: SerieMes[]; // últimos 6 meses
  ingresosPorCategoria: Punto[];
  egresosPorCategoria: Punto[];
  miembrosPorPlan: Punto[];
  activosVencidos: { activos: number; vencidos: number };
  nuevosPorMes: Punto[]; // altas por mes (últimos 6)
  accesosPorDia: Punto[]; // últimos 14 días
};

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

function sumBy<T>(arr: T[], f: (x: T) => number): number {
  return arr.reduce((s, x) => s + f(x), 0);
}
function groupSum<T>(arr: T[], key: (x: T) => string, val: (x: T) => number): Punto[] {
  const m = new Map<string, number>();
  arr.forEach((x) => m.set(key(x), (m.get(key(x)) ?? 0) + val(x)));
  return Array.from(m.entries())
    .map(([label, value]) => ({ label: cap(label), value }))
    .sort((a, b) => b.value - a.value);
}

export async function getReportesData(): Promise<ReportesData> {
  const sb = getServerSupabase();
  const [pagosRes, egresosRes, miembrosRes, accesosRes] = await Promise.all([
    sb.from("pagos").select("monto,categoria,metodo,fecha").limit(5000),
    sb.from("egresos").select("monto,categoria,fecha").limit(5000),
    sb.from("miembros").select("estado,plan,fecha_inicio,fecha_vencimiento").limit(3000),
    sb.from("accesos").select("entrada").limit(8000),
  ]);

  const pagos = (pagosRes.data ?? []).map((p) => ({
    monto: Number(p.monto),
    categoria: (p.categoria as string) ?? "otros",
    metodo: (p.metodo as string) ?? "efectivo",
    fecha: p.fecha as string,
  }));
  const egresos = (egresosRes.data ?? []).map((e) => ({
    monto: Number(e.monto),
    categoria: (e.categoria as string) ?? "otros",
    fecha: e.fecha as string,
  }));
  const miembros = (miembrosRes.data ?? []).map((m) => ({
    estado: (m.estado as string) ?? "activo",
    plan: (m.plan as string) ?? "—",
    fechaInicio: (m.fecha_inicio as string) ?? "",
    fechaVenc: (m.fecha_vencimiento as string) ?? "",
  }));
  const accesos = (accesosRes.data ?? []).map((a) => ({ entrada: a.entrada as string }));

  // Mes de referencia = el más reciente con pagos (mantiene el demo vivo).
  const refDate =
    pagos.length > 0
      ? pagos.map((p) => p.fecha.slice(0, 10)).sort().at(-1)!
      : new Date().toISOString().slice(0, 10);
  const refMonth = refDate.slice(0, 7);
  const ry = Number(refMonth.slice(0, 4));
  const rm = Number(refMonth.slice(5, 7));

  // Series mensuales (últimos 6 meses)
  const ingresosEgresos: SerieMes[] = [];
  const nuevosPorMes: Punto[] = [];
  for (let k = 5; k >= 0; k--) {
    const d = new Date(Date.UTC(ry, rm - 1 - k, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const label = MESES[d.getUTCMonth()];
    ingresosEgresos.push({
      mes: label,
      ingresos: sumBy(pagos.filter((p) => p.fecha.slice(0, 7) === key), (p) => p.monto),
      egresos: sumBy(egresos.filter((e) => e.fecha.slice(0, 7) === key), (e) => e.monto),
    });
    nuevosPorMes.push({
      label,
      value: miembros.filter((m) => m.fechaInicio.slice(0, 7) === key).length,
    });
  }

  // KPIs del mes de referencia
  const ingresosMes = sumBy(pagos.filter((p) => p.fecha.slice(0, 7) === refMonth), (p) => p.monto);
  const egresosMes = sumBy(egresos.filter((e) => e.fecha.slice(0, 7) === refMonth), (e) => e.monto);
  const nuevosMes = miembros.filter((m) => m.fechaInicio.slice(0, 7) === refMonth).length;
  const accesosMes = accesos.filter((a) => a.entrada.slice(0, 7) === refMonth).length;

  // Desgloses del mes de referencia
  const ingresosPorCategoria = groupSum(
    pagos.filter((p) => p.fecha.slice(0, 7) === refMonth),
    (p) => p.categoria,
    (p) => p.monto,
  );
  const egresosPorCategoria = groupSum(
    egresos.filter((e) => e.fecha.slice(0, 7) === refMonth),
    (e) => e.categoria,
    (e) => e.monto,
  );

  // Miembros (estado en vivo por fecha)
  const hoy = hoyISO();
  const miembrosPorPlan = groupSum(miembros, (m) => m.plan, () => 1);
  let activos = 0;
  let vencidos = 0;
  miembros.forEach((m) => {
    const ef = estadoEfectivo(m.estado, m.fechaVenc, hoy);
    if (ef === "activo") activos++;
    else if (ef === "vencido") vencidos++;
  });

  // Accesos por día (últimos 14 días hasta refDate)
  const accesosPorDia: Punto[] = [];
  const baseDate = new Date(`${refDate}T00:00:00Z`);
  for (let k = 13; k >= 0; k--) {
    const d = new Date(baseDate.getTime() - k * 86400000);
    const dayKey = d.toISOString().slice(0, 10);
    accesosPorDia.push({
      label: `${DIAS[d.getUTCDay()]} ${d.getUTCDate()}`,
      value: accesos.filter((a) => a.entrada.slice(0, 10) === dayKey).length,
    });
  }

  const refMonthLabel = `${cap(MESES_LARGO[rm - 1])} ${ry}`;

  return {
    refMonthLabel,
    ingresosMes,
    egresosMes,
    gananciaMes: ingresosMes - egresosMes,
    miembrosActivos: activos,
    nuevosMes,
    accesosMes,
    ingresosEgresos,
    ingresosPorCategoria,
    egresosPorCategoria,
    miembrosPorPlan,
    activosVencidos: { activos, vencidos },
    nuevosPorMes,
    accesosPorDia,
  };
}

const MESES_LARGO = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
