"use client";

import { TrendingUp, Users } from "lucide-react";
import { Aurora } from "@/components/Aurora";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { CajaDelDia } from "./CajaDelDia";
import { StatCard } from "./StatCard";
import { EnGymAhora } from "./EnGymAhora";
import { VencenSemana } from "./VencenSemana";
import { VencenHoy } from "./VencenHoy";
import { Pendientes } from "./Pendientes";
import { UltimosAccesos } from "./UltimosAccesos";
import { FichaProvider } from "./ficha";
import type { DashboardData } from "@/lib/dashboard/data";

export function DashboardView({ data }: { data: DashboardData }) {
  return (
    <FichaProvider>
    <div className="relative">
      <Aurora intensity="subtle" />

      <div className="mb-6">
        <h1 className="font-display text-title font-semibold text-ink">Resumen de hoy</h1>
        <p className="mt-1 text-sm capitalize text-ink-muted">{data.fechaLabel}</p>
      </div>

      <StaggerGroup className="space-y-4">
        {/* Fila 1 — la estrella + KPIs principales */}
        <div className="grid gap-4 lg:grid-cols-4">
          <StaggerItem className="lg:col-span-2">
            <CajaDelDia total={data.cajaHoy.total} />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Ingresos del mes"
              value={data.ingresosMes}
              prefix="RD$ "
              icon={TrendingUp}
              hint="Acumulado del mes"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Miembros activos"
              value={data.miembrosActivos}
              icon={Users}
              hint="Con membresía vigente"
            />
          </StaggerItem>
        </div>

        {/* Fila 2 — el pulso vivo */}
        <div className="grid gap-4 lg:grid-cols-2">
          <StaggerItem>
            <EnGymAhora count={data.enGymAhora} />
          </StaggerItem>
          <StaggerItem>
            <VencenSemana count={data.vencenSemana.length} />
          </StaggerItem>
        </div>

        {/* Fila 3 — acción y alertas */}
        <div className="grid gap-4 lg:grid-cols-3">
          <StaggerItem>
            <VencenHoy miembros={data.vencenHoy} />
          </StaggerItem>
          <StaggerItem>
            <Pendientes miembros={data.pendientes} />
          </StaggerItem>
          <StaggerItem>
            <UltimosAccesos accesos={data.ultimosAccesos} />
          </StaggerItem>
        </div>
      </StaggerGroup>
    </div>
    </FichaProvider>
  );
}
