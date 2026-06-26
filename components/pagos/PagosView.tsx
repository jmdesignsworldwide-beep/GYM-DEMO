"use client";

import { useMemo, useState } from "react";
import { Search, Wallet, TrendingUp, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { CountUp } from "@/components/motion/CountUp";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { ListCard } from "@/components/dashboard/ListCard";
import { MemberRow } from "@/components/dashboard/MemberRow";
import { PagoDetalle } from "./PagoDetalle";
import { METODOS, CATEGORIAS } from "@/lib/miembros/planes";
import { normaliza } from "@/lib/miembros/estado";
import { formatRD, formatFechaHora } from "@/lib/format";
import type { PagosData, PagoItem } from "@/lib/pagos/data";

const field =
  "h-11 rounded-lg border bg-bg-2 px-3 text-sm text-ink focus:border-accent focus:outline-none";
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function addDays(ymd: string, n: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

type Periodo = "todos" | "hoy" | "semana" | "mes";

export function PagosView({ data }: { data: PagosData }) {
  const [q, setQ] = useState("");
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [metodo, setMetodo] = useState("todos");
  const [categoria, setCategoria] = useState("todos");
  const [visible, setVisible] = useState(25);
  const [detalle, setDetalle] = useState<PagoItem | null>(null);

  const semanaIni = addDays(data.refDate, -6);

  const filtrados = useMemo(() => {
    const term = normaliza(q.trim());
    return data.pagos.filter((p) => {
      if (metodo !== "todos" && p.metodo !== metodo) return false;
      if (categoria !== "todos" && p.categoria !== categoria) return false;
      if (periodo === "hoy" && p.fecha.slice(0, 10) !== data.refDate) return false;
      if (periodo === "semana" && p.fecha.slice(0, 10) < semanaIni) return false;
      if (periodo === "mes" && p.fecha.slice(0, 7) !== data.refMonth) return false;
      if (term && !normaliza(p.miembro).includes(term)) return false;
      return true;
    });
  }, [data, q, periodo, metodo, categoria, semanaIni]);

  const mostrados = filtrados.slice(0, visible);

  const periodos: { k: Periodo; t: string }[] = [
    { k: "hoy", t: "Hoy" },
    { k: "semana", t: "Semana" },
    { k: "mes", t: "Mes" },
    { k: "todos", t: "Todos" },
  ];

  return (
    <div>
      <h1 className="mb-5 font-display text-title font-semibold text-ink">Pagos</h1>

      {/* KPIs */}
      <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StaggerItem>
          <Card glowOnHover={false} className="h-full">
            <div className="flex items-center gap-2 text-ink-muted">
              <Wallet size={16} className="text-accent" />
              <span className="text-sm">Caja del día</span>
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-ink">
              <CountUp value={data.totalDia} prefix="RD$ " />
            </p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card glowOnHover={false} className="h-full">
            <div className="flex items-center gap-2 text-ink-muted">
              <TrendingUp size={16} className="text-accent" />
              <span className="text-sm">Ingresos del mes</span>
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-ink">
              <CountUp value={data.totalMes} prefix="RD$ " />
            </p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card glowOnHover={false} className="h-full">
            <div className="flex items-center gap-2 text-ink-muted">
              <AlertCircle size={16} className="text-accent" />
              <span className="text-sm">Por cobrar</span>
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-accent">
              <CountUp value={data.totalPorCobrar} prefix="RD$ " />
            </p>
          </Card>
        </StaggerItem>
      </StaggerGroup>

      {/* Por método (mes) */}
      {data.porMetodo.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {data.porMetodo.map((m) => (
            <span key={m.metodo} className="glass rounded-full px-3 py-1 text-ink-muted">
              {cap(m.metodo)}:{" "}
              <span className="tabular-nums font-medium text-ink">{formatRD(m.total)}</span>
            </span>
          ))}
        </div>
      )}

      {/* Pagos pendientes */}
      <div className="mt-4">
        <ListCard
          title="Pagos pendientes"
          icon={AlertCircle}
          items={data.pendientes}
          getKey={(p) => p.id}
          empty="Sin pagos pendientes ✓"
          renderRow={(p) => (
            <MemberRow
              nombre={p.nombre}
              secondary={p.plan}
              right={
                <span className="tabular-nums text-sm font-semibold text-accent">
                  {formatRD(p.deuda)}
                </span>
              }
            />
          )}
        />
      </div>

      {/* Filtros */}
      <div className="mt-6 space-y-3">
        <Input
          id="buscar-pago"
          type="search"
          placeholder="Buscar por miembro…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          trailing={<Search size={18} className="mr-1 text-ink-faint" />}
        />
        <div className="flex flex-wrap items-center gap-2">
          {periodos.map((p) => (
            <button
              key={p.k}
              type="button"
              onClick={() => setPeriodo(p.k)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                periodo === p.k ? "bg-accent text-accent-contrast" : "glass text-ink-muted hover:text-ink"
              }`}
            >
              {p.t}
            </button>
          ))}
          <select className={field} value={metodo} onChange={(e) => setMetodo(e.target.value)}>
            <option value="todos">Todos los métodos</option>
            {METODOS.map((m) => (
              <option key={m} value={m}>
                {cap(m)}
              </option>
            ))}
          </select>
          <select className={field} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="todos">Todas las categorías</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {cap(c)}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-ink-muted">
          {filtrados.length} {filtrados.length === 1 ? "pago" : "pagos"}
        </p>
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <p className="mt-12 text-center text-sm text-ink-faint">No hay pagos con estos filtros.</p>
      ) : (
        <div className="mt-2 space-y-1">
          {mostrados.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setDetalle(p)}
              className="flex w-full items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-3 text-left transition-colors hover:border-line hover:bg-bg-2"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{p.miembro}</p>
                <p className="truncate text-xs text-ink-faint">
                  {cap(p.categoria)} · {cap(p.metodo)} · {formatFechaHora(p.fecha)}
                </p>
              </div>
              <span className="shrink-0 tabular-nums text-sm font-semibold text-ink">
                {formatRD(p.monto)}
              </span>
            </button>
          ))}
        </div>
      )}

      {visible < filtrados.length && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + 25)}
            className="rounded-full px-4 py-2 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
          >
            Mostrar más
          </button>
        </div>
      )}

      <PagoDetalle pago={detalle} onClose={() => setDetalle(null)} />
    </div>
  );
}
