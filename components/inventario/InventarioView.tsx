"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PackagePlus, Search } from "lucide-react";
import { Avatar } from "@/components/miembros/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Sheet } from "@/components/ui/Sheet";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { ProductoForm } from "./ProductoForm";
import { stockInfo, CATEGORIAS_PRODUCTO } from "@/lib/inventario/stock";
import { normaliza } from "@/lib/miembros/estado";
import { formatRD } from "@/lib/format";
import type { Producto } from "@/lib/caja/productos";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function InventarioView({ productos }: { productos: Producto[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("todos");
  const [formOpen, setFormOpen] = useState(false);
  const [sel, setSel] = useState<Producto | null>(null);

  const filtrados = useMemo(() => {
    const t = normaliza(q.trim());
    return productos.filter((p) => {
      if (cat !== "todos" && p.categoria !== cat) return false;
      if (t && !normaliza(p.nombre).includes(t)) return false;
      return true;
    });
  }, [productos, q, cat]);

  const chips = ["todos", ...CATEGORIAS_PRODUCTO];
  const bajos = productos.filter((p) => p.stock <= p.umbralAlerta).length;

  function nuevo() {
    setSel(null);
    setFormOpen(true);
  }
  function editar(p: Producto) {
    setSel(p);
    setFormOpen(true);
  }
  function guardado() {
    setFormOpen(false);
    setSel(null);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-title font-semibold text-ink">Inventario</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {productos.length} productos{bajos > 0 ? ` · ${bajos} con stock bajo` : ""}
          </p>
        </div>
        <Button magnetic={false} onClick={nuevo}>
          <PackagePlus size={16} /> Nuevo producto
        </Button>
      </div>

      <Input
        id="buscar-prod"
        type="search"
        placeholder="Buscar producto…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        trailing={<Search size={18} className="mr-1 text-ink-faint" />}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((c) => (
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

      {filtrados.length === 0 ? (
        <p className="mt-12 text-center text-sm text-ink-faint">No hay productos con este filtro.</p>
      ) : (
        <StaggerGroup className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtrados.map((p) => {
            const info = stockInfo(p.stock, p.umbralAlerta);
            return (
              <StaggerItem key={p.id}>
                <button
                  type="button"
                  onClick={() => editar(p)}
                  className="glass shadow-card flex w-full items-center gap-3 rounded-lg p-3 text-left transition-transform hover:-translate-y-0.5"
                >
                  <Avatar nombre={p.nombre} foto={p.fotoUrl} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{p.nombre}</p>
                    <p className="truncate text-xs text-ink-faint">
                      {cap(p.categoria)} · {formatRD(p.precio)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="tabular-nums font-display text-lg font-bold text-ink">{p.stock}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${info.badge}`}>
                      {info.label}
                    </span>
                  </div>
                </button>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      )}

      <Sheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={sel ? "Editar producto" : "Nuevo producto"}
      >
        {formOpen && <ProductoForm producto={sel} onClose={() => setFormOpen(false)} onSaved={guardado} />}
      </Sheet>
    </div>
  );
}
