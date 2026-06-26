"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { CountUp } from "@/components/motion/CountUp";

/** KPI compacto con count-up. Si trae `detail`, es clicable y abre un modal. */
export function StatCard({
  label,
  value,
  prefix = "",
  icon: Icon,
  hint,
  detailTitle,
  detail,
}: {
  label: string;
  value: number;
  prefix?: string;
  icon?: LucideIcon;
  hint?: string;
  detailTitle?: string;
  detail?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const clickable = !!detail;

  return (
    <>
      <Card
        magnetic
        onClick={clickable ? () => setOpen(true) : undefined}
        ariaLabel={clickable ? `Ver detalle de ${label}` : undefined}
        className="flex h-full flex-col justify-between"
      >
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

      {clickable && (
        <Modal open={open} onClose={() => setOpen(false)} title={detailTitle ?? label}>
          {detail}
        </Modal>
      )}
    </>
  );
}
