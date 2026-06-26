"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet, Users, UserPlus, DoorOpen } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Breakdown } from "@/components/dashboard/Breakdown";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { CountUp } from "@/components/motion/CountUp";
import { formatRD } from "@/lib/format";
import type { ReportesData } from "@/lib/reportes/data";

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const yFmt = (v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`);

function MoneyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-bg-2 px-3 py-2 text-sm shadow-card">
      <p className="mb-1 text-ink-muted">{cap(label ?? "")}</p>
      {payload.map((p) => (
        <p key={p.name} className="tabular-nums font-medium" style={{ color: p.color }}>
          {p.name}: {formatRD(p.value)}
        </p>
      ))}
    </div>
  );
}

function CountTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-bg-2 px-3 py-2 text-sm shadow-card">
      <p className="text-ink-muted">{label}</p>
      <p className="tabular-nums font-semibold text-ink">{payload[0].value}</p>
    </div>
  );
}

function Kpi({
  label,
  value,
  prefix = "",
  icon: Icon,
  tone = "ink",
}: {
  label: string;
  value: number;
  prefix?: string;
  icon: typeof Wallet;
  tone?: "ink" | "accent" | "emerald" | "red";
}) {
  const color =
    tone === "accent"
      ? "text-accent"
      : tone === "emerald"
        ? "text-emerald-600 dark:text-emerald-400"
        : tone === "red"
          ? "text-red-600 dark:text-red-400"
          : "text-ink";
  return (
    <Card glowOnHover={false} className="h-full">
      <div className="mb-2 flex items-center gap-2 text-ink-muted">
        <Icon size={16} className="text-accent" />
        <p className="text-sm">{label}</p>
      </div>
      <p className={`font-display text-2xl font-bold tabular-nums ${color}`}>
        <CountUp value={value} prefix={prefix} />
      </p>
    </Card>
  );
}

export function ReportesView({ data }: { data: ReportesData }) {
  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-title font-semibold text-ink">Reportes</h1>
        <p className="mt-1 text-sm text-ink-muted">Resumen de {data.refMonthLabel}</p>
      </div>

      {/* KPIs */}
      <StaggerGroup className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StaggerItem>
          <Kpi label="Ingresos del mes" value={data.ingresosMes} prefix="RD$ " icon={TrendingUp} tone="emerald" />
        </StaggerItem>
        <StaggerItem>
          <Kpi label="Egresos del mes" value={data.egresosMes} prefix="RD$ " icon={TrendingDown} tone="red" />
        </StaggerItem>
        <StaggerItem>
          <Kpi label="Ganancia neta" value={data.gananciaMes} prefix="RD$ " icon={Wallet} tone="accent" />
        </StaggerItem>
        <StaggerItem>
          <Kpi label="Miembros activos" value={data.miembrosActivos} icon={Users} />
        </StaggerItem>
        <StaggerItem>
          <Kpi label="Nuevos del mes" value={data.nuevosMes} icon={UserPlus} />
        </StaggerItem>
        <StaggerItem>
          <Kpi label="Accesos del mes" value={data.accesosMes} icon={DoorOpen} />
        </StaggerItem>
      </StaggerGroup>

      {/* Ingresos vs egresos */}
      <Card glowOnHover={false} className="mt-4">
        <h2 className="mb-4 font-display text-sm font-semibold text-ink">
          Ingresos vs. egresos · últimos 6 meses
        </h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.ingresosEgresos} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--line)" />
              <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fill: "var(--text-3)", fontSize: 12 }} tickFormatter={cap} />
              <YAxis tickLine={false} axisLine={false} width={40} tick={{ fill: "var(--text-3)", fontSize: 12 }} tickFormatter={yFmt} />
              <Tooltip content={<MoneyTooltip />} cursor={{ fill: "var(--accent-soft)" }} />
              <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-2)" }} />
              <Bar dataKey="ingresos" name="Ingresos" radius={[5, 5, 0, 0]} fill="var(--accent)" />
              <Bar dataKey="egresos" name="Egresos" radius={[5, 5, 0, 0]} fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Desgloses de dinero */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card glowOnHover={false}>
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">Ingresos por categoría</h2>
          {data.ingresosPorCategoria.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-faint">Sin ingresos este mes.</p>
          ) : (
            <Breakdown items={data.ingresosPorCategoria.map((p) => ({ label: p.label, value: p.value }))} />
          )}
        </Card>
        <Card glowOnHover={false}>
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">Egresos por categoría</h2>
          {data.egresosPorCategoria.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-faint">Sin egresos este mes.</p>
          ) : (
            <Breakdown items={data.egresosPorCategoria.map((p) => ({ label: p.label, value: p.value }))} />
          )}
        </Card>
      </div>

      {/* Miembros */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card glowOnHover={false}>
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">Miembros por plan</h2>
          <Breakdown items={data.miembrosPorPlan.map((p) => ({ label: p.label, value: p.value }))} money={false} />
          <div className="mt-5 flex gap-3">
            <div className="flex-1 rounded-lg bg-bg-2 px-3 py-2">
              <p className="text-sm text-ink-faint">Activos</p>
              <p className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {data.activosVencidos.activos}
              </p>
            </div>
            <div className="flex-1 rounded-lg bg-bg-2 px-3 py-2">
              <p className="text-sm text-ink-faint">Vencidos</p>
              <p className="font-display text-xl font-bold text-red-600 dark:text-red-400">
                {data.activosVencidos.vencidos}
              </p>
            </div>
          </div>
        </Card>

        <Card glowOnHover={false}>
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">Nuevos miembros · últimos 6 meses</h2>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.nuevosPorMes} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--line)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--text-3)", fontSize: 12 }} tickFormatter={cap} />
                <YAxis tickLine={false} axisLine={false} width={28} tick={{ fill: "var(--text-3)", fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<CountTooltip />} cursor={{ fill: "var(--accent-soft)" }} />
                <Bar dataKey="value" name="Nuevos" radius={[5, 5, 0, 0]} fill="var(--accent)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Accesos por día */}
      <Card glowOnHover={false} className="mt-4">
        <h2 className="mb-4 font-display text-sm font-semibold text-ink">Asistencia · últimos 14 días</h2>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.accesosPorDia} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--line)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--text-3)", fontSize: 11 }} interval={1} />
              <YAxis tickLine={false} axisLine={false} width={28} tick={{ fill: "var(--text-3)", fontSize: 12 }} allowDecimals={false} />
              <Tooltip content={<CountTooltip />} cursor={{ fill: "var(--accent-soft)" }} />
              <Bar dataKey="value" name="Accesos" radius={[4, 4, 0, 0]}>
                {data.accesosPorDia.map((_, i) => (
                  <Cell key={i} fill="var(--accent)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <p className="mt-4 text-center text-xs text-ink-faint">
        Datos de demostración. Cifras generadas para fines de presentación.
      </p>
    </div>
  );
}
