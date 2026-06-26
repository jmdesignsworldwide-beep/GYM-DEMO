import { inicial } from "@/lib/format";

/** Fila de miembro reutilizable en las listas del dashboard. */
export function MemberRow({
  nombre,
  secondary,
  right,
}: {
  nombre: string;
  secondary?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-bg-2">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
        {inicial(nombre)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{nombre}</p>
        {secondary && <p className="truncate text-xs text-ink-faint">{secondary}</p>}
      </div>
      {right && <div className="shrink-0 text-right">{right}</div>}
    </div>
  );
}
