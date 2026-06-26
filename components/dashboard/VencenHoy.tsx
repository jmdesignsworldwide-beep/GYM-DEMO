import { CalendarX } from "lucide-react";
import { ListCard } from "./ListCard";
import { MemberRow } from "./MemberRow";
import type { MiembroLite } from "@/lib/dashboard/data";

export function VencenHoy({ miembros }: { miembros: MiembroLite[] }) {
  return (
    <ListCard
      title="Vencen hoy"
      icon={CalendarX}
      count={miembros.length}
      empty="Nadie vence hoy 🎉"
    >
      {miembros.map((m) => (
        <MemberRow
          key={m.id}
          nombre={m.nombre}
          secondary={`${m.plan} · ${m.telefono}`}
          right={<span className="text-xs font-medium text-accent">hoy</span>}
        />
      ))}
    </ListCard>
  );
}
