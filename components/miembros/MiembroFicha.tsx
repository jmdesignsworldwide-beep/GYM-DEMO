"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, RefreshCw, CreditCard } from "lucide-react";
import { Avatar } from "./Avatar";
import { PagoModal } from "./PagoModal";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { Skeleton } from "@/components/motion/Skeleton";
import { estadoInfo, estadoEfectivo } from "@/lib/miembros/estado";
import { formatFechaCorta, formatFechaHora, formatRD } from "@/lib/format";
import { getHistorial, type PagoHist, type AccesoHist } from "@/lib/miembros/historial";
import type { Miembro } from "@/lib/miembros/data";

function Dato({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-2.5 last:border-0">
      <dt className="shrink-0 text-sm text-ink-muted">{label}</dt>
      <dd className="text-right text-sm font-medium text-ink">{value || "—"}</dd>
    </div>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function MiembroFicha({
  miembro: m,
  onEditar,
  onRenovar,
}: {
  miembro: Miembro;
  onEditar?: () => void;
  onRenovar?: () => void;
}) {
  const router = useRouter();
  const eff = estadoEfectivo(m.estado, m.fecha_vencimiento);
  const est = estadoInfo(eff);

  const [cargando, setCargando] = useState(true);
  const [pagos, setPagos] = useState<PagoHist[]>([]);
  const [accesos, setAccesos] = useState<AccesoHist[]>([]);
  const [deuda, setDeuda] = useState(m.deuda);
  const [reloadKey, setReloadKey] = useState(0);
  const [pagoOpen, setPagoOpen] = useState(false);

  useEffect(() => {
    setDeuda(m.deuda);
  }, [m.id, m.deuda]);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    getHistorial(m.id)
      .then((h) => {
        if (!activo) return;
        setPagos(h.pagos);
        setAccesos(h.accesos);
      })
      .finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
  }, [m.id, reloadKey]);

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center gap-4">
        <Avatar nombre={m.nombre} foto={m.foto_url} size={64} />
        <div className="min-w-0">
          <p className="truncate font-display text-xl font-bold text-ink">{m.nombre}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${est.badge}`}>
              {est.label}
            </span>
            {m.codigo && <span className="text-xs text-ink-faint">{m.codigo}</span>}
          </div>
        </div>
      </div>

      {/* Plan + vencimiento */}
      <div className="rounded-lg border border-line bg-bg-2 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-faint">Plan actual</p>
            <p className="font-medium text-ink">{m.plan}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-faint">Vence</p>
            <p className="font-medium text-ink">{formatFechaCorta(m.fecha_vencimiento)}</p>
          </div>
        </div>
        {eff === "congelado" && m.fecha_reanudacion && (
          <p className="mt-3 text-xs text-sky-600 dark:text-sky-400">
            Reanuda el {formatFechaCorta(m.fecha_reanudacion)}
          </p>
        )}
        {deuda > 0 && (
          <p className="mt-3 text-sm font-semibold text-red-600 dark:text-red-400">
            Deuda: {formatRD(deuda)}
          </p>
        )}
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap gap-2">
        <Button size="md" magnetic={false} onClick={onEditar}>
          <Pencil size={16} /> Editar
        </Button>
        <Button variant="secondary" size="md" magnetic={false} onClick={onRenovar}>
          <RefreshCw size={16} /> Renovar
        </Button>
        <Button variant="secondary" size="md" magnetic={false} onClick={() => setPagoOpen(true)}>
          <CreditCard size={16} /> Registrar pago
        </Button>
      </div>

      {/* Datos */}
      <div>
        <h3 className="mb-1 text-sm font-semibold text-ink-muted">Datos</h3>
        <dl>
          <Dato label="Cédula" value={m.cedula} />
          <Dato label="Teléfono" value={m.telefono} />
          <Dato label="Email" value={m.email} />
          <Dato label="Dirección" value={m.direccion} />
          <Dato label="Inscripción" value={formatFechaCorta(m.fecha_inicio)} />
          <Dato label="Mensualidad" value={formatRD(m.precio_mensual)} />
        </dl>
      </div>

      {/* Historial de pagos (del miembro) — acordeón */}
      <Accordion
        title="Historial de pagos"
        summary={cargando ? "cargando…" : `${pagos.length} ${pagos.length === 1 ? "pago" : "pagos"}`}
      >
        {cargando ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : pagos.length === 0 ? (
          <p className="py-3 text-sm text-ink-faint">Sin pagos registrados.</p>
        ) : (
          <ul className="space-y-1">
            {pagos.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-bg-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{cap(p.categoria)}</p>
                  <p className="truncate text-xs text-ink-faint">
                    {cap(p.metodo)} · {formatFechaHora(p.fecha)}
                  </p>
                </div>
                <span className="shrink-0 tabular-nums text-sm font-semibold text-ink">
                  {formatRD(p.monto)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Accordion>

      {/* Historial de accesos (del miembro) — acordeón */}
      <Accordion
        title="Historial de accesos"
        summary={
          cargando ? "cargando…" : `${accesos.length} ${accesos.length === 1 ? "visita" : "visitas"}`
        }
      >
        {cargando ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : accesos.length === 0 ? (
          <p className="py-3 text-sm text-ink-faint">Sin accesos registrados.</p>
        ) : (
          <ul className="space-y-1">
            {accesos.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-bg-2"
              >
                <span className="text-sm text-ink">{formatFechaHora(a.entrada)}</span>
                <span className="shrink-0 text-xs text-ink-faint">
                  {a.salida ? "Salió" : "Activo"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Accordion>

      {/* Contacto de emergencia */}
      <div>
        <h3 className="mb-1 text-sm font-semibold text-ink-muted">Contacto de emergencia</h3>
        <dl>
          <Dato label="Nombre" value={m.contacto_emergencia_nombre} />
          <Dato label="Teléfono" value={m.contacto_emergencia_telefono} />
        </dl>
      </div>

      {/* Notas */}
      <div>
        <h3 className="mb-1 text-sm font-semibold text-ink-muted">Notas internas</h3>
        <p className="text-sm text-ink">{m.notas || "Sin notas."}</p>
      </div>

      <PagoModal
        miembro={m}
        deuda={deuda}
        open={pagoOpen}
        onClose={() => setPagoOpen(false)}
        onDone={(r) => {
          setDeuda(r.deudaRestante ?? deuda);
          setReloadKey((k) => k + 1);
          router.refresh();
        }}
      />
    </div>
  );
}
