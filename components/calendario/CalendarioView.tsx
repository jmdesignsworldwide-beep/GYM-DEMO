"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Sheet";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { MiembroRow } from "@/components/miembros/MiembroRow";
import { MiembroFicha } from "@/components/miembros/MiembroFicha";
import { hoyISO } from "@/lib/miembros/estado";
import { formatFechaCorta } from "@/lib/format";
import type { Miembro } from "@/lib/miembros/data";

type Periodo = "hoy" | "semana" | "mes";

const MESES_LARGO = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const DIAS = ["D", "L", "M", "M", "J", "V", "S"];

function addDays(ymd: string, n: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function CalendarioView({ miembros }: { miembros: Miembro[] }) {
  const hoy = hoyISO();
  const [periodo, setPeriodo] = useState<Periodo>("semana");
  const [diaSel, setDiaSel] = useState<string | null>(null);
  const [seleccionado, setSeleccionado] = useState<Miembro | null>(null);

  const semanaFin = addDays(hoy, 6);
  const mesActual = hoy.slice(0, 7);

  // Solo miembros con estado por fecha (no congelados/cancelados).
  const porFecha = useMemo(
    () => miembros.filter((m) => m.estado !== "congelado" && m.estado !== "cancelado"),
    [miembros],
  );

  const lista = useMemo(() => {
    let arr = porFecha;
    if (diaSel) arr = arr.filter((m) => m.fecha_vencimiento === diaSel);
    else if (periodo === "hoy") arr = arr.filter((m) => m.fecha_vencimiento === hoy);
    else if (periodo === "semana")
      arr = arr.filter((m) => m.fecha_vencimiento >= hoy && m.fecha_vencimiento <= semanaFin);
    else arr = arr.filter((m) => m.fecha_vencimiento.slice(0, 7) === mesActual);
    return [...arr].sort((a, b) => a.fecha_vencimiento.localeCompare(b.fecha_vencimiento));
  }, [porFecha, periodo, diaSel, hoy, semanaFin, mesActual]);

  // Conteo por día del mes actual (para la grilla).
  const conteoPorDia = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of porFecha) {
      if (m.fecha_vencimiento.slice(0, 7) === mesActual)
        map.set(m.fecha_vencimiento, (map.get(m.fecha_vencimiento) ?? 0) + 1);
    }
    return map;
  }, [porFecha, mesActual]);

  const year = Number(mesActual.slice(0, 4));
  const month = Number(mesActual.slice(5, 7)) - 1;
  const primerDia = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const diasEnMes = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const chips: { k: Periodo; t: string }[] = [
    { k: "hoy", t: "Hoy" },
    { k: "semana", t: "Esta semana" },
    { k: "mes", t: "Este mes" },
  ];

  const vacio: Record<Periodo, string> = {
    hoy: "Nadie vence hoy 🎉",
    semana: "Nadie vence esta semana 🎉",
    mes: "Nadie vence este mes 🎉",
  };

  return (
    <div>
      <h1 className="mb-5 font-display text-title font-semibold text-ink">Calendario de vencimientos</h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c.k}
            type="button"
            onClick={() => {
              setPeriodo(c.k);
              setDiaSel(null);
            }}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              periodo === c.k && !diaSel
                ? "bg-accent text-accent-contrast"
                : "glass text-ink-muted hover:text-ink"
            }`}
          >
            {c.t}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Grilla del mes */}
        <Card glowOnHover={false}>
          <p className="mb-3 font-display text-sm font-semibold capitalize text-ink">
            {MESES_LARGO[month]} {year}
          </p>
          <div className="grid grid-cols-7 gap-1 text-center">
            {DIAS.map((d, i) => (
              <div key={i} className="py-1 text-xs text-ink-faint">
                {d}
              </div>
            ))}
            {Array.from({ length: primerDia }).map((_, i) => (
              <div key={`e${i}`} />
            ))}
            {Array.from({ length: diasEnMes }).map((_, i) => {
              const dia = String(i + 1).padStart(2, "0");
              const ymd = `${mesActual}-${dia}`;
              const n = conteoPorDia.get(ymd) ?? 0;
              const esHoy = ymd === hoy;
              const activo = diaSel === ymd;
              return (
                <button
                  key={ymd}
                  type="button"
                  disabled={n === 0}
                  onClick={() => setDiaSel(activo ? null : ymd)}
                  className={`relative aspect-square rounded-lg text-sm transition-colors ${
                    activo
                      ? "bg-accent text-accent-contrast"
                      : n > 0
                        ? "bg-accent-soft text-ink hover:bg-accent/20"
                        : "text-ink-faint"
                  } ${esHoy && !activo ? "ring-1 ring-accent" : ""}`}
                >
                  {i + 1}
                  {n > 0 && !activo && (
                    <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent" />
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-ink-faint">Toca un día marcado para ver quién vence.</p>
        </Card>

        {/* Lista */}
        <Card glowOnHover={false}>
          <p className="mb-3 text-sm text-ink-muted">
            {diaSel
              ? `Vencen el ${formatFechaCorta(diaSel)}`
              : `${lista.length} ${lista.length === 1 ? "miembro" : "miembros"}`}
          </p>
          {lista.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-faint">
              {diaSel ? "Nadie vence ese día." : vacio[periodo]}
            </p>
          ) : (
            <StaggerGroup className="space-y-1">
              {lista.map((m) => (
                <StaggerItem key={m.id}>
                  <MiembroRow miembro={m} onClick={() => setSeleccionado(m)} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </Card>
      </div>

      <Sheet open={!!seleccionado} onClose={() => setSeleccionado(null)} title="Ficha del miembro">
        {seleccionado && <MiembroFicha miembro={seleccionado} />}
      </Sheet>
    </div>
  );
}
