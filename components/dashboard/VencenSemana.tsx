"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Sheet";
import { CountUp } from "@/components/motion/CountUp";
import { MemberRow } from "./MemberRow";
import { useFicha } from "./ficha";
import { formatFechaCorta } from "@/lib/format";
import type { MiembroLite } from "@/lib/dashboard/data";

/** Vencen esta semana — clic → lista de esos miembros (cada uno → ficha). */
export function VencenSemana({ miembros }: { miembros: MiembroLite[] }) {
  const [open, setOpen] = useState(false);
  const ficha = useFicha();

  return (
    <>
      <Card
        magnetic
        onClick={() => setOpen(true)}
        ariaLabel="Ver miembros que vencen esta semana"
        className="flex h-full flex-col justify-between"
      >
        <div className="flex items-center gap-2 text-ink-muted">
          <CalendarClock size={18} className="text-accent" />
          <span className="text-sm">Vencen esta semana</span>
        </div>
        <div className="mt-6">
          <p className="font-display text-5xl font-bold text-ink">
            <CountUp value={miembros.length} />
          </p>
          <p className="mt-1 text-sm text-ink-faint">Miembros por renovar en 7 días</p>
        </div>
      </Card>

      <Sheet open={open} onClose={() => setOpen(false)} title="Vencen esta semana">
        <div className="space-y-1">
          {miembros.map((m) => (
            <MemberRow
              key={m.id}
              nombre={m.nombre}
              secondary={`${m.plan} · vence ${formatFechaCorta(m.fecha_vencimiento)}`}
              onClick={() => ficha.open(m)}
            />
          ))}
        </div>
      </Sheet>
    </>
  );
}
