import { DoorOpen } from "lucide-react";
import { ListCard } from "./ListCard";
import { MemberRow } from "./MemberRow";
import type { AccesoLite } from "@/lib/dashboard/data";

export function UltimosAccesos({ accesos }: { accesos: AccesoLite[] }) {
  return (
    <ListCard title="Últimos accesos" icon={DoorOpen} count={accesos.length}>
      {accesos.map((a, i) => (
        <MemberRow
          key={i}
          nombre={a.nombre}
          secondary="Entró al gym"
          right={<span className="tabular-nums text-xs text-ink-muted">{a.hora}</span>}
        />
      ))}
    </ListCard>
  );
}
