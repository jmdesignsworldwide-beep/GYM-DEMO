"use client";

import { useRef, useState } from "react";
import { Camera, PackagePlus, Trash2 } from "lucide-react";
import { Avatar } from "@/components/miembros/Avatar";
import { Button } from "@/components/ui/Button";
import { CATEGORIAS_PRODUCTO } from "@/lib/inventario/stock";
import { guardarProducto, eliminarProducto, reabastecer } from "@/app/(app)/inventario/actions";
import type { Producto } from "@/lib/caja/productos";

const field =
  "h-12 w-full rounded-lg border bg-bg-2 px-4 text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none";
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function ProductoForm({
  producto,
  onClose,
  onSaved,
}: {
  producto: Producto | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editar = !!producto;
  const [form, setForm] = useState({
    nombre: producto?.nombre ?? "",
    categoria: producto?.categoria ?? CATEGORIAS_PRODUCTO[0],
    precio: producto?.precio ?? 0,
    stock: producto?.stock ?? 0,
    umbral_alerta: producto?.umbralAlerta ?? 5,
    proveedor: producto?.proveedor ?? "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(producto?.fotoUrl ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reab, setReab] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    const fd = new FormData();
    if (producto?.id) fd.set("id", producto.id);
    Object.entries(form).forEach(([k, v]) => fd.set(k, String(v)));
    if (file) fd.set("foto", file);
    const res = await guardarProducto(fd);
    if (res.ok) onSaved();
    else {
      setError(res.error ?? "No se pudo guardar.");
      setLoading(false);
    }
  }

  async function onReabastecer() {
    if (!producto) return;
    const res = await reabastecer(producto.id, Number(reab));
    if (res.ok) onSaved();
    else setError(res.error ?? "Error.");
  }

  async function onEliminar() {
    if (!producto) return;
    if (!confirm(`¿Eliminar "${producto.nombre}"?`)) return;
    const res = await eliminarProducto(producto.id);
    if (res.ok) onSaved();
    else setError(res.error ?? "Error.");
  }

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-16 w-16 rounded-lg object-cover" />
          ) : (
            <Avatar nombre={form.nombre || "P"} size={64} />
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
            <span className="mb-1.5 block text-sm font-medium text-ink-muted">Categoría</span>
            <select className={field} value={form.categoria} onChange={(e) => set("categoria", e.target.value)}>
              {CATEGORIAS_PRODUCTO.map((c) => (
                <option key={c} value={c}>
                  {cap(c)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-muted">Precio (RD$)</span>
            <input
              className={field}
              type="number"
              min={0}
              value={form.precio}
              onChange={(e) => set("precio", Number(e.target.value))}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-muted">Stock</span>
            <input
              className={field}
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => set("stock", Number(e.target.value))}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-muted">Alerta de stock bajo</span>
            <input
              className={field}
              type="number"
              min={0}
              value={form.umbral_alerta}
              onChange={(e) => set("umbral_alerta", Number(e.target.value))}
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-muted">Proveedor (opcional)</span>
          <input className={field} value={form.proveedor} onChange={(e) => set("proveedor", e.target.value)} />
        </label>

        {error && (
          <p className="rounded-lg border border-accent bg-accent-soft px-3 py-2.5 text-sm text-ink">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" loading={loading} magnetic={false} className="flex-1">
            {editar ? "Guardar cambios" : "Crear producto"}
          </Button>
          <Button type="button" variant="secondary" magnetic={false} onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>

      {editar && (
        <div className="space-y-3 border-t border-line pt-4">
          <p className="text-sm font-semibold text-ink-muted">Reabastecer</p>
          <div className="flex gap-2">
            <input
              className={`${field} flex-1`}
              type="number"
              min={1}
              placeholder="Cantidad a sumar"
              value={reab}
              onChange={(e) => setReab(e.target.value)}
            />
            <Button type="button" variant="secondary" magnetic={false} onClick={onReabastecer}>
              <PackagePlus size={16} /> Sumar
            </Button>
          </div>
          <button
            type="button"
            onClick={onEliminar}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600"
          >
            <Trash2 size={15} /> Eliminar producto
          </button>
        </div>
      )}
    </div>
  );
}
