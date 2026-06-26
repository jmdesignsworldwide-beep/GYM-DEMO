"use client";

import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/motion/CountUp";

/** KPI compacto con count-up (Ingresos del mes, Miembros activos…). */
export function StatCard({
  label,
  value,
  prefix = "",
  icon: Icon,
  hint,
}: {
  label: string;
  value: number;
  prefix?: string;
  icon?: LucideIcon;
  hint?: string;
}) {
  return (
    <Card magnetic className="flex h-full flex-col justify-between">
      <div className="flex items-center gap-2 text-ink-muted">
        {Icon && <Icon size={16} className="text-accent" />}
        <span className="text-sm">{label}</span>
      </div>
      <div className="mt-6">
        <p className="font-display text-3xl font-bold text-ink">
          <CountUp value={value} prefix={prefix} />
        </p>
        {hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
      </div>
    </Card>
  );
}
