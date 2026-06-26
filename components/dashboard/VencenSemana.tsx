"use client";

import { CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/motion/CountUp";

/** Vencen esta semana — la joya que evita perder miembros. */
export function VencenSemana({ count }: { count: number }) {
  return (
    <Card magnetic className="flex h-full flex-col justify-between">
      <div className="flex items-center gap-2 text-ink-muted">
        <CalendarClock size={18} className="text-accent" />
        <span className="text-sm">Vencen esta semana</span>
      </div>
      <div className="mt-6">
        <p className="font-display text-5xl font-bold text-ink">
          <CountUp value={count} />
        </p>
        <p className="mt-1 text-sm text-ink-faint">Miembros por renovar en 7 días</p>
      </div>
    </Card>
  );
}
