"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { formatRD, formatFechaCorta, inicial } from "@/lib/format";
import type { MiembroLite } from "@/lib/dashboard/data";

type FichaCtx = { open: (m: MiembroLite) => void };
const Ctx = createContext<FichaCtx | null>(null);

export function useFicha() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFicha debe usarse dentro de <FichaProvider>");
  return ctx;
}

/** Provee la ficha resumida del miembro a cualquier fila clicable. */
export function FichaProvider({ children }: { children: React.ReactNode }) {
  const [miembro, setMiembro] = useState<MiembroLite | null>(null);
  const open = useCallback((m: MiembroLite) => setMiembro(m), []);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <Modal open={!!miembro} onClose={() => setMiembro(null)} title="Ficha del miembro">
        {miembro && <FichaContent m={miembro} />}
      </Modal>
    </Ctx.Provider>
  );
}

function Dato({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-2.5 last:border-0">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

function FichaContent({ m }: { m: MiembroLite }) {
  const vencido = m.estado === "vencido";
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-accent-soft text-xl font-bold text-accent">
          {inicial(m.nombre)}
        </span>
        <div>
          <p className="font-display text-lg font-semibold text-ink">{m.nombre}</p>
          <span
            className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
              vencido ? "bg-accent-soft text-accent" : "bg-bg-3 text-ink-muted"
            }`}
          >
            {vencido ? "Vencido" : "Activo"}
          </span>
        </div>
      </div>

      <dl className="mt-5">
        <Dato label="Plan" value={m.plan} />
        <Dato label="Teléfono" value={m.telefono} />
        <Dato label="Vence" value={formatFechaCorta(m.fecha_vencimiento)} />
        <Dato label="Mensualidad" value={formatRD(m.precio_mensual)} />
      </dl>

      <p className="mt-5 text-xs text-ink-faint">
        Ficha completa próximamente con el módulo de Miembros.
      </p>
    </div>
  );
}
