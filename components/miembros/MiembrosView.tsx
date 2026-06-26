"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Sheet } from "@/components/ui/Sheet";
import { Modal } from "@/components/ui/Modal";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { MiembroRow } from "./MiembroRow";
import { MiembroFicha } from "./MiembroFicha";
import { MiembroForm } from "./MiembroForm";
import { ESTADOS, type EstadoKey, normaliza, estadoEfectivo } from "@/lib/miembros/estado";
import type { Miembro } from "@/lib/miembros/data";

type Filtro = "todos" | EstadoKey;

export function MiembrosView({ miembros }: { miembros: Miembro[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [seleccionado, setSeleccionado] = useState<Miembro | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMiembro, setFormMiembro] = useState<Miembro | null>(null);
  const [proximamente, setProximamente] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    const term = normaliza(q.trim());
    return miembros.filter((m) => {
      if (filtro !== "todos" && estadoEfectivo(m.estado, m.fecha_vencimiento) !== filtro) return false;
      if (!term) return true;
      return (
        normaliza(m.nombre).includes(term) ||
        m.cedula.toLowerCase().includes(term) ||
        m.telefono.toLowerCase().includes(term)
      );
    });
  }, [miembros, q, filtro]);

  const chips: { key: Filtro; label: string }[] = [
    { key: "todos", label: "Todos" },
    ...ESTADOS.map((e) => ({ key: e.key as Filtro, label: e.label })),
  ];

  function abrirNuevo() {
    setFormMiembro(null);
    setFormOpen(true);
  }
  function abrirEditar() {
    setFormMiembro(seleccionado);
    setSeleccionado(null);
    setFormOpen(true);
  }
  function guardado() {
    setFormOpen(false);
    setSeleccionado(null);
    router.refresh();
  }

  return (
    <div>
      {/* Encabezado */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-title font-semibold text-ink">Miembros</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {filtrados.length} {filtrados.length === 1 ? "miembro" : "miembros"}
          </p>
        </div>
        <Button magnetic={false} onClick={abrirNuevo}>
          <UserPlus size={16} /> Nuevo miembro
        </Button>
      </div>

      {/* Buscador */}
      <Input
        id="buscar"
        type="search"
        placeholder="Buscar por nombre, cédula o teléfono…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        trailing={<Search size={18} className="mr-1 text-ink-faint" />}
      />

      {/* Filtros */}
      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((c) => {
          const active = filtro === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setFiltro(c.key)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active ? "bg-accent text-accent-contrast" : "glass text-ink-muted hover:text-ink"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <p className="mt-12 text-center text-sm text-ink-faint">
          Aún no hay miembros con este filtro.
        </p>
      ) : (
        <StaggerGroup className="mt-4 space-y-1">
          {filtrados.map((m) => (
            <StaggerItem key={m.id}>
              <MiembroRow miembro={m} onClick={() => setSeleccionado(m)} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}

      {/* Ficha en panel lateral */}
      <Sheet open={!!seleccionado} onClose={() => setSeleccionado(null)} title="Ficha del miembro">
        {seleccionado && (
          <MiembroFicha
            miembro={seleccionado}
            onEditar={abrirEditar}
            onRenovar={() => setProximamente("Renovar membresía llega en la siguiente pieza.")}
          />
        )}
      </Sheet>

      {/* Crear / editar */}
      <Sheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={formMiembro ? "Editar miembro" : "Nuevo miembro"}
      >
        {formOpen && (
          <MiembroForm
            miembro={formMiembro}
            onClose={() => setFormOpen(false)}
            onSaved={guardado}
          />
        )}
      </Sheet>

      {/* Placeholder de ganchos (Tanda 4) */}
      <Modal open={!!proximamente} onClose={() => setProximamente(null)} title="Próximamente">
        <p className="text-sm text-ink">{proximamente}</p>
      </Modal>
    </div>
  );
}
