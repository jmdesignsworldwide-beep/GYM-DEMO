import { formatRD } from "@/lib/format";

/** Lista de desglose con barra de proporción (para detalles de KPIs). */
export function Breakdown({
  items,
  money = true,
}: {
  items: { label: string; value: number }[];
  money?: boolean;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div key={it.label}>
          <div className="flex items-center justify-between text-sm">
            <span className="capitalize text-ink">{it.label}</span>
            <span className="tabular-nums font-medium text-ink">
              {money ? formatRD(it.value) : it.value}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-bg-3">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(it.value / max) * 100}%`,
                background: "linear-gradient(90deg, var(--accent), var(--accent-hover))",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
