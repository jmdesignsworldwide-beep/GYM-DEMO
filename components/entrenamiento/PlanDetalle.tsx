"use client";

import { useEffect, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Pencil, CalendarPlus, Check, X, TrendingUp, Plus } from "lucide-react";
import { Avatar } from "@/components/miembros/Avatar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/motion/Skeleton";
import {
  getDetallePlan,
  reservarSesion,
  completarSesion,
  cancelarSesion,
  registrarProgreso,
} from "@/app/(app)/entrenamiento/actions";
import type { PlanPt, SesionPt, Progreso } from "@/lib/entrenamiento/data";
import { formatRD, formatFechaHora, formatFechaCorta } from "@/lib/format";

const field =
  "h-11 w-full rounded-lg border bg-bg-2 px-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none";

const ESTADO_BADGE: Record<string, string> = {
  reservada: "bg-accent-soft text-accent",
  completada: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  cancelada: "bg-zinc-500/15 text-zinc-500",
};

export function PlanDetalle({
  plan,
  esAdmin,
  onEditar,
  onCambio,
}: {
  plan: PlanPt;
  esAdmin: boolean;
  onEditar: () => void;
  onCambio: () => void;
}) {
  const [data, setData] = useState<{ sesiones: SesionPt[]; progreso: Progreso[] } | null>(null);

  // reservar
  const [fecha, setFecha] = useState("");
  const [tipo, setTipo] = useState("incluida");
  const [metodo, setMetodo] = useState("efectivo");
  const [resBusy, setResBusy] = useState(false);
  const [resMsg, setResMsg] = useState<string | null>(null);

  // progreso
  const [prog, setProg] = useState({ peso: "", grasa: "", cintura: "", pecho: "", brazo: "", nota: "" });
  const [progBusy, setProgBusy] = useState(false);

  async function cargar() {
    const d = await getDetallePlan(plan.miembroId);
    setData(d);
  }
  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.miembroId]);

  async function reservar() {
    if (resBusy) return;
    setResBusy(true);
    setResMsg(null);
    const res = await reservarSesion({
      miembroId: plan.miembroId,
      entrenadorId: plan.entrenadorId ?? "",
      fecha,
      tipo,
      precioAdicional: plan.precioSesionAdicional,
      metodo,
    });
    setResBusy(false);
    if (res.ok) {
      setFecha("");
      setResMsg(
        tipo === "adicional"
          ? `Sesión reservada y cobrada (${formatRD(plan.precioSesionAdicional)}) — entró a Caja.`
          : "Sesión reservada.",
      );
      cargar();
      onCambio();
    } else {
      setResMsg(res.error ?? "Error.");
    }
  }

  async function completar(s: SesionPt) {
    const res = await completarSesion(s.id);
    if (res.ok) {
      cargar();
      onCambio();
    }
  }
  async function cancelar(s: SesionPt) {
    const res = await cancelarSesion(s.id);
    if (res.ok) {
      cargar();
      onCambio();
    }
  }

  async function guardarProgreso() {
    if (progBusy) return;
    const num = (v: string) => (v.trim() === "" ? null : Number(v));
    setProgBusy(true);
    const res = await registrarProgreso({
      miembroId: plan.miembroId,
      peso: num(prog.peso),
      grasa: num(prog.grasa),
      cintura: num(prog.cintura),
      pecho: num(prog.pecho),
      brazo: num(prog.brazo),
      nota: prog.nota,
    });
    setProgBusy(false);
    if (res.ok) {
      setProg({ peso: "", grasa: "", cintura: "", pecho: "", brazo: "", nota: "" });
      cargar();
    }
  }

  const restantes = Math.max(0, plan.sesionesIncluidas - plan.usadas);
  const chartData =
    data?.progreso
      .filter((p) => p.peso != null)
      .map((p) => ({ fecha: p.fecha.slice(5, 10), peso: p.peso, grasa: p.grasa })) ?? [];

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <Avatar nombre={plan.miembroNombre} foto={plan.miembroFoto} size={56} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-semibold text-ink">{plan.miembroNombre}</p>
          <p className="text-sm text-ink-muted">{plan.objetivo ?? "Plan personalizado"}</p>
          {plan.entrenadorNombre && <p className="text-xs text-ink-faint">con {plan.entrenadorNombre}</p>}
        </div>
        {esAdmin && (
          <Button variant="secondary" magnetic={false} onClick={onEditar}>
            <Pencil size={15} /> Editar
          </Button>
        )}
      </div>

      {/* Sesiones incluidas */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-bg-2 p-3">
          <p className="font-display text-xl font-bold text-ink">{restantes}</p>
          <p className="text-xs text-ink-faint">incluidas restantes</p>
        </div>
        <div className="rounded-lg bg-bg-2 p-3">
          <p className="font-display text-xl font-bold text-ink">{plan.usadas}</p>
          <p className="text-xs text-ink-faint">completadas</p>
        </div>
        <div className="rounded-lg bg-bg-2 p-3">
          <p className="font-display text-xl font-bold text-accent">{plan.adicionales}</p>
          <p className="text-xs text-ink-faint">adicionales</p>
        </div>
      </div>

      {/* Reservar sesión */}
      <div className="space-y-2 rounded-lg border border-line p-4">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
          <CalendarPlus size={15} /> Reservar sesión
        </p>
        <input
          className={field}
          type="datetime-local"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <select className={field} value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="incluida">Incluida en el plan</option>
            <option value="adicional">Adicional (se cobra)</option>
          </select>
          {tipo === "adicional" && (
            <select className={field} value={metodo} onChange={(e) => setMetodo(e.target.value)}>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </select>
          )}
        </div>
        {tipo === "adicional" && (
          <p className="text-xs text-ink-faint">
            Se cobrará {formatRD(plan.precioSesionAdicional)} y entrará a Caja.
          </p>
        )}
        <Button magnetic={false} loading={resBusy} className="w-full" onClick={reservar}>
          {tipo === "adicional" ? "Reservar y cobrar" : "Reservar sesión"}
        </Button>
        {resMsg && <p className="text-sm text-ink-muted">{resMsg}</p>}
      </div>

      {/* Progreso */}
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
          <TrendingUp size={15} /> Progreso
        </p>
        {!data ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <>
            {chartData.length >= 2 && (
              <div className="h-44 w-full rounded-lg bg-bg-2 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--line)" />
                    <XAxis dataKey="fecha" tickLine={false} axisLine={false} tick={{ fill: "var(--text-3)", fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} width={34} tick={{ fill: "var(--text-3)", fontSize: 11 }} domain={["dataMin - 2", "dataMax + 2"]} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-2)",
                        border: "1px solid var(--line)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "var(--text-2)" }}
                    />
                    <Line type="monotone" dataKey="peso" name="Peso (kg)" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {data.progreso.length > 0 && (
              <div className="mt-2 space-y-1">
                {[...data.progreso].reverse().slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg bg-bg-2 px-3 py-2 text-sm">
                    <span className="text-ink-muted">{formatFechaCorta(p.fecha)}</span>
                    <span className="tabular-nums text-ink">
                      {p.peso != null && `${p.peso} kg`}
                      {p.grasa != null && ` · ${p.grasa}% grasa`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Registrar medida */}
            <div className="mt-3 space-y-2 rounded-lg border border-line p-3">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
                <Plus size={14} /> Registrar medida
              </p>
              <div className="grid grid-cols-3 gap-2">
                <input className={field} type="number" step="0.1" placeholder="Peso kg" value={prog.peso} onChange={(e) => setProg((s) => ({ ...s, peso: e.target.value }))} />
                <input className={field} type="number" step="0.1" placeholder="% grasa" value={prog.grasa} onChange={(e) => setProg((s) => ({ ...s, grasa: e.target.value }))} />
                <input className={field} type="number" step="0.1" placeholder="Cintura" value={prog.cintura} onChange={(e) => setProg((s) => ({ ...s, cintura: e.target.value }))} />
              </div>
              <Button magnetic={false} loading={progBusy} variant="secondary" className="w-full" onClick={guardarProgreso}>
                Guardar medida
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Sesiones */}
      <div>
        <p className="mb-2 text-sm font-semibold text-ink-muted">Sesiones</p>
        {!data ? (
          <Skeleton className="h-16 w-full" />
        ) : data.sesiones.length === 0 ? (
          <p className="text-sm text-ink-faint">Aún no hay sesiones. Reserva la primera arriba.</p>
        ) : (
          <div className="space-y-1">
            {data.sesiones.map((s) => (
              <div key={s.id} className="flex items-center gap-2 rounded-lg bg-bg-2 px-3 py-2 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="text-ink">{formatFechaHora(s.fecha)}</p>
                  <p className="text-xs text-ink-faint">
                    {s.tipo === "adicional" ? "Adicional" : "Incluida"}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ESTADO_BADGE[s.estado] ?? ""}`}>
                  {s.estado.charAt(0).toUpperCase() + s.estado.slice(1)}
                </span>
                {s.estado === "reservada" && (
                  <>
                    <button
                      type="button"
                      onClick={() => completar(s)}
                      aria-label="Completar"
                      className="grid h-7 w-7 place-items-center rounded-full text-ink-faint hover:bg-bg-3 hover:text-emerald-500"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => cancelar(s)}
                      aria-label="Cancelar"
                      className="grid h-7 w-7 place-items-center rounded-full text-ink-faint hover:bg-bg-3 hover:text-red-500"
                    >
                      <X size={15} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
