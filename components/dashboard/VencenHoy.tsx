"use client";

import { CalendarX } from "lucide-react";
import { ListCard } from "./ListCard";
import { MemberRow } from "./MemberRow";
import { useFicha } from "./ficha";
import type { MiembroLite } from "@/lib/dashboard/data";

export function VencenHoy({ miembros }: { miembros: MiembroLite[] }) {
  const ficha = useFicha();
  return (
    <ListCard
      title="Vencen hoy"
      icon={CalendarX}
      items={miembros}
      getKey={(m) => m.id}
      empty="Nadie vence hoy 🎉"
      renderRow={(m) => (
        <MemberRow
          nombre={m.nombre}
          secondary={`${m.plan} · ${m.telefono}`}
          right={<span className="text-xs font-medium text-accent">hoy</span>}
          onClick={() => ficha.open(m)}
        />
      )}
    />
  );
}
