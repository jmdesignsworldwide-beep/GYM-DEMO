"use client";

import { useState } from "react";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Sheet";

/**
 * Tarjeta de lista del dashboard. Muestra máximo `max` filas SIN scroll
 * interno; si hay más, un enlace "Ver los N →" abre el panel con la lista
 * completa (el scroll vive en el panel amplio, nunca en la tarjeta).
 */
export function ListCard<T>({
  title,
  icon: Icon,
  items,
  renderRow,
  getKey,
  empty,
  max = 5,
}: {
  title: string;
  icon?: LucideIcon;
  items: T[];
  renderRow: (item: T) => React.ReactNode;
  getKey: (item: T, i: number) => string | number;
  empty?: string;
  max?: number;
}) {
  const [open, setOpen] = useState(false);
  const shown = items.slice(0, max);
  const hasMore = items.length > max;

  return (
    <>
      <Card glowOnHover={false} className="flex h-full flex-col">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon size={16} className="text-accent" />}
            <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
          </div>
          {items.length > 0 && (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
              {items.length}
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <p className="flex-1 py-6 text-center text-sm text-ink-faint">{empty}</p>
        ) : (
          <div className="space-y-1">
            {shown.map((it, i) => (
              <div key={getKey(it, i)}>{renderRow(it)}</div>
            ))}
          </div>
        )}

        {hasMore && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-3 inline-flex items-center gap-1 self-start text-sm font-medium text-accent transition-colors hover:text-accent-hover"
          >
            Ver los {items.length}
            <ArrowRight size={14} />
          </button>
        )}
      </Card>

      <Sheet open={open} onClose={() => setOpen(false)} title={title}>
        <div className="space-y-1">
          {items.map((it, i) => (
            <div key={getKey(it, i)}>{renderRow(it)}</div>
          ))}
        </div>
      </Sheet>
    </>
  );
}
