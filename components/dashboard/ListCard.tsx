import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

/**
 * Tarjeta de lista del dashboard: título + contador + cuerpo con scroll
 * interno (clave para móvil — no se desborda ni atrapa).
 */
export function ListCard({
  title,
  icon: Icon,
  count,
  children,
  empty,
}: {
  title: string;
  icon?: LucideIcon;
  count?: number;
  children: React.ReactNode;
  empty?: string;
}) {
  const isEmpty = count === 0;
  return (
    <Card glowOnHover={false} className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-accent" />}
          <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
        </div>
        {typeof count === "number" && (
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
            {count}
          </span>
        )}
      </div>
      {isEmpty && empty ? (
        <p className="flex-1 py-6 text-center text-sm text-ink-faint">{empty}</p>
      ) : (
        <div className="-mr-1 max-h-72 flex-1 space-y-1 overflow-y-auto pr-1">{children}</div>
      )}
    </Card>
  );
}
