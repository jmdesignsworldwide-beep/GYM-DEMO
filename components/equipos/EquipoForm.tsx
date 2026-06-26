"use client";

import { useEffect, useState } from "react";
import { Wrench, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { hoyISO } from "@/lib/miembros/estado";
import { formatFechaCorta } from "@/lib/format";
import { formatRD } from "@/lib/format";
import {
  CATEGORIAS_EQUIPO,
  ESTADOS_EQUIPO,
  getMantenimientos,
  type Equipo,
  type Mantenimiento,
} from "@/lib/inventario/equipos";
import { guardarEquipo, eliminarEquipo, registrarMantenimiento } from "@/app/(app)/equipos/actions";

const field =
  "h-12 w-full rounded-lg border bg-bg-2 px-4 text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none";
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function EquipoForm({
  equipo,
  onClose,
  onSaved,
}: {
  equipo: Equipo | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editar = !!equipo;
  const [form, setForm] = useState({
    nombre: equipo?.nombre ?? "",
    categoria: equipo?.categoria ?? CATEGORIAS_EQUIPO[0],
    estado: equipo?.estado ?? "operativo",
    ultima_revision: equipo?.ultimaRevision ?? "",
    proximo_mantenimiento: equipo?.proximoMantenimiento ?? "",
    notas: equipo?.notas ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bitácora + registrar mantenimiento (solo edición)
  const [bitacora, setBitacora] = useState<Mantenimiento[]>([]);
  const [mant, setMant] = useState({
    fecha: hoyISO(),
    descripcion: "",
    costo: "",
    proximaFecha: "",
    comoEgreso: false,
  });

  useEffect(() => {
    if (equipo) getMantenimientos(equipo.id).then(setBitacora);
  }, [equipo]);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    const fd = new FormData();
    if (equipo?.id) fd.set("id", equipo.id);
    Object.entries(form).forEach(([k, v]) => fd.set(k, String(v)));
    const res = await guardarEquipo(fd);
    if (res.ok) onSaved();
    else {
      setError(res.error ?? "No se pudo guardar.");
      setLoading(false);
    }
  }

  async function onMantenimiento() {
    if (!equipo) return;
    setError(null);
    const res = await registrarMantenimiento({
      equipoId: equipo.id,
      fecha: mant.fecha,
      descripcion: mant.descripcion,
      costo: Number(mant.costo) || 0,
      proximaFecha: mant.proximaFecha,
      comoEgreso: mant.comoEgreso,
    });
    if (res.ok) onSaved();
    else setError(res.error ?? "Error.");
  }

  async function onEliminar() {
    if (!equipo) return;
    if (!confirm(`¿Eliminar "${equipo.nombre}"?`)) return;
    const res = await eliminarEquipo(equipo.id);
    if (res.ok) onSaved();
    else setError(res.error ?? "Error.");
  }

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-muted">Nombre</span>
          <input className={field} value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-muted">Categoría</span>
            <select className={field} value={form.categoria} onChange={(e) => set("categoria", e.target.value)}>
              {CATEGORIAS_EQUIPO.map((c) => (
                <option key={c} value={c}>
                  {cap(c)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-muted">Estado</span>
            <select className={field} value={form.estado} onChange={(e) => set("estado", e.target.value)}>
              {ESTADOS_EQUIPO.map((s2) => (
                <option key={s2} value={s2}>
                  {cap(s2)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-muted">Última revisión</span>
            <input
              className={field}
              type="date"
              value={form.ultima_revision}
              onChange={(e) => set("ultima_revision", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-muted">Próximo mantenimiento</span>
            <input
              className={field}
              type="date"
              value={form.proximo_mantenimiento}
              onChange={(e) => set("proximo_mantenimiento", e.target.value)}
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-muted">Notas</span>
          <textarea
            className={`${field} h-20 resize-none py-3`}
            value={form.notas}
            onChange={(e) => set("notas", e.target.value)}
          />
        </label>

        {error && (
          <p className="rounded-lg border border-accent bg-accent-soft px-3 py-2.5 text-sm text-ink">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" loading={loading} magnetic={false} className="flex-1">
            {editar ? "Guardar cambios" : "Crear equipo"}
          </Button>
          <Button type="button" variant="secondary" magnetic={false} onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>

      {editar && (
        <>
          {/* Registrar mantenimiento */}
          <div className="space-y-3 border-t border-line pt-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
              <Wrench size={15} className="text-accent" /> Registrar mantenimiento
            </p>
            <div className="grid grid-cols-2 gap-3">
              <input
                className={field}
                type="date"
                value={mant.fecha}
                onChange={(e) => setMant((m) => ({ ...m, fecha: e.target.value }))}
              />
              <input
                className={field}
                type="date"
                value={mant.proximaFecha}
                onChange={(e) => setMant((m) => ({ ...m, proximaFecha: e.target.value }))}
                title="Próximo mantenimiento"
              />
            </div>
            <input
              className={field}
              placeholder="¿Qué se hizo?"
              value={mant.descripcion}
              onChange={(e) => setMant((m) => ({ ...m, descripcion: e.target.value }))}
            />
            <input
              className={field}
              type="number"
              min={0}
              placeholder="Costo RD$ (opcional)"
              value={mant.costo}
              onChange={(e) => setMant((m) => ({ ...m, costo: e.target.value }))}
            />
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={mant.comoEgreso}
                onChange={(e) => setMant((m) => ({ ...m, comoEgreso: e.target.checked }))}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Registrar el costo como egreso en caja
            </label>
            <Button type="button" variant="secondary" magnetic={false} onClick={onMantenimiento}>
              Registrar mantenimiento
            </Button>
          </div>

          {/* Bitácora */}
          {bitacora.length > 0 && (
            <div className="border-t border-line pt-4">
              <p className="mb-2 text-sm font-semibold text-ink-muted">Bitácora</p>
              <ul className="space-y-1">
                {bitacora.map((b) => (
                  <li key={b.id} className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-bg-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink">{b.descripcion || "Revisión"}</p>
                      <p className="text-xs text-ink-faint">{formatFechaCorta(b.fecha)}</p>
                    </div>
                    {b.costo != null && (
                      <span className="shrink-0 tabular-nums text-sm text-ink-muted">{formatRD(b.costo)}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={onEliminar}
            className="flex items-center gap-1.5 border-t border-line pt-4 text-sm text-red-500 hover:text-red-600"
          >
            <Trash2 size={15} /> Eliminar equipo
          </button>
        </>
      )}
    </div>
  );
}
