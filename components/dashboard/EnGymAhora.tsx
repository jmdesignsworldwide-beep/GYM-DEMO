"use client";

import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/motion/CountUp";
import { Pulse } from "@/components/motion/Pulse";

/** El pulso vivo: gente en el gym en este momento. */
export function EnGymAhora({ count }: { count: number }) {
  return (
    <Card glowOnHover={false} className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-muted">Gente en el gym ahora</span>
        <Pulse />
      </div>
      <div className="mt-6">
        <p className="font-display text-5xl font-bold text-ink">
          <CountUp value={count} />
        </p>
        <p className="mt-1 text-sm text-ink-faint">Entradas activas en este momento</p>
      </div>
    </Card>
  );
}
