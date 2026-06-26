"use client";

import { useSearchParams } from "next/navigation";
import { TrendingUp, Users, ShieldAlert } from "lucide-react";
import { Aurora } from "@/components/Aurora";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { CajaDelDia } from "./CajaDelDia";
import { StatCard } from "./StatCard";
import { EnGymAhora } from "./EnGymAhora";
import { VencenSemana } from "./VencenSemana";
import { VencenHoy } from "./VencenHoy";
import { Pendientes } from "./Pendientes";
import { UltimosAccesos } from "./UltimosAccesos";
import { TendenciaChart } from "./TendenciaChart";
import { Breakdown } from "./Breakdown";
import { FichaProvider } from "./ficha";
import type { DashboardData } from "@/lib/dashboard/data";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function DashboardView({ data, rol }: { data: DashboardData; rol: string }) {
  const esAdmin = rol === "admin";
  const params = useSearchParams();
  const denegado = params.get("denegado") === "1";

  const detalleIngresos = (
    <Breakdown items={data.tendencia.map((t) => ({ label: cap(t.mes), value: t.total }))} />
  );

  const detalleMiembros = (
    <div>
      <Breakdown items={data.planes.map((p) => ({ label: p.plan, value: p.count }))} money={false} />
      <div className="mt-5 flex gap-3">
        <div className="flex-1 rounded-lg bg-bg-2 px-3 py-2 text-sm">
          <p className="text-ink-faint">Activos</p>
          <p className="font-display text-xl font-bold text-ink">{data.miembrosActivos}</p>
        </div>
        <div className="flex-1 rounded-lg bg-bg-2 px-3 py-2 text-sm">
          <p className="text-ink-faint">Vencidos</p>
          <p className="font-display text-xl font-bold text-accent">{data.vencidos}</p>
        </div>
      </div>
    </div>
  );

  const miembrosCard = (
    <StatCard
      label="Miembros activos"
      value={data.miembrosActivos}
      icon={Users}
      hint="Toca para el resumen"
      detailTitle="Miembros por plan"
      detail={detalleMiembros}
    />
  );

  return (
    <FichaProvider>
      <div className="relative">
        <Aurora intensity="subtle" />

        {denegado && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-accent bg-accent-soft px-4 py-3 text-sm text-ink">
            <ShieldAlert size={18} className="shrink-0 text-accent" />
            No tienes acceso a esa sección.
          </div>
        )}

        <div className="mb-6">
          <h1 className="font-display text-title font-semibold text-ink">Resumen de hoy</h1>
          <p className="mt-1 text-sm text-ink-muted">{data.fechaLabel}</p>
        </div>

        <StaggerGroup className="space-y-4">
          {esAdmin ? (
            <>
              {/* Fila 1 — estrella + KPIs (admin) */}
              <div className="grid gap-4 lg:grid-cols-4">
                <StaggerItem className="lg:col-span-2">
                  <CajaDelDia
                    total={data.cajaHoy.total}
                    porMetodo={data.cajaHoy.porMetodo}
                    porCategoria={data.cajaHoy.porCategoria}
                  />
                </StaggerItem>
                <StaggerItem>
                  <StatCard
                    label="Ingresos del mes"
                    value={data.ingresosMes}
                    prefix="RD$ "
                    icon={TrendingUp}
                    hint="Toca para la tendencia"
                    detailTitle="Ingresos por mes"
                    detail={detalleIngresos}
                  />
                </StaggerItem>
                <StaggerItem>{miembrosCard}</StaggerItem>
              </div>

              {/* Fila 2 — pulso */}
              <div className="grid gap-4 lg:grid-cols-2">
                <StaggerItem>
                  <EnGymAhora count={data.enGymAhora} lista={data.enGymLista} />
                </StaggerItem>
                <StaggerItem>
                  <VencenSemana miembros={data.vencenSemana} />
                </StaggerItem>
              </div>
            </>
          ) : (
            /* Cajero — solo operativo (sin caja, ingresos ni tendencia) */
            <div className="grid gap-4 lg:grid-cols-3">
              <StaggerItem>{miembrosCard}</StaggerItem>
              <StaggerItem>
                <EnGymAhora count={data.enGymAhora} lista={data.enGymLista} />
              </StaggerItem>
              <StaggerItem>
                <VencenSemana miembros={data.vencenSemana} />
              </StaggerItem>
            </div>
          )}

          {/* Fila acción — ambos roles */}
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

          {/* Tendencia — solo admin */}
          {esAdmin && (
            <StaggerItem>
              <TendenciaChart data={data.tendencia} />
            </StaggerItem>
          )}
        </StaggerGroup>
      </div>
    </FichaProvider>
  );
}
