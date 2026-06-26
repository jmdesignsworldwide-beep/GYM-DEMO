"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Salad } from "lucide-react";
import { Avatar } from "@/components/miembros/Avatar";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { PlanNutricionForm } from "./PlanNutricionForm";
import { PlanNutricionDetalle } from "./PlanNutricionDetalle";
import { type PlanNutricion, objetivoLabel } from "@/lib/nutricion/data";

type Miembro = { id: string; nombre: string; fotoUrl: string | null };

export function NutricionView({
  planes,
  miembros,
  esAdmin,
}: {
  planes: PlanNutricion[];
  miembros: Miembro[];
  esAdmin: boolean;
}) {
  const router = useRouter();
  const [sel, setSel] = useState<PlanNutricion | null>(null);
  const [modo, setModo] = useState<"detalle" | "form" | null>(null);

  function abrir(p: PlanNutricion) {
    setSel(p);
    setModo("detalle");
  }
  function nuevo() {
    setSel(null);
    setModo("form");
  }
  function cerrar() {
    setModo(null);
    setSel(null);
  }
  function guardado() {
    cerrar();
    router.refresh();
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-title font-semibold text-ink">Nutrición</h1>
          <p className="mt-1 text-sm text-ink-muted">{planes.length} planes activos</p>
        </div>
        <Button magnetic={false} onClick={nuevo}>
          <Plus size={16} /> Nuevo plan
        </Button>
      </div>

      {planes.length === 0 ? (
        <div className="mt-12 text-center">
          <Salad size={32} className="mx-auto text-ink-faint" />
          <p className="mt-3 text-sm text-ink-faint">Aún no hay planes nutricionales.</p>
        </div>
      ) : (
        <StaggerGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {planes.map((p) => (
            <StaggerItem key={p.id}>
              <button
                type="button"
                onClick={() => abrir(p)}
                className="glass shadow-card flex w-full items-center gap-3 rounded-lg p-3 text-left transition-transform hover:-translate-y-0.5"
              >
                <Avatar nombre={p.miembroNombre} foto={p.miembroFoto} size={48} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{p.miembroNombre}</p>
                  <p className="truncate text-xs text-ink-faint">{objetivoLabel(p.objetivo)}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
                      {p.calorias} kcal
                    </span>
                    <span className="rounded-full bg-bg-2 px-2 py-0.5 text-[11px] text-ink-muted">
                      {p.comidas} comida{p.comidas === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              </button>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}

      <Sheet
        open={modo !== null}
        onClose={cerrar}
        title={modo === "form" ? (sel ? "Editar plan" : "Nuevo plan nutricional") : sel?.miembroNombre ?? "Plan"}
      >
        {modo === "form" && (
          <PlanNutricionForm plan={sel} miembros={miembros} onClose={cerrar} onSaved={guardado} />
        )}
        {modo === "detalle" && sel && (
          <PlanNutricionDetalle plan={sel} esAdmin={esAdmin} onEditar={() => setModo("form")} onCambio={() => router.refresh()} />
        )}
      </Sheet>
    </div>
  );
}
