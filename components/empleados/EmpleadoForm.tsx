"use client";

import { useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { Avatar } from "@/components/miembros/Avatar";
import { Button } from "@/components/ui/Button";
import { guardarEmpleado, eliminarEmpleado } from "@/app/(app)/empleados/actions";
import { type Empleado, PUESTOS, PUESTO_LABEL, ESPECIALIDADES } from "@/lib/empleados/data";

const field =
  "h-12 w-full rounded-lg border bg-bg-2 px-4 text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none";
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function EmpleadoForm({
  empleado,
  onClose,
  onSaved,
}: {
  empleado: Empleado | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editar = !!empleado;
  const [form, setForm] = useState({
    nombre: empleado?.nombre ?? "",
    cedula: empleado?.cedula ?? "",
    telefono: empleado?.telefono ?? "",
    puesto: empleado?.puesto ?? PUESTOS[0],
    fecha_ingreso: empleado?.fechaIngreso ?? "",
    salario: empleado?.salario ?? 0,
    horario: empleado?.horario ?? "",
    estado: empleado?.estado ?? "activo",
    notas: empleado?.notas ?? "",
  });
  const [especialidades, setEspecialidades] = useState<string[]>(empleado?.especialidades ?? []);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(empleado?.fotoUrl ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function toggleEsp(e: string) {
    setEspecialidades((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    const fd = new FormData();
    if (empleado?.id) fd.set("id", empleado.id);
    Object.entries(form).forEach(([k, v]) => fd.set(k, String(v)));
    fd.set("especialidades", especialidades.join(","));
    if (file) fd.set("foto", file);
    const res = await guardarEmpleado(fd);
    if (res.ok) onSaved();
    else {
      setError(res.error ?? "No se pudo guardar.");
      setLoading(false);
    }
  }

  async function onEliminar() {
    if (!empleado) return;
    if (!confirm(`¿Eliminar a "${empleado.nombre}"?`)) return;
    const res = await eliminarEmpleado(empleado.id);
    if (res.ok) onSaved();
    else setError(res.error ?? "Error.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center gap-4">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <Avatar nombre={form.nombre || "E"} size={64} />
        )}
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setFile(f);
                setPreview(URL.createObjectURL(f));
              }
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full bg-bg-3 px-4 py-2 text-sm font-medium text-ink hover:bg-bg-2"
          >
            <Camera size={16} /> {preview ? "Cambiar foto" : "Foto (opcional)"}
          </button>
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-muted">Nombre</span>
        <input className={field} value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-muted">Cédula</span>
          <input
            className={field}
            placeholder="000-0000000-0"
            value={form.cedula}
            onChange={(e) => set("cedula", e.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-muted">Teléfono</span>
          <input
            className={field}
            placeholder="809-000-0000"
            value={form.telefono}
            onChange={(e) => set("telefono", e.target.value)}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-muted">Puesto</span>
          <select className={field} value={form.puesto} onChange={(e) => set("puesto", e.target.value)}>
            {PUESTOS.map((p) => (
              <option key={p} value={p}>
                {PUESTO_LABEL[p]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-muted">Estado</span>
          <select className={field} value={form.estado} onChange={(e) => set("estado", e.target.value)}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </label>
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-ink-muted">Especialidades</span>
        <div className="flex flex-wrap gap-2">
          {ESPECIALIDADES.map((e) => {
            const on = especialidades.includes(e);
            return (
              <button
                key={e}
                type="button"
                onClick={() => toggleEsp(e)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  on ? "bg-accent text-accent-contrast" : "glass text-ink-muted hover:text-ink"
                }`}
              >
                {cap(e)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-muted">Fecha de ingreso</span>
          <input
            className={field}
            type="date"
            value={form.fecha_ingreso}
            onChange={(e) => set("fecha_ingreso", e.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-muted">Salario mensual (RD$)</span>
          <input
            className={field}
            type="number"
            min={0}
            value={form.salario}
            onChange={(e) => set("salario", Number(e.target.value))}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-muted">Horario de trabajo</span>
        <input
          className={field}
          placeholder="Ej. Lun–Vie 6:00am–2:00pm"
          value={form.horario}
          onChange={(e) => set("horario", e.target.value)}
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-muted">Notas (opcional)</span>
        <input className={field} value={form.notas} onChange={(e) => set("notas", e.target.value)} />
      </label>

      {error && (
        <p className="rounded-lg border border-accent bg-accent-soft px-3 py-2.5 text-sm text-ink">{error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" loading={loading} magnetic={false} className="flex-1">
          {editar ? "Guardar cambios" : "Crear empleado"}
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
          <Trash2 size={15} /> Eliminar empleado
        </button>
      )}
    </form>
  );
}
