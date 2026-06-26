"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, X, UtensilsCrossed, History } from "lucide-react";
import { Avatar } from "@/components/miembros/Avatar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/motion/Skeleton";
import {
  getComidas,
  getHistorialPlanes,
  agregarComida,
  eliminarComida,
} from "@/app/(app)/nutricion/actions";
import { type PlanNutricion, type Comida, objetivoLabel, MOMENTOS } from "@/lib/nutricion/data";
import { formatFechaCorta } from "@/lib/format";

const field =
  "h-11 w-full rounded-lg border bg-bg-2 px-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none";
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type HistItem = { id: string; objetivo: string; calorias: number; activo: boolean; fecha: string };

export function PlanNutricionDetalle({
  plan,
  esAdmin,
  onEditar,
  onCambio,
}: {
  plan: PlanNutricion;
  esAdmin: boolean;
  onEditar: () => void;
  onCambio: () => void;
}) {
  const [comidas, setComidas] = useState<Comida[] | null>(null);
  const [historial, setHistorial] = useState<HistItem[] | null>(null);

  const [momento, setMomento] = useState<string>(MOMENTOS[0]);
  const [desc, setDesc] = useState("");
  const [cal, setCal] = useState("");
  const [busy, setBusy] = useState(false);

  async function cargar() {
    const [c, h] = await Promise.all([getComidas(plan.id), getHistorialPlanes(plan.miembroId)]);
    setComidas(c);
    setHistorial(h);
  }
  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.id]);

  async function agregar() {
    if (busy || !desc.trim()) return;
    setBusy(true);
    const res = await agregarComida({
      planId: plan.id,
      momento,
      descripcion: desc,
      calorias: cal.trim() === "" ? null : Number(cal),
    });
    setBusy(false);
    if (res.ok) {
      setDesc("");
      setCal("");
      cargar();
      onCambio();
    }
  }

  async function quitar(id: string) {
    const res = await eliminarComida(id);
    if (res.ok) {
      cargar();
      onCambio();
    }
  }

  const totalComidas = (comidas ?? []).reduce((a, c) => a + (c.calorias ?? 0), 0);

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <Avatar nombre={plan.miembroNombre} foto={plan.miembroFoto} size={56} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-semibold text-ink">{plan.miembroNombre}</p>
          <p className="text-sm text-ink-muted">{objetivoLabel(plan.objetivo)}</p>
        </div>
        {esAdmin && (
          <Button variant="secondary" magnetic={false} onClick={onEditar}>
            <Pencil size={15} /> Editar
          </Button>
        )}
      </div>

      {/* Macros */}
      <div className="rounded-lg border border-line p-4">
        <div className="mb-3 text-center">
          <p className="text-gradient font-display text-3xl font-bold">{plan.calorias}</p>
          <p className="text-xs text-ink-faint">kcal objetivo por día</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-bg-2 p-2">
            <p className="font-display text-lg font-bold text-ink">{plan.proteina}g</p>
            <p className="text-[11px] text-ink-faint">Proteína</p>
          </div>
          <div className="rounded-lg bg-bg-2 p-2">
            <p className="font-display text-lg font-bold text-ink">{plan.carbos}g</p>
            <p className="text-[11px] text-ink-faint">Carbos</p>
          </div>
          <div className="rounded-lg bg-bg-2 p-2">
            <p className="font-display text-lg font-bold text-ink">{plan.grasa}g</p>
            <p className="text-[11px] text-ink-faint">Grasa</p>
          </div>
        </div>
      </div>

      {plan.notas && <p className="text-sm text-ink-muted">{plan.notas}</p>}

      {/* Comidas */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
            <UtensilsCrossed size={15} /> Comidas del plan
          </p>
          {totalComidas > 0 && <span className="text-xs text-ink-faint">{totalComidas} kcal sumadas</span>}
        </div>
        {comidas === null ? (
          <Skeleton className="h-16 w-full" />
        ) : comidas.length === 0 ? (
          <p className="text-sm text-ink-faint">Aún no hay comidas. Agrega la primera abajo.</p>
        ) : (
          <div className="space-y-1">
            {comidas.map((c) => (
              <div key={c.id} className="flex items-start gap-2 rounded-lg bg-bg-2 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-accent">{cap(c.momento)}</p>
                  <p className="text-sm text-ink">{c.descripcion}</p>
                </div>
                {c.calorias != null && (
                  <span className="shrink-0 tabular-nums text-xs text-ink-muted">{c.calorias} kcal</span>
                )}
                <button
                  type="button"
                  onClick={() => quitar(c.id)}
                  aria-label="Quitar"
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-ink-faint hover:bg-bg-3 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Agregar comida */}
        <div className="mt-3 space-y-2 rounded-lg border border-line p-3">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
            <Plus size={14} /> Agregar comida
          </p>
          <div className="grid grid-cols-2 gap-2">
            <select className={field} value={momento} onChange={(e) => setMomento(e.target.value)}>
              {MOMENTOS.map((m) => (
                <option key={m} value={m}>
                  {cap(m)}
                </option>
              ))}
            </select>
            <input
              className={field}
              type="number"
              min={0}
              placeholder="kcal (opcional)"
              value={cal}
              onChange={(e) => setCal(e.target.value)}
            />
          </div>
          <input
            className={field}
            placeholder="Ej. Pechuga con arroz y ensalada"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <Button magnetic={false} loading={busy} variant="secondary" className="w-full" onClick={agregar}>
            Agregar comida
          </Button>
        </div>
      </div>

      {/* Historial de planes */}
      {historial && historial.length > 1 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
            <History size={15} /> Historial de planes
          </p>
          <div className="space-y-1">
            {historial.map((h) => (
              <div key={h.id} className="flex items-center justify-between rounded-lg bg-bg-2 px-3 py-2 text-sm">
                <span className="text-ink">
                  {objetivoLabel(h.objetivo)}
                  <span className="ml-1 text-xs text-ink-faint">· {formatFechaCorta(h.fecha.slice(0, 10))}</span>
                </span>
                <span className="tabular-nums text-ink-muted">
                  {h.calorias} kcal{h.activo ? " · activo" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
