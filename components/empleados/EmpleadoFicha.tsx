"use client";

import { useEffect, useState } from "react";
import { Pencil, Phone, IdCard, CalendarDays, Clock, DollarSign, Dumbbell } from "lucide-react";
import { Avatar } from "@/components/miembros/Avatar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/motion/Skeleton";
import { getFichaEmpleado, registrarNomina, type FichaEmpleado } from "@/app/(app)/empleados/actions";
import { type Empleado, PUESTO_LABEL, estadoEmpleado } from "@/lib/empleados/data";
import { formatRD, formatFechaCorta, formatFechaHora } from "@/lib/format";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function Dato({ icon: Icon, children }: { icon: typeof Phone; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-ink">
      <Icon size={15} className="shrink-0 text-ink-faint" />
      <span>{children}</span>
    </div>
  );
}

export function EmpleadoFicha({
  empleado,
  esAdmin,
  onEditar,
  onCambio,
}: {
  empleado: Empleado;
  esAdmin: boolean;
  onEditar: () => void;
  onCambio: () => void;
}) {
  const [ficha, setFicha] = useState<FichaEmpleado | null>(null);
  const est = estadoEmpleado(empleado.estado);

  // form de nómina
  const [monto, setMonto] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [tipo, setTipo] = useState("salario");
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function cargar() {
    const f = await getFichaEmpleado(empleado.id);
    setFicha(f);
  }
  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empleado.id]);

  async function pagarNomina() {
    if (guardando) return;
    setGuardando(true);
    setMsg(null);
    const res = await registrarNomina({
      empleadoId: empleado.id,
      monto: Number(monto),
      periodo,
      tipo,
    });
    setGuardando(false);
    if (res.ok) {
      setMonto("");
      setPeriodo("");
      setMsg("Nómina registrada y enviada a Caja como egreso.");
      cargar();
      onCambio();
    } else {
      setMsg(res.error ?? "Error.");
    }
  }

  const field =
    "h-11 w-full rounded-lg border bg-bg-2 px-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none";

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <Avatar nombre={empleado.nombre} foto={empleado.fotoUrl} size={64} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-semibold text-ink">{empleado.nombre}</p>
          <p className="text-sm text-ink-muted">{PUESTO_LABEL[empleado.puesto] ?? empleado.puesto}</p>
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${est.badge}`}>
            {est.label}
          </span>
        </div>
        {esAdmin && (
          <Button variant="secondary" magnetic={false} onClick={onEditar}>
            <Pencil size={15} /> Editar
          </Button>
        )}
      </div>

      {/* Datos */}
      <div className="space-y-2 rounded-lg bg-bg-2 p-4">
        <Dato icon={IdCard}>{empleado.cedula}</Dato>
        {empleado.telefono && <Dato icon={Phone}>{empleado.telefono}</Dato>}
        {empleado.fechaIngreso && (
          <Dato icon={CalendarDays}>Ingreso: {formatFechaCorta(empleado.fechaIngreso)}</Dato>
        )}
        {empleado.horario && <Dato icon={Clock}>{empleado.horario}</Dato>}
        {esAdmin && empleado.salario != null && (
          <Dato icon={DollarSign}>Salario: {formatRD(empleado.salario)} / mes</Dato>
        )}
      </div>

      {empleado.especialidades.length > 0 && (
        <div>
          <p className="mb-1.5 text-sm font-semibold text-ink-muted">Especialidades</p>
          <div className="flex flex-wrap gap-2">
            {empleado.especialidades.map((s) => (
              <span key={s} className="rounded-full bg-accent-soft px-3 py-1 text-sm text-accent">
                {cap(s)}
              </span>
            ))}
          </div>
        </div>
      )}

      {empleado.notas && <p className="text-sm text-ink-muted">{empleado.notas}</p>}

      {/* Actividad */}
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
          <Dumbbell size={15} /> Actividad
        </p>
        {!ficha ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <div className="space-y-2">
            {ficha.clases.length === 0 && ficha.sesionesPt === 0 && (
              <p className="text-sm text-ink-faint">Sin clases ni sesiones asignadas.</p>
            )}
            {ficha.clases.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg bg-bg-2 px-3 py-2 text-sm">
                <span className="text-ink">
                  {cap(c.disciplina)} · {DIAS[c.dia]} {c.hora}
                </span>
                <span className="tabular-nums text-ink-muted">
                  {c.inscritos}/{c.capacidad}
                </span>
              </div>
            ))}
            {ficha.sesionesPt > 0 && (
              <p className="text-sm text-ink-muted">
                {ficha.sesionesPt} {ficha.sesionesPt === 1 ? "sesión" : "sesiones"} de entrenamiento personal
              </p>
            )}
          </div>
        )}
      </div>

      {/* Nómina y comisiones — solo admin */}
      {esAdmin && ficha?.esAdmin && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-bg-2 p-3">
              <p className="text-xs text-ink-faint">Nómina pagada</p>
              <p className="font-display text-lg font-bold text-ink">{formatRD(ficha.totalNomina)}</p>
            </div>
            <div className="rounded-lg bg-bg-2 p-3">
              <p className="text-xs text-ink-faint">Comisiones</p>
              <p className="font-display text-lg font-bold text-accent">{formatRD(ficha.totalComision)}</p>
            </div>
          </div>

          {/* Registrar nómina */}
          <div className="space-y-2 rounded-lg border border-line p-4">
            <p className="text-sm font-semibold text-ink-muted">Registrar pago de nómina</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                className={field}
                type="number"
                min={1}
                placeholder="Monto"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />
              <select className={field} value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="salario">Salario</option>
                <option value="bono">Bono</option>
                <option value="vacaciones">Vacaciones</option>
              </select>
            </div>
            <input
              className={field}
              placeholder="Período (ej. Junio 2026)"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
            />
            <Button magnetic={false} loading={guardando} className="w-full" onClick={pagarNomina}>
              Pagar y registrar en Caja
            </Button>
            {msg && <p className="text-sm text-ink-muted">{msg}</p>}
          </div>

          {ficha.nominas.length > 0 && (
            <div>
              <p className="mb-1.5 text-sm font-semibold text-ink-muted">Historial de nómina</p>
              <div className="space-y-1">
                {ficha.nominas.map((n) => (
                  <div key={n.id} className="flex items-center justify-between rounded-lg bg-bg-2 px-3 py-2 text-sm">
                    <span className="text-ink">
                      {cap(n.tipo)}
                      {n.periodo ? ` · ${n.periodo}` : ""}
                    </span>
                    <span className="tabular-nums font-medium text-ink">{formatRD(n.monto)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ficha.comisiones.length > 0 && (
            <div>
              <p className="mb-1.5 text-sm font-semibold text-ink-muted">Comisiones</p>
              <div className="space-y-1">
                {ficha.comisiones.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg bg-bg-2 px-3 py-2 text-sm">
                    <span className="text-ink">
                      {c.nota ?? cap(c.origen)}
                      <span className="ml-1 text-xs text-ink-faint">· {formatFechaHora(c.fecha)}</span>
                    </span>
                    <span className="tabular-nums font-medium text-accent">{formatRD(c.monto)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
