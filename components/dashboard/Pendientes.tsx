"use client";

import { AlertCircle } from "lucide-react";
import { ListCard } from "./ListCard";
import { MemberRow } from "./MemberRow";
import { useFicha } from "./ficha";
import { formatRD } from "@/lib/format";
import type { MiembroLite } from "@/lib/dashboard/data";

export function Pendientes({ miembros }: { miembros: MiembroLite[] }) {
  const ficha = useFicha();
  return (
    <ListCard
      title="Pagos pendientes"
      icon={AlertCircle}
      items={miembros}
      getKey={(m) => m.id}
      empty="Sin pagos pendientes ✓"
      renderRow={(m) => (
        <MemberRow
          nombre={m.nombre}
          secondary={m.plan}
          right={
            <span className="tabular-nums text-sm font-semibold text-accent">
              {formatRD(m.precio_mensual)}
            </span>
          }
          onClick={() => ficha.open(m)}
        />
      )}
    />
  );
}
