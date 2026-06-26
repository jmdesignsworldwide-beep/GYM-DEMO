"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Sheet";
import { CountUp } from "@/components/motion/CountUp";
import { Pulse } from "@/components/motion/Pulse";
import { MemberRow } from "./MemberRow";
import { useFicha } from "./ficha";
import type { MiembroLite } from "@/lib/dashboard/data";

/** El pulso vivo: gente en el gym ahora. Clic → lista de quién está dentro. */
export function EnGymAhora({ count, lista }: { count: number; lista: MiembroLite[] }) {
  const [open, setOpen] = useState(false);
  const ficha = useFicha();

  return (
    <>
      <Card
        glowOnHover={false}
        onClick={() => setOpen(true)}
        ariaLabel="Ver quién está en el gym"
        className="flex h-full flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-muted">Gente en el gym ahora</span>
          <Pulse />
        </div>
        <div className="mt-6">
          <p className="font-display text-5xl font-bold text-ink">
            <CountUp value={count} />
          </p>
          <p className="mt-1 text-sm text-ink-faint">Toca para ver quién está dentro</p>
        </div>
      </Card>

      <Sheet open={open} onClose={() => setOpen(false)} title="En el gym ahora">
        <div className="space-y-1">
          {lista.map((m) => (
            <MemberRow
              key={m.id}
              nombre={m.nombre}
              secondary={m.plan}
              onClick={() => ficha.open(m)}
            />
          ))}
        </div>
      </Sheet>
    </>
  );
}
