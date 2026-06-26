"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Avatar } from "@/components/miembros/Avatar";
import { Button } from "@/components/ui/Button";
import { guardarPlanNutricion, eliminarPlanNutricion } from "@/app/(app)/nutricion/actions";
import { type PlanNutricion, OBJETIVOS_NUT, calcularMacros } from "@/lib/nutricion/data";

const field =
  "h-12 w-full rounded-lg border bg-bg-2 px-4 text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none";

type Miembro = { id: string; nombre: string; fotoUrl: string | null };

export function PlanNutricionForm({
  plan,
  miembros,
  onClose,
  onSaved,
}: {
  plan: PlanNutricion | null;
  miembros: Miembro[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const editar = !!plan;
  const [miembroId, setMiembroId] = useState(plan?.miembroId ?? (miembros[0]?.id ?? ""));
  const [objetivo, setObjetivo] = useState(plan?.objetivo ?? OBJETIVOS_NUT[0].key);
  // Peso de referencia: si edita, lo estima desde sus calorías/objetivo actuales.
  const [peso, setPeso] = useState<string>("");
  const [notas, setNotas] = useState(plan?.notas ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const macros = useMemo(() => calcularMacros(Number(peso), objetivo), [peso, objetivo]);
  const pesoValido = Number(peso) > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    const res = await guardarPlanNutricion({
      id: plan?.id ?? null,
      miembroId,
      objetivo,
      peso: Number(peso),
      notas,
    });
    if (res.ok) onSaved();
    else {
      setError(res.error ?? "No se pudo guardar.");
      setLoading(false);
    }
  }

  async function onEliminar() {
    if (!plan) return;
    if (!confirm("¿Eliminar este plan?")) return;
    const res = await eliminarPlanNutricion(plan.id);
    if (res.ok) onSaved();
    else setError(res.error ?? "Error.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {editar ? (
        <div className="flex items-center gap-3 rounded-lg bg-bg-2 p-3">
          <Avatar nombre={plan.miembroNombre} foto={plan.miembroFoto} size={40} />
          <span className="text-sm font-medium text-ink">{plan.miembroNombre}</span>
        </div>
      ) : (
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-muted">Miembro</span>
          <select className={field} value={miembroId} onChange={(e) => setMiembroId(e.target.value)}>
            {miembros.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-muted">Objetivo</span>
        <select className={field} value={objetivo} onChange={(e) => setObjetivo(e.target.value)}>
          {OBJETIVOS_NUT.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-muted">Peso actual (kg)</span>
        <input
          className={field}
          type="number"
          step="0.1"
          min={1}
          placeholder="Ej. 75"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
        />
      </label>

      {/* Macros calculados en vivo */}
      <div className="rounded-lg border border-line p-4">
        <p className="mb-3 text-sm font-semibold text-ink-muted">
          Plan calculado{pesoValido ? "" : " (indica el peso)"}
        </p>
        <div className="mb-3 text-center">
          <p className="text-gradient font-display text-3xl font-bold">{macros.calorias}</p>
          <p className="text-xs text-ink-faint">kcal por día</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-bg-2 p-2">
            <p className="font-display text-lg font-bold text-ink">{macros.proteina}g</p>
            <p className="text-[11px] text-ink-faint">Proteína</p>
          </div>
          <div className="rounded-lg bg-bg-2 p-2">
            <p className="font-display text-lg font-bold text-ink">{macros.carbos}g</p>
            <p className="text-[11px] text-ink-faint">Carbos</p>
          </div>
          <div className="rounded-lg bg-bg-2 p-2">
            <p className="font-display text-lg font-bold text-ink">{macros.grasa}g</p>
            <p className="text-[11px] text-ink-faint">Grasa</p>
          </div>
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-muted">Notas (opcional)</span>
        <input className={field} value={notas} onChange={(e) => setNotas(e.target.value)} />
      </label>

      {error && (
        <p className="rounded-lg border border-accent bg-accent-soft px-3 py-2.5 text-sm text-ink">{error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" loading={loading} magnetic={false} className="flex-1" disabled={!pesoValido}>
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
