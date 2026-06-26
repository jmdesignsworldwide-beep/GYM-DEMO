"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { formatRD } from "@/lib/format";
import type { PuntoTendencia } from "@/lib/dashboard/data";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function MesTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: PuntoTendencia }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-line bg-bg-2 px-3 py-2 text-sm shadow-card">
      <p className="text-ink-muted">{cap(p.mes)}</p>
      <p className="tabular-nums font-semibold text-ink">{formatRD(p.total)}</p>
    </div>
  );
}

export function TendenciaChart({ data }: { data: PuntoTendencia[] }) {
  const [sel, setSel] = useState<PuntoTendencia | null>(null);
  const yFmt = (v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`);

  return (
    <>
      <Card glowOnHover={false}>
        <div className="mb-4 flex items-center gap-2 text-ink-muted">
          <TrendingUp size={16} className="text-accent" />
          <h3 className="font-display text-sm font-semibold text-ink">Tendencia de ingresos</h3>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
              onClick={(state) => {
                const payload = (state as { activePayload?: { payload: PuntoTendencia }[] })
                  .activePayload;
                if (payload?.[0]) setSel(payload[0].payload);
              }}
            >
              <defs>
                <linearGradient id="grad-naranja" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-hover)" />
                  <stop offset="100%" stopColor="var(--accent)" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--line)" />
              <XAxis
                dataKey="mes"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--text-3)", fontSize: 12 }}
                tickFormatter={cap}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
                tick={{ fill: "var(--text-3)", fontSize: 12 }}
                tickFormatter={yFmt}
              />
              <Tooltip content={<MesTooltip />} cursor={{ fill: "var(--accent-soft)" }} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="url(#grad-naranja)" cursor="pointer" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-ink-faint">Toca un mes para ver el detalle</p>
      </Card>

      <Modal open={!!sel} onClose={() => setSel(null)} title="Ingresos del mes">
        {sel && (
          <div>
            <p className="text-ink-muted">{cap(sel.mes)}</p>
            <p className="text-gradient mt-1 font-display text-3xl font-bold">{formatRD(sel.total)}</p>
          </div>
        )}
      </Modal>
    </>
  );
}
