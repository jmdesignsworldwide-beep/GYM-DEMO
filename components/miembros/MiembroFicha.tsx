"use client";

import { Pencil, RefreshCw, CreditCard } from "lucide-react";
import { Avatar } from "./Avatar";
import { Button } from "@/components/ui/Button";
import { estadoInfo } from "@/lib/miembros/estado";
import { formatFechaCorta, formatRD } from "@/lib/format";
import type { Miembro } from "@/lib/miembros/data";

function Dato({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-2.5 last:border-0">
      <dt className="shrink-0 text-sm text-ink-muted">{label}</dt>
      <dd className="text-right text-sm font-medium text-ink">{value || "—"}</dd>
    </div>
  );
}

export function MiembroFicha({
  miembro: m,
  onEditar,
  onRenovar,
  onPago,
}: {
  miembro: Miembro;
  onEditar?: () => void;
  onRenovar?: () => void;
  onPago?: () => void;
}) {
  const est = estadoInfo(m.estado);
  const vencido = m.estado === "vencido";

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
        {m.estado === "congelado" && m.fecha_reanudacion && (
          <p className="mt-3 text-xs text-sky-600 dark:text-sky-400">
            Reanuda el {formatFechaCorta(m.fecha_reanudacion)}
          </p>
        )}
        {vencido && (
          <p className="mt-3 text-sm font-semibold text-red-600 dark:text-red-400">
            Deuda: {formatRD(m.precio_mensual)}
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
        <Button variant="secondary" size="md" magnetic={false} onClick={onPago}>
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
    </div>
  );
}
