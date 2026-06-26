"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Wrench } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Sheet } from "@/components/ui/Sheet";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { EquipoForm } from "./EquipoForm";
import { estadoEquipoInfo, mantenimientoInfo, CATEGORIAS_EQUIPO, type Equipo } from "@/lib/inventario/equipos";
import { hoyISO, normaliza } from "@/lib/miembros/estado";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function EquiposView({ equipos }: { equipos: Equipo[] }) {
  const router = useRouter();
  const hoy = hoyISO();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("todos");
  const [formOpen, setFormOpen] = useState(false);
  const [sel, setSel] = useState<Equipo | null>(null);

  const filtrados = useMemo(() => {
    const t = normaliza(q.trim());
    return equipos.filter((e) => {
      if (cat !== "todos" && e.categoria !== cat) return false;
      if (t && !normaliza(e.nombre).includes(t)) return false;
      return true;
    });
  }, [equipos, q, cat]);

  const porMantener = equipos.filter((e) => {
    const info = mantenimientoInfo(e.proximoMantenimiento, hoy);
    return info?.urgente;
  }).length;

  const chips = ["todos", ...CATEGORIAS_EQUIPO];

  function guardado() {
    setFormOpen(false);
    setSel(null);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-title font-semibold text-ink">Equipos</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {equipos.length} equipos{porMantener > 0 ? ` · ${porMantener} por mantener` : ""}
          </p>
        </div>
        <Button magnetic={false} onClick={() => { setSel(null); setFormOpen(true); }}>
          <Plus size={16} /> Nuevo equipo
        </Button>
      </div>

      <Input
        id="buscar-eq"
        type="search"
        placeholder="Buscar equipo…"
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
        <p className="mt-12 text-center text-sm text-ink-faint">No hay equipos con este filtro.</p>
      ) : (
        <StaggerGroup className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtrados.map((e) => {
            const est = estadoEquipoInfo(e.estado);
            const mant = mantenimientoInfo(e.proximoMantenimiento, hoy);
            return (
              <StaggerItem key={e.id}>
                <button
                  type="button"
                  onClick={() => { setSel(e); setFormOpen(true); }}
                  className="glass shadow-card flex w-full flex-col gap-2 rounded-lg p-4 text-left transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium text-ink">{e.nombre}</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${est.badge}`}>
                      {est.label}
                    </span>
                  </div>
                  <span className="text-xs text-ink-faint">{cap(e.categoria)}</span>
                  {mant && (
                    <span className={`flex items-center gap-1 text-xs ${mant.clase}`}>
                      {mant.urgente && <Wrench size={12} />}
                      {mant.texto}
                    </span>
                  )}
                </button>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      )}

      <Sheet open={formOpen} onClose={() => setFormOpen(false)} title={sel ? "Equipo" : "Nuevo equipo"}>
        {formOpen && <EquipoForm equipo={sel} onClose={() => setFormOpen(false)} onSaved={guardado} />}
      </Sheet>
    </div>
  );
}
