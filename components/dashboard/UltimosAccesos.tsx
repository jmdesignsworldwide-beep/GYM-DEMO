"use client";

import { DoorOpen } from "lucide-react";
import { ListCard } from "./ListCard";
import { MemberRow } from "./MemberRow";
import { useFicha } from "./ficha";
import type { AccesoReciente } from "@/lib/dashboard/data";

export function UltimosAccesos({ accesos }: { accesos: AccesoReciente[] }) {
  const ficha = useFicha();
  return (
    <ListCard
      title="Últimos accesos"
      icon={DoorOpen}
      items={accesos}
      getKey={(_, i) => i}
      renderRow={(a) => (
        <MemberRow
          nombre={a.nombre}
          secondary="Entró al gym"
          right={<span className="tabular-nums text-xs text-ink-muted">{a.hora}</span>}
          onClick={() => ficha.open(a)}
        />
      )}
    />
  );
}
