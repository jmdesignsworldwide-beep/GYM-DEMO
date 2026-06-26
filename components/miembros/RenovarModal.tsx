"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CalendarCheck } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { PLANES, precioDePlan, mesesDePlan, METODOS } from "@/lib/miembros/planes";
import { renovarMembresia, type RenovarResult } from "@/app/(app)/miembros/actions";
import { formatRD, formatFechaCorta } from "@/lib/format";
import type { Miembro } from "@/lib/miembros/data";

const field =
  "h-12 w-full rounded-lg border bg-bg-2 px-4 text-ink focus:border-accent focus:outline-none";
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function calcNueva(base: string, meses: number): string {
  const d = new Date(`${base}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + meses);
  return d.toISOString().slice(0, 10);
}

export function RenovarModal({
  miembro,
  open,
  onClose,
  onDone,
}: {
  miembro: Miembro;
  open: boolean;
  onClose: () => void;
  onDone: (r: RenovarResult) => void;
}) {
  const [plan, setPlan] = useState(miembro.plan);
  const [conPago, setConPago] = useState(true);
  const [metodo, setMetodo] = useState("efectivo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<RenovarResult | null>(null);

  useEffect(() => {
    if (open) {
      setPlan(miembro.plan);
      setConPago(true);
      setMetodo("efectivo");
      setError(null);
      setDone(null);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const meses = mesesDePlan(plan);
  // Si mantiene su plan, respeta su precio; si cambia, usa el del nuevo plan.
  const precioMensual = plan === miembro.plan ? miembro.precio_mensual : precioDePlan(plan);
  const cobrado = precioMensual * meses;

  const nuevaFecha = useMemo(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    const base = miembro.fecha_vencimiento > hoy ? miembro.fecha_vencimiento : hoy;
    return calcNueva(base, meses);
  }, [miembro.fecha_vencimiento, meses]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    const res = await renovarMembresia({
      miembroId: miembro.id,
      plan,
      meses,
      precioMensual,
      conPago,
      metodo,
    });
    setLoading(false);
    if (res.ok) {
      setDone(res);
      onDone(res);
    } else {
      setError(res.error ?? "No se pudo renovar.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={done ? "Membresía renovada" : "Renovar membresía"}>
      {done ? (
        <div className="space-y-4 text-center">
          <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
          <div className="rounded-lg bg-bg-2 p-4">
            <p className="flex items-center justify-center gap-2 text-sm text-ink-muted">
              <CalendarCheck size={16} className="text-accent" /> Vence ahora
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-ink">
              {formatFechaCorta(done.nuevaFecha!)}
            </p>
          </div>
          {(done.cobrado ?? 0) > 0 && (
            <p className="text-sm text-ink">
              Pago de renovación: <span className="font-semibold">{formatRD(done.cobrado ?? 0)}</span>
            </p>
          )}
          <p className="text-xs text-ink-faint">
            Documento de ejemplo generado para demostración.
            <br />
            NCF simulado para demostración. No certificado ante la DGII.
          </p>
          <Button magnetic={false} className="w-full" onClick={onClose}>
            Listo
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="rounded-lg bg-bg-2 p-3 text-sm">
            <p className="text-ink-muted">{miembro.nombre}</p>
            <p className="mt-0.5 text-ink-faint">
              Vence actual: {formatFechaCorta(miembro.fecha_vencimiento)}
            </p>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-muted">Plan a renovar</span>
            <select className={field} value={plan} onChange={(e) => setPlan(e.target.value)}>
              {PLANES.map((p) => (
                <option key={p.nombre} value={p.nombre}>
                  {p.nombre} · {p.meses} {p.meses === 1 ? "mes" : "meses"}
                </option>
              ))}
            </select>
          </label>

          {/* Preview */}
          <div className="rounded-lg border border-line p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">Nueva fecha de vencimiento</span>
              <span className="font-semibold text-ink">{formatFechaCorta(nuevaFecha)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-ink-muted">Cargo de la renovación</span>
              <span className="tabular-nums font-semibold text-accent">{formatRD(cobrado)}</span>
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-lg bg-bg-2 px-4 py-3">
            <input
              type="checkbox"
              checked={conPago}
              onChange={(e) => setConPago(e.target.checked)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            <span className="text-sm text-ink">Registrar el pago de la renovación</span>
          </label>

          {conPago && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-muted">Método de pago</span>
              <select className={field} value={metodo} onChange={(e) => setMetodo(e.target.value)}>
                {METODOS.map((m) => (
                  <option key={m} value={m}>
                    {cap(m)}
                  </option>
                ))}
              </select>
            </label>
          )}

          {error && (
            <p className="rounded-lg border border-accent bg-accent-soft px-3 py-2.5 text-sm text-ink">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="submit" loading={loading} magnetic={false} className="flex-1">
              Renovar
            </Button>
            <Button type="button" variant="secondary" magnetic={false} onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
