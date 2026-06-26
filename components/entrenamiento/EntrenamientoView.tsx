"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Dumbbell } from "lucide-react";
import { Avatar } from "@/components/miembros/Avatar";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { PlanForm } from "./PlanForm";
import { PlanDetalle } from "./PlanDetalle";
import type { PlanPt, EntrenadorOpcion } from "@/lib/entrenamiento/data";

type Miembro = { id: string; nombre: string; fotoUrl: string | null };

export function EntrenamientoView({
  planes,
  entrenadores,
  miembrosSinPlan,
  esAdmin,
}: {
  planes: PlanPt[];
  entrenadores: EntrenadorOpcion[];
  miembrosSinPlan: Miembro[];
  esAdmin: boolean;
}) {
  const router = useRouter();
  const [sel, setSel] = useState<PlanPt | null>(null);
  const [modo, setModo] = useState<"detalle" | "form" | null>(null);

  function abrir(p: PlanPt) {
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
          <h1 className="font-display text-title font-semibold text-ink">Entrenamiento personal</h1>
          <p className="mt-1 text-sm text-ink-muted">{planes.length} planes activos</p>
        </div>
        <Button magnetic={false} onClick={nuevo}>
          <Plus size={16} /> Nuevo plan
        </Button>
      </div>

      {planes.length === 0 ? (
        <div className="mt-12 text-center">
          <Dumbbell size={32} className="mx-auto text-ink-faint" />
          <p className="mt-3 text-sm text-ink-faint">Aún no hay planes de entrenamiento personal.</p>
        </div>
      ) : (
        <StaggerGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {planes.map((p) => {
            const restantes = Math.max(0, p.sesionesIncluidas - p.usadas);
            return (
              <StaggerItem key={p.id}>
                <button
                  type="button"
                  onClick={() => abrir(p)}
                  className="glass shadow-card flex w-full items-center gap-3 rounded-lg p-3 text-left transition-transform hover:-translate-y-0.5"
                >
                  <Avatar nombre={p.miembroNombre} foto={p.miembroFoto} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{p.miembroNombre}</p>
                    <p className="truncate text-xs text-ink-faint">
                      {p.objetivo ?? "Plan personalizado"}
                      {p.entrenadorNombre ? ` · ${p.entrenadorNombre}` : ""}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-bg-2 px-2 py-0.5 text-[11px] text-ink-muted">
                        {restantes} de {p.sesionesIncluidas} incluidas
                      </span>
                      {p.proximas > 0 && (
                        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] text-accent">
                          {p.proximas} próxima{p.proximas === 1 ? "" : "s"}
                        </span>
                      )}
                      {p.adicionales > 0 && (
                        <span className="rounded-full bg-bg-2 px-2 py-0.5 text-[11px] text-ink-muted">
                          {p.adicionales} adicional{p.adicionales === 1 ? "" : "es"}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      )}

      <Sheet
        open={modo !== null}
        onClose={cerrar}
        title={modo === "form" ? (sel ? "Editar plan" : "Nuevo plan") : sel?.miembroNombre ?? "Plan"}
      >
        {modo === "form" && (
          <PlanForm
            plan={sel}
            entrenadores={entrenadores}
            miembrosSinPlan={miembrosSinPlan}
            onClose={cerrar}
            onSaved={guardado}
          />
        )}
        {modo === "detalle" && sel && (
          <PlanDetalle plan={sel} esAdmin={esAdmin} onEditar={() => setModo("form")} onCambio={() => router.refresh()} />
        )}
      </Sheet>
    </div>
  );
}
