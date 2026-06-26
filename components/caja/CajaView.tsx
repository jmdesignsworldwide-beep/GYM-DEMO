"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, TrendingDown, LockOpen, Lock, Plus, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CountUp } from "@/components/motion/CountUp";
import { formatRD, formatFechaHora } from "@/lib/format";
import { abrirCaja, registrarEgreso, cerrarCaja, type CierreResult } from "@/app/(app)/caja/actions";
import type { CajaData } from "@/lib/caja/data";

const field =
  "h-12 w-full rounded-lg border bg-bg-2 px-4 text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none";
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const CATEGORIAS_EGRESO = [
  "Compra de productos",
  "Limpieza",
  "Mantenimiento",
  "Adelanto a empleado",
  "Servicios",
  "Otros",
];

export function CajaView({ data }: { data: CajaData }) {
  const router = useRouter();
  const [base, setBase] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [egresoOpen, setEgresoOpen] = useState(false);
  const [egMonto, setEgMonto] = useState("");
  const [egCat, setEgCat] = useState(CATEGORIAS_EGRESO[0]);
  const [egNota, setEgNota] = useState("");

  const [cerrarOpen, setCerrarOpen] = useState(false);
  const [contado, setContado] = useState("");
  const [cierre, setCierre] = useState<CierreResult | null>(null);

  async function onAbrir(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await abrirCaja(Number(base));
    setLoading(false);
    if (res.ok) {
      setBase("");
      router.refresh();
    } else setError(res.error ?? "Error.");
  }

  async function onEgreso(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await registrarEgreso({ monto: Number(egMonto), categoria: egCat, nota: egNota });
    setLoading(false);
    if (res.ok) {
      setEgresoOpen(false);
      setEgMonto("");
      setEgNota("");
      router.refresh();
    } else setError(res.error ?? "Error.");
  }

  async function onCerrar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await cerrarCaja(Number(contado));
    setLoading(false);
    if (res.ok) {
      setCierre(res);
      router.refresh();
    } else setError(res.error ?? "Error.");
  }

  // Sin caja abierta → pantalla de apertura
  if (!data.sesion) {
    return (
      <div className="mx-auto max-w-md">
        <h1 className="mb-5 font-display text-title font-semibold text-ink">Caja</h1>
        <Card glowOnHover={false}>
          <div className="mb-4 flex items-center gap-2">
            <LockOpen size={18} className="text-accent" />
            <h2 className="font-display text-sm font-semibold text-ink">Abrir caja</h2>
          </div>
          <form onSubmit={onAbrir} className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-muted">
                Fondo de caja (base en efectivo, RD$)
              </span>
              <input
                className={field}
                type="number"
                min={0}
                placeholder="Ej. 2000"
                value={base}
                onChange={(e) => setBase(e.target.value)}
              />
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" loading={loading} magnetic={false} className="w-full">
              Abrir caja
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-title font-semibold text-ink">Caja</h1>
          <p className="mt-1 text-sm text-ink-muted">{data.fechaLabel}</p>
        </div>
        <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-ink-muted">
          <LockOpen size={14} className="text-emerald-500" /> Abierta por{" "}
          {data.sesion.abierta_por_nombre} · base {formatRD(data.sesion.base)}
        </span>
      </div>

      {/* KPIs del turno */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card glowOnHover={false}>
          <div className="flex items-center gap-2 text-ink-muted">
            <Wallet size={16} className="text-accent" />
            <span className="text-sm">Ingresos del día</span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-ink">
            <CountUp value={data.ingresosTotal} prefix="RD$ " />
          </p>
        </Card>
        <Card glowOnHover={false}>
          <div className="flex items-center gap-2 text-ink-muted">
            <TrendingDown size={16} className="text-accent" />
            <span className="text-sm">Egresos del día</span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-ink">
            <CountUp value={data.egresosTotal} prefix="RD$ " />
          </p>
        </Card>
        <Card glowOnHover={false}>
          <div className="flex items-center gap-2 text-ink-muted">
            <Wallet size={16} className="text-accent" />
            <span className="text-sm">Efectivo esperado</span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-accent">
            <CountUp value={data.esperadoEfectivo} prefix="RD$ " />
          </p>
        </Card>
      </div>

      {/* Desglose por método */}
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

      <div className="mt-4 flex flex-wrap gap-2">
        <Button magnetic={false} onClick={() => setEgresoOpen(true)}>
          <Plus size={16} /> Registrar egreso
        </Button>
        <Button variant="secondary" magnetic={false} onClick={() => setCerrarOpen(true)}>
          <Lock size={16} /> Cerrar caja
        </Button>
      </div>

      {/* Egresos del día */}
      <Card glowOnHover={false} className="mt-6">
        <h2 className="mb-3 font-display text-sm font-semibold text-ink">Egresos del día</h2>
        {data.egresos.length === 0 ? (
          <p className="py-4 text-sm text-ink-faint">Sin egresos registrados hoy.</p>
        ) : (
          <ul className="space-y-1">
            {data.egresos.map((e) => (
              <li key={e.id} className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-bg-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{e.categoria}</p>
                  <p className="truncate text-xs text-ink-faint">
                    {e.nota ? `${e.nota} · ` : ""}
                    {formatFechaHora(e.fecha)}
                  </p>
                </div>
                <span className="shrink-0 tabular-nums text-sm font-semibold text-red-500">
                  − {formatRD(e.monto)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Modal egreso */}
      <Modal open={egresoOpen} onClose={() => setEgresoOpen(false)} title="Registrar egreso">
        <form onSubmit={onEgreso} className="space-y-3">
          <input
            className={field}
            type="number"
            min={0}
            placeholder="Monto (RD$)"
            value={egMonto}
            onChange={(e) => setEgMonto(e.target.value)}
          />
          <select className={field} value={egCat} onChange={(e) => setEgCat(e.target.value)}>
            {CATEGORIAS_EGRESO.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            className={field}
            placeholder="Nota (opcional)"
            value={egNota}
            onChange={(e) => setEgNota(e.target.value)}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" loading={loading} magnetic={false} className="w-full">
            Registrar egreso
          </Button>
        </form>
      </Modal>

      {/* Modal cerrar caja / arqueo */}
      <Modal
        open={cerrarOpen}
        onClose={() => {
          setCerrarOpen(false);
          setCierre(null);
          setContado("");
        }}
        title={cierre ? "Caja cerrada" : "Cerrar caja"}
      >
        {cierre ? (
          <div className="space-y-4 text-center">
            <CheckCircle2 size={44} className="mx-auto text-emerald-500" />
            <div className="space-y-2 rounded-lg bg-bg-2 p-4 text-sm">
              <Row label="Ingresos" value={formatRD(cierre.ingresos ?? 0)} />
              <Row label="Egresos" value={`− ${formatRD(cierre.egresos ?? 0)}`} />
              <Row label="Efectivo esperado" value={formatRD(cierre.esperado ?? 0)} />
              <Row label="Efectivo contado" value={formatRD(cierre.contado ?? 0)} />
            </div>
            <DiferenciaBadge diff={cierre.diferencia ?? 0} />
            <p className="text-xs text-ink-faint">Documento de ejemplo generado para demostración.</p>
            <Button
              magnetic={false}
              className="w-full"
              onClick={() => {
                setCerrarOpen(false);
                setCierre(null);
                setContado("");
              }}
            >
              Listo
            </Button>
          </div>
        ) : (
          <form onSubmit={onCerrar} className="space-y-3">
            <p className="text-sm text-ink-muted">
              Cuenta el efectivo físico en caja e ingrésalo. El sistema lo compara con lo esperado.
            </p>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-muted">
                Efectivo contado (RD$)
              </span>
              <input
                className={field}
                type="number"
                min={0}
                placeholder="Ej. 12500"
                value={contado}
                onChange={(e) => setContado(e.target.value)}
              />
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" loading={loading} magnetic={false} className="w-full">
              Cerrar y arquear
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-muted">{label}</span>
      <span className="tabular-nums font-medium text-ink">{value}</span>
    </div>
  );
}

function DiferenciaBadge({ diff }: { diff: number }) {
  if (diff === 0)
    return (
      <p className="rounded-lg bg-emerald-500/10 px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
        Caja cuadrada ✓
      </p>
    );
  if (diff > 0)
    return (
      <p className="rounded-lg bg-sky-500/10 px-4 py-3 font-semibold text-sky-600 dark:text-sky-400">
        Sobran {formatRD(diff)}
      </p>
    );
  return (
    <p className="rounded-lg bg-red-500/10 px-4 py-3 font-semibold text-red-600 dark:text-red-400">
      Faltan {formatRD(Math.abs(diff))}
    </p>
  );
}
