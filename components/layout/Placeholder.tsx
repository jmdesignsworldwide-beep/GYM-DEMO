import { Skeleton } from "@/components/motion/Skeleton";

/**
 * Placeholder de módulo — encabezado + esqueleto, para recorrer el layout
 * mientras los módulos reales llegan en tandas siguientes.
 */
export function Placeholder({
  title,
  description = "Este módulo se construye en una tanda siguiente.",
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="font-display text-display font-bold text-ink">{title}</h1>
        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
          Próximamente
        </span>
      </div>
      <p className="mt-2 text-ink-muted">{description}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass shadow-card space-y-3 rounded-lg p-5">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
