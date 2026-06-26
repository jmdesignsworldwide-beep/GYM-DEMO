"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { METODOS, CATEGORIAS } from "@/lib/miembros/planes";
import { registrarPago, type PagoResult } from "@/app/(app)/miembros/actions";
import { formatRD } from "@/lib/format";
import type { Miembro } from "@/lib/miembros/data";

const field =
  "h-12 w-full rounded-lg border bg-bg-2 px-4 text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none";
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function PagoModal({
  miembro,
  deuda,
  open,
  onClose,
  onDone,
}: {
  miembro: Miembro;
  deuda: number;
  open: boolean;
  onClose: () => void;
  onDone: (r: PagoResult) => void;
}) {
  const hoy = new Date().toISOString().slice(0, 10);
  const [monto, setMonto] = useState(0);
  const [metodo, setMetodo] = useState("efectivo");
  const [categoria, setCategoria] = useState("mensualidad");
  const [fecha, setFecha] = useState(hoy);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<PagoResult | null>(null);

  // Reinicia el formulario cada vez que se abre.
  useEffect(() => {
    if (open) {
      setMonto(deuda > 0 ? deuda : miembro.precio_mensual);
      setMetodo("efectivo");
      setCategoria("mensualidad");
      setFecha(hoy);
      setError(null);
      setDone(null);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    const res = await registrarPago({
      miembroId: miembro.id,
      monto: Number(monto),
      metodo,
      categoria,
      fecha,
    });
    setLoading(false);
    if (res.ok) {
      setDone(res);
      onDone(res);
    } else {
      setError(res.error ?? "No se pudo registrar el pago.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={done ? "Pago registrado" : "Registrar pago"}>
      {done ? (
        <div className="space-y-4 text-center">
          <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
          <div>
            <p className="font-display text-2xl font-bold text-ink">{formatRD(Number(monto))}</p>
            <p className="mt-1 text-sm text-ink-muted">
              {cap(categoria)} · {cap(metodo)}
            </p>
          </div>
          {(done.abonado ?? 0) > 0 && (
            <div className="rounded-lg bg-bg-2 p-3 text-sm">
              <p className="text-ink">
                Abonado a deuda: <span className="font-semibold">{formatRD(done.abonado ?? 0)}</span>
              </p>
              <p className="text-ink">
                Deuda restante:{" "}
                <span className={(done.deudaRestante ?? 0) > 0 ? "font-semibold text-red-500" : "font-semibold text-emerald-500"}>
                  {formatRD(done.deudaRestante ?? 0)}
                </span>
              </p>
            </div>
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
            {deuda > 0 ? (
              <p className="mt-0.5 font-medium text-red-500">Deuda actual: {formatRD(deuda)}</p>
            ) : (
              <p className="mt-0.5 text-ink-faint">Sin deuda pendiente</p>
            )}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-muted">Monto (RD$)</span>
            <input
              className={field}
              type="number"
              min={0}
              value={monto}
              onChange={(e) => setMonto(Number(e.target.value))}
            />
            {deuda > 0 && Number(monto) < deuda && (
              <span className="mt-1 block text-xs text-ink-faint">
                Abono parcial · quedaría {formatRD(deuda - Number(monto))}
              </span>
            )}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-muted">Método</span>
              <select className={field} value={metodo} onChange={(e) => setMetodo(e.target.value)}>
                {METODOS.map((m) => (
                  <option key={m} value={m}>
                    {cap(m)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-muted">Categoría</span>
              <select
                className={field}
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {cap(c)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {metodo === "transferencia" && (
            <p className="rounded-lg bg-bg-2 px-3 py-2 text-xs text-ink-muted">
              Verificación de transferencia simulada para demostración. No se valida contra el banco.
            </p>
          )}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-muted">Fecha</span>
            <input className={field} type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </label>

          {error && (
            <p className="rounded-lg border border-accent bg-accent-soft px-3 py-2.5 text-sm text-ink">
              {error}
            </p>
          )}

          <p className="text-xs text-ink-faint">
            El pago se reflejará al instante en la caja del día, los ingresos del mes y el historial.
          </p>

          <div className="flex gap-3 pt-1">
            <Button type="submit" loading={loading} magnetic={false} className="flex-1">
              Registrar pago
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
