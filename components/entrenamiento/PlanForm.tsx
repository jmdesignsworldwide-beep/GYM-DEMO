"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Avatar } from "@/components/miembros/Avatar";
import { Button } from "@/components/ui/Button";
import { guardarPlan, eliminarPlan } from "@/app/(app)/entrenamiento/actions";
import { type PlanPt, type EntrenadorOpcion, OBJETIVOS_PT } from "@/lib/entrenamiento/data";

const field =
  "h-12 w-full rounded-lg border bg-bg-2 px-4 text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none";

type Miembro = { id: string; nombre: string; fotoUrl: string | null };

export function PlanForm({
  plan,
  entrenadores,
  miembrosSinPlan,
  onClose,
  onSaved,
}: {
  plan: PlanPt | null;
  entrenadores: EntrenadorOpcion[];
  miembrosSinPlan: Miembro[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const editar = !!plan;
  const [miembroId, setMiembroId] = useState(plan?.miembroId ?? (miembrosSinPlan[0]?.id ?? ""));
  const [form, setForm] = useState({
    entrenadorId: plan?.entrenadorId ?? (entrenadores[0]?.id ?? ""),
    sesionesIncluidas: plan?.sesionesIncluidas ?? 4,
    precioSesionAdicional: plan?.precioSesionAdicional ?? 600,
    objetivo: plan?.objetivo ?? OBJETIVOS_PT[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    const res = await guardarPlan({ id: plan?.id ?? null, miembroId, ...form });
    if (res.ok) onSaved();
    else {
      setError(res.error ?? "No se pudo guardar.");
      setLoading(false);
    }
  }

  async function onEliminar() {
    if (!plan) return;
    if (!confirm("¿Eliminar este plan?")) return;
    const res = await eliminarPlan(plan.id);
    if (res.ok) onSaved();
    else setError(res.error ?? "Error.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Miembro */}
      {editar ? (
        <div className="flex items-center gap-3 rounded-lg bg-bg-2 p-3">
          <Avatar nombre={plan.miembroNombre} foto={plan.miembroFoto} size={40} />
          <span className="text-sm font-medium text-ink">{plan.miembroNombre}</span>
        </div>
      ) : (
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-muted">Miembro</span>
          {miembrosSinPlan.length === 0 ? (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-ink">
              Todos los miembros ya tienen un plan activo.
            </p>
          ) : (
            <select className={field} value={miembroId} onChange={(e) => setMiembroId(e.target.value)}>
              {miembrosSinPlan.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          )}
        </label>
      )}

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-muted">Entrenador</span>
        <select className={field} value={form.entrenadorId} onChange={(e) => set("entrenadorId", e.target.value)}>
          <option value="">— Selecciona —</option>
          {entrenadores.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-muted">Objetivo</span>
        <select className={field} value={form.objetivo} onChange={(e) => set("objetivo", e.target.value)}>
          {OBJETIVOS_PT.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-muted">Sesiones incluidas</span>
          <input
            className={field}
            type="number"
            min={0}
            value={form.sesionesIncluidas}
            onChange={(e) => set("sesionesIncluidas", Number(e.target.value))}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-muted">Precio sesión adicional</span>
          <input
            className={field}
            type="number"
            min={0}
            value={form.precioSesionAdicional}
            onChange={(e) => set("precioSesionAdicional", Number(e.target.value))}
          />
        </label>
      </div>

      {error && (
        <p className="rounded-lg border border-accent bg-accent-soft px-3 py-2.5 text-sm text-ink">{error}</p>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          loading={loading}
          magnetic={false}
          className="flex-1"
          disabled={!editar && miembrosSinPlan.length === 0}
        >
          {editar ? "Guardar cambios" : "Crear plan"}
        </Button>
        <Button type="button" variant="secondary" magnetic={false} onClick={onClose}>
          Cancelar
        </Button>
      </div>

      {editar && (
        <button
          type="button"
          onClick={onEliminar}
          className="flex items-center gap-1.5 border-t border-line pt-4 text-sm text-red-500 hover:text-red-600"
        >
          <Trash2 size={15} /> Eliminar plan
        </button>
      )}
    </form>
  );
}
