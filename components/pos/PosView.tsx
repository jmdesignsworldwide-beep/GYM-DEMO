"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, ShoppingCart, CheckCircle2, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { METODOS } from "@/lib/miembros/planes";
import { formatRD } from "@/lib/format";
import { vender } from "@/app/(app)/pos/actions";
import type { Producto } from "@/lib/caja/productos";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function PosView({ productos }: { productos: Producto[] }) {
  const router = useRouter();
  const [cat, setCat] = useState("todos");
  const [carrito, setCarrito] = useState<Record<string, number>>({});
  const [metodo, setMetodo] = useState("efectivo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hecho, setHecho] = useState<{ total: number; items: { nombre: string; cant: number }[] } | null>(null);

  const categorias = useMemo(
    () => ["todos", ...Array.from(new Set(productos.map((p) => p.categoria)))],
    [productos],
  );
  const visibles = cat === "todos" ? productos : productos.filter((p) => p.categoria === cat);
  const porId = useMemo(() => new Map(productos.map((p) => [p.id, p])), [productos]);

  const lineas = Object.entries(carrito).filter(([, c]) => c > 0);
  const total = lineas.reduce((s, [id, c]) => s + (porId.get(id)?.precio ?? 0) * c, 0);

  function add(id: string) {
    const prod = porId.get(id);
    if (!prod) return;
    setCarrito((c) => {
      const actual = c[id] ?? 0;
      if (actual >= prod.stock) return c; // no exceder el stock real
      return { ...c, [id]: actual + 1 };
    });
  }
  function quitar(id: string) {
    setCarrito((c) => {
      const n = (c[id] ?? 0) - 1;
      const next = { ...c };
      if (n <= 0) delete next[id];
      else next[id] = n;
      return next;
    });
  }

  async function cobrar() {
    if (lineas.length === 0 || loading) return;
    setLoading(true);
    setError(null);
    const items = lineas.map(([productoId, cantidad]) => ({ productoId, cantidad }));
    const res = await vender({ items, metodo });
    setLoading(false);
    if (res.ok) {
      setHecho({
        total: res.total ?? total,
        items: lineas.map(([id, c]) => ({ nombre: porId.get(id)?.nombre ?? "Producto", cant: c })),
      });
      setCarrito({});
      router.refresh();
    } else {
      setError(res.error ?? "No se pudo cobrar.");
    }
  }

  return (
    <div>
      <h1 className="mb-5 font-display text-title font-semibold text-ink">Punto de venta</h1>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Catálogo */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex flex-wrap gap-2">
            {categorias.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  cat === c ? "bg-accent text-accent-contrast" : "glass text-ink-muted hover:text-ink"
                }`}
              >
                {cap(c)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {visibles.map((p) => {
              const agotado = p.stock <= 0;
              const bajo = !agotado && p.stock <= p.umbralAlerta;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => add(p.id)}
                  disabled={agotado}
                  className="glass shadow-card flex flex-col rounded-lg p-4 text-left transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-50"
                >
                  <span className="text-sm font-medium text-ink">{p.nombre}</span>
                  <span className="mt-2 tabular-nums font-display text-lg font-bold text-accent">
                    {formatRD(p.precio)}
                  </span>
                  <span
                    className={`mt-1 text-xs ${
                      agotado
                        ? "font-medium text-red-500"
                        : bajo
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-ink-faint"
                    }`}
                  >
                    {agotado
                      ? "Agotado"
                      : carrito[p.id] > 0
                        ? `En carrito: ${carrito[p.id]} · stock ${p.stock}`
                        : `Stock: ${p.stock}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Carrito */}
        <Card glowOnHover={false} className="h-fit lg:sticky lg:top-20">
          <div className="mb-3 flex items-center gap-2">
            <ShoppingCart size={18} className="text-accent" />
            <h2 className="font-display text-sm font-semibold text-ink">Carrito</h2>
          </div>

          {lineas.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-faint">Toca productos para agregarlos.</p>
          ) : (
            <div className="space-y-2">
              {lineas.map(([id, c]) => {
                const p = porId.get(id)!;
                return (
                  <div key={id} className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">{p.nombre}</p>
                      <p className="text-xs text-ink-faint">{formatRD(p.precio * c)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => quitar(id)}
                      className="grid h-7 w-7 place-items-center rounded-md bg-bg-3 text-ink hover:bg-bg-2"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-5 text-center text-sm tabular-nums text-ink">{c}</span>
                    <button
                      type="button"
                      onClick={() => add(id)}
                      className="grid h-7 w-7 place-items-center rounded-md bg-bg-3 text-ink hover:bg-bg-2"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                );
              })}

              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <span className="text-sm text-ink-muted">Total</span>
                <span className="font-display text-xl font-bold text-ink">{formatRD(total)}</span>
              </div>

              <select
                className="h-11 w-full rounded-lg border bg-bg-2 px-3 text-sm text-ink focus:border-accent focus:outline-none"
                value={metodo}
                onChange={(e) => setMetodo(e.target.value)}
              >
                {METODOS.map((m) => (
                  <option key={m} value={m}>
                    {cap(m)}
                  </option>
                ))}
              </select>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button loading={loading} magnetic={false} className="w-full" onClick={cobrar}>
                Cobrar {formatRD(total)}
              </Button>
              <button
                type="button"
                onClick={() => setCarrito({})}
                className="flex w-full items-center justify-center gap-1 text-xs text-ink-faint hover:text-ink"
              >
                <Trash2 size={13} /> Vaciar carrito
              </button>
            </div>
          )}
        </Card>
      </div>

      {/* Recibo */}
      <Modal open={!!hecho} onClose={() => setHecho(null)} title="Venta registrada">
        {hecho && (
          <div className="space-y-4 text-center">
            <CheckCircle2 size={44} className="mx-auto text-emerald-500" />
            <p className="font-display text-3xl font-bold text-gradient">{formatRD(hecho.total)}</p>
            <ul className="rounded-lg bg-bg-2 p-3 text-left text-sm">
              {hecho.items.map((it, i) => (
                <li key={i} className="flex justify-between py-0.5 text-ink">
                  <span>
                    {it.cant} × {it.nombre}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-ink-faint">
              Documento de ejemplo generado para demostración.
              <br />
              NCF simulado para demostración. No certificado ante la DGII.
            </p>
            <Button magnetic={false} className="w-full" onClick={() => setHecho(null)}>
              Nueva venta
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
