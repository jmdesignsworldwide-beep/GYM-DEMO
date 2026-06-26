import { AlertCircle } from "lucide-react";
import { ListCard } from "./ListCard";
import { MemberRow } from "./MemberRow";
import { formatRD } from "@/lib/format";
import type { Pendiente } from "@/lib/dashboard/data";

export function Pendientes({ pendientes }: { pendientes: Pendiente[] }) {
  return (
    <ListCard
      title="Pagos pendientes"
      icon={AlertCircle}
      count={pendientes.length}
      empty="Sin pagos pendientes ✓"
    >
      {pendientes.map((p) => (
        <MemberRow
          key={p.id}
          nombre={p.nombre}
          secondary={p.plan}
          right={<span className="tabular-nums text-sm font-semibold text-accent">{formatRD(p.monto)}</span>}
        />
      ))}
    </ListCard>
  );
}
