"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { guardarClase, eliminarClase } from "@/app/(app)/clases/actions";
import { type Clase, type InstructorOpcion, DISCIPLINAS, DIAS } from "@/lib/clases/data";

const field =
  "h-12 w-full rounded-lg border bg-bg-2 px-4 text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none";
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function ClaseForm({
  clase,
  instructores,
  onClose,
  onSaved,
}: {
  clase: Clase | null;
  instructores: InstructorOpcion[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const editar = !!clase;
  const [form, setForm] = useState({
    disciplina: clase?.disciplina ?? DISCIPLINAS[0],
    instructorId: clase?.instructorId ?? (instructores[0]?.id ?? ""),
    diaSemana: clase?.diaSemana ?? 1,
    hora: clase?.hora ?? "18:00",
    duracionMin: clase?.duracionMin ?? 60,
    capacidad: clase?.capacidad ?? 20,
    sala: clase?.sala ?? "",
    comision: clase?.comision ?? 0,
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
    const res = await guardarClase({ id: clase?.id ?? null, ...form });
    if (res.ok) onSaved();
    else {
      setError(res.error ?? "No se pudo guardar.");
      setLoading(false);
    }
  }

  async function onEliminar() {
    if (!clase) return;
    if (!confirm("¿Eliminar esta clase?")) return;
    const res = await eliminarClase(clase.id);
    if (res.ok) onSaved();
    else setError(res.error ?? "Error.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {instructores.length === 0 && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-ink">
          No hay instructores activos. Crea uno en Empleados primero.
        </p>
      )}

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-muted">Disciplina</span>
        <select className={field} value={form.disciplina} onChange={(e) => set("disciplina", e.target.value)}>
          {DISCIPLINAS.map((d) => (
            <option key={d} value={d}>
              {cap(d)}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-muted">Instructor</span>
        <select className={field} value={form.instructorId} onChange={(e) => set("instructorId", e.target.value)}>
          <option value="">— Selecciona —</option>
          {instructores.map((i) => (
            <option key={i.id} value={i.id}>
              {i.nombre}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-muted">Día</span>
          <select
            className={field}
            value={form.diaSemana}
            onChange={(e) => set("diaSemana", Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <option key={d} value={d}>
                {DIAS[d]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-muted">Hora</span>
          <input className={field} type="time" value={form.hora} onChange={(e) => set("hora", e.target.value)} />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-muted">Duración (min)</span>
          <input
            className={field}
            type="number"
            min={15}
            value={form.duracionMin}
            onChange={(e) => set("duracionMin", Number(e.target.value))}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-muted">Capacidad</span>
          <input
            className={field}
            type="number"
            min={1}
            value={form.capacidad}
            onChange={(e) => set("capacidad", Number(e.target.value))}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-muted">Sala / ubicación</span>
          <input className={field} value={form.sala} onChange={(e) => set("sala", e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-muted">Comisión instructor (RD$)</span>
          <input
            className={field}
            type="number"
            min={0}
            value={form.comision}
            onChange={(e) => set("comision", Number(e.target.value))}
          />
        </label>
      </div>

      {error && (
        <p className="rounded-lg border border-accent bg-accent-soft px-3 py-2.5 text-sm text-ink">{error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" loading={loading} magnetic={false} className="flex-1">
          {editar ? "Guardar cambios" : "Crear clase"}
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
          <Trash2 size={15} /> Eliminar clase
        </button>
      )}
    </form>
  );
}
