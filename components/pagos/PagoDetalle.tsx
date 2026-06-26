"use client";

import { Modal } from "@/components/ui/Modal";
import { formatRD, formatFechaHora } from "@/lib/format";
import type { PagoItem } from "@/lib/pagos/data";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Linea({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-line py-2.5 text-sm last:border-0">
      <span className="text-ink-muted">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

export function PagoDetalle({ pago, onClose }: { pago: PagoItem | null; onClose: () => void }) {
  return (
    <Modal open={!!pago} onClose={onClose} title="Recibo de pago">
      {pago && (
        <div>
          <div className="mb-4 text-center">
            <p className="font-display text-3xl font-bold text-gradient">{formatRD(pago.monto)}</p>
            <p className="mt-1 text-sm text-ink-muted">{pago.miembro}</p>
          </div>
          <dl className="rounded-lg border border-line px-4">
            <Linea label="Categoría" value={cap(pago.categoria)} />
            <Linea label="Método" value={cap(pago.metodo)} />
            <Linea label="Fecha" value={formatFechaHora(pago.fecha)} />
          </dl>
          <p className="mt-4 text-center text-xs text-ink-faint">
            Documento de ejemplo generado para demostración.
            <br />
            NCF simulado para demostración. No certificado ante la DGII.
          </p>
        </div>
      )}
    </Modal>
  );
}
