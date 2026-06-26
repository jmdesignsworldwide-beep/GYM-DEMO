"use client";

import { Wallet } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/motion/CountUp";

/** Tarjeta estrella: la caja del día (lo primero que pregunta un dueño). */
export function CajaDelDia({ total }: { total: number }) {
  return (
    <Card magnetic className="relative flex h-full min-h-[180px] flex-col justify-between overflow-hidden">
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
        <p className="mt-2 text-sm text-ink-faint">Lo que entró hoy</p>
      </div>
    </Card>
  );
}
