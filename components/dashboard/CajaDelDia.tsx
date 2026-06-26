"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { CountUp } from "@/components/motion/CountUp";
import { Breakdown } from "./Breakdown";

type Grupo = { label: string; value: number };

/** Tarjeta estrella: la caja del día. Clic → desglose por método y categoría. */
export function CajaDelDia({
  total,
  porMetodo,
  porCategoria,
}: {
  total: number;
  porMetodo: { metodo: string; total: number }[];
  porCategoria: { categoria: string; total: number }[];
}) {
  const [open, setOpen] = useState(false);
  const metodos: Grupo[] = porMetodo.map((m) => ({ label: m.metodo, value: m.total }));
  const categorias: Grupo[] = porCategoria.map((c) => ({ label: c.categoria, value: c.total }));

  return (
    <>
      <Card
        magnetic
        onClick={() => setOpen(true)}
        ariaLabel="Ver desglose de la caja del día"
        className="relative flex h-full min-h-[180px] flex-col justify-between overflow-hidden"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full"
          style={{ background: "radial-gradient(circle, var(--accent-soft), transparent 70%)" }}
        />
        <div className="flex items-center gap-2 text-ink-muted">
          <Wallet size={18} className="text-accent" />
          <span className="text-sm">Caja del día</span>
        </div>
        <div className="relative mt-6">
          <p className="text-gradient font-display text-display-lg font-bold leading-none">
            <CountUp value={total} prefix="RD$ " />
          </p>
          <p className="mt-2 text-sm text-ink-faint">Lo que entró hoy · toca para el desglose</p>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Caja del día">
        <p className="mb-4 font-display text-2xl font-bold text-gradient">
          {new Intl.NumberFormat("es-DO").format(total)} <span className="text-base">RD$</span>
        </p>
        <h3 className="mb-2 text-sm font-semibold text-ink-muted">Por método de pago</h3>
        <Breakdown items={metodos} />
        <h3 className="mb-2 mt-6 text-sm font-semibold text-ink-muted">Por categoría</h3>
        <Breakdown items={categorias} />
      </Modal>
    </>
  );
}
