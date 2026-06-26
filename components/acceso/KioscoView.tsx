"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ArrowLeft, CheckCircle2, XCircle, Snowflake, Ban } from "lucide-react";
import { Avatar } from "@/components/miembros/Avatar";
import { Button } from "@/components/ui/Button";
import { Aurora } from "@/components/Aurora";
import { Pulse } from "@/components/motion/Pulse";
import { CountUp } from "@/components/motion/CountUp";
import { RenovarModal } from "@/components/miembros/RenovarModal";
import { estadoInfo, estadoEfectivo, hoyISO, normaliza } from "@/lib/miembros/estado";
import { formatFechaCorta } from "@/lib/format";
import { registrarAcceso } from "@/app/(app)/acceso/actions";
import type { Miembro } from "@/lib/miembros/data";

function diasEntre(aYmd: string, bYmd: string): number {
  return Math.round((Date.parse(`${bYmd}T00:00:00Z`) - Date.parse(`${aYmd}T00:00:00Z`)) / 86400000);
}

export function KioscoView({
  miembros,
  enGymInicial,
}: {
  miembros: Miembro[];
  enGymInicial: number;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Miembro | null>(null);
  const [enGym, setEnGym] = useState(enGymInicial);
  const [renovarOpen, setRenovarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hoy = hoyISO();
  const eff = sel ? estadoEfectivo(sel.estado, sel.fecha_vencimiento) : null;

  const resultados = useMemo(() => {
    const t = normaliza(q.trim());
    if (!t) return [];
    return miembros
      .filter(
        (m) =>
          normaliza(m.nombre).includes(t) ||
          (m.codigo ?? "").toLowerCase().includes(t) ||
          m.cedula.toLowerCase().includes(t),
      )
      .slice(0, 6);
  }, [q, miembros]);

  async function entrar(m: Miembro) {
    setError(null);
    const res = await registrarAcceso(m.id);
    if (res.ok) {
      setEnGym((c) => c + 1);
      router.refresh();
    } else {
      setError(res.error ?? "No se pudo registrar el acceso.");
    }
  }

  function seleccionar(m: Miembro) {
    setSel(m);
    setQ("");
    setError(null);
    if (estadoEfectivo(m.estado, m.fecha_vencimiento) === "activo") entrar(m);
  }

  function volver() {
    setSel(null);
    setError(null);
  }

  // Vuelve solo a "esperando" tras la bienvenida.
  useEffect(() => {
    if (sel && eff === "activo") {
      const t = setTimeout(volver, 7000);
      return () => clearTimeout(t);
    }
  }, [sel, eff]);

  return (
    <div className="relative min-h-[70vh]">
      <Aurora intensity={sel ? "intense" : "subtle"} />

      {/* Contador en el gym ahora */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-title font-semibold text-ink">Control de acceso</h1>
        <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm">
          <Pulse />
          <span className="tabular-nums font-semibold text-ink">
            <CountUp value={enGym} />
          </span>
          <span className="text-ink-muted">en el gym</span>
        </span>
      </div>

      <AnimatePresence mode="wait">
        {!sel ? (
          <motion.div
            key="buscar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-xl"
          >
            <div className="relative">
              <Search
                size={20}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
              />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Nombre, código (JMF-…) o cédula"
                className="h-14 w-full rounded-xl border bg-bg-2 pl-12 pr-4 text-lg text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
              />
            </div>

            <div className="mt-3 space-y-1">
              {resultados.map((m) => {
                const e = estadoInfo(estadoEfectivo(m.estado, m.fecha_vencimiento));
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => seleccionar(m)}
                    className="flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-3 text-left transition-colors hover:border-line hover:bg-bg-2"
                  >
                    <Avatar nombre={m.nombre} foto={m.foto_url} size={44} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink">{m.nombre}</p>
                      <p className="truncate text-xs text-ink-faint">{m.codigo}</p>
                    </div>
                    <span className={`h-2.5 w-2.5 rounded-full ${e.dot}`} />
                  </button>
                );
              })}
              {q.trim() && resultados.length === 0 && (
                <p className="py-6 text-center text-sm text-ink-faint">Sin resultados.</p>
              )}
            </div>

            <p className="mt-10 text-center text-xs text-ink-faint">
              Control de acceso simulado para demostración. Sin integración con hardware físico.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={sel.id}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="mx-auto max-w-lg text-center"
          >
            <Respuesta
              miembro={sel}
              eff={eff!}
              hoy={hoy}
              error={error}
              onRenovar={() => setRenovarOpen(true)}
              onVolver={volver}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {sel && (
        <RenovarModal
          miembro={sel}
          open={renovarOpen}
          onClose={() => setRenovarOpen(false)}
          onDone={(r) => {
            const upd: Miembro = {
              ...sel,
              fecha_vencimiento: r.nuevaFecha ?? sel.fecha_vencimiento,
              estado: "activo",
              plan: r.plan ?? sel.plan,
              precio_mensual: r.precio ?? sel.precio_mensual,
              deuda: 0,
            };
            setRenovarOpen(false);
            setSel(upd);
            entrar(upd);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function Respuesta({
  miembro: m,
  eff,
  hoy,
  error,
  onRenovar,
  onVolver,
}: {
  miembro: Miembro;
  eff: string;
  hoy: string;
  error: string | null;
  onRenovar: () => void;
  onVolver: () => void;
}) {
  const foto = (
    <div className="relative mx-auto mb-5 w-fit">
      <Avatar nombre={m.nombre} foto={m.foto_url} size={150} />
    </div>
  );

  if (eff === "activo") {
    const dias = diasEntre(hoy, m.fecha_vencimiento);
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8" style={{ boxShadow: "0 0 40px -10px rgba(16,185,129,0.4)" }}>
        {foto}
        <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500" />
        <p className="font-display text-3xl font-bold text-ink">¡Bienvenida, {m.nombre.split(" ")[0]}!</p>
        <p className="mt-1 text-sm text-ink-muted">Entrada registrada · {m.plan}</p>
        {dias <= 7 && (
          <p className="mt-4 rounded-lg bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-600 dark:text-amber-400">
            Tu membresía vence en {dias} {dias === 1 ? "día" : "días"} — ¿renovamos?
          </p>
        )}
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        <Button variant="secondary" magnetic={false} className="mt-6" onClick={onVolver}>
          <ArrowLeft size={16} /> Siguiente
        </Button>
      </div>
    );
  }

  if (eff === "vencido") {
    const hace = diasEntre(m.fecha_vencimiento, hoy);
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8">
        {foto}
        <XCircle size={32} className="mx-auto mb-2 text-red-500" />
        <p className="font-display text-3xl font-bold text-ink">Membresía vencida</p>
        <p className="mt-1 text-sm text-ink-muted">
          {m.nombre} · {hace === 0 ? "Venció hoy" : `Venció hace ${hace} ${hace === 1 ? "día" : "días"}`}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button magnetic={false} onClick={onRenovar}>
            Renovar ahora
          </Button>
          <Button variant="secondary" magnetic={false} onClick={onVolver}>
            <ArrowLeft size={16} /> Volver
          </Button>
        </div>
      </div>
    );
  }

  if (eff === "congelado") {
    return (
      <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-8">
        {foto}
        <Snowflake size={32} className="mx-auto mb-2 text-sky-500" />
        <p className="font-display text-3xl font-bold text-ink">Membresía congelada</p>
        <p className="mt-1 text-sm text-ink-muted">
          {m.nombre}
          {m.fecha_reanudacion ? ` · reanuda el ${formatFechaCorta(m.fecha_reanudacion)}` : ""}
        </p>
        <Button variant="secondary" magnetic={false} className="mt-6" onClick={onVolver}>
          <ArrowLeft size={16} /> Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-bg-2 p-8">
      {foto}
      <Ban size={32} className="mx-auto mb-2 text-ink-faint" />
      <p className="font-display text-3xl font-bold text-ink">Membresía cancelada</p>
      <p className="mt-1 text-sm text-ink-muted">{m.nombre}</p>
      <Button variant="secondary" magnetic={false} className="mt-6" onClick={onVolver}>
        <ArrowLeft size={16} /> Volver
      </Button>
    </div>
  );
}
