"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Search } from "lucide-react";
import { Avatar } from "@/components/miembros/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Sheet } from "@/components/ui/Sheet";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { EmpleadoForm } from "./EmpleadoForm";
import { EmpleadoFicha } from "./EmpleadoFicha";
import { normaliza } from "@/lib/miembros/estado";
import { type Empleado, PUESTOS, PUESTO_LABEL, estadoEmpleado } from "@/lib/empleados/data";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function EmpleadosView({ empleados, esAdmin }: { empleados: Empleado[]; esAdmin: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [puesto, setPuesto] = useState("todos");
  const [sel, setSel] = useState<Empleado | null>(null);
  const [modo, setModo] = useState<"ficha" | "form" | null>(null);

  const filtrados = useMemo(() => {
    const t = normaliza(q.trim());
    return empleados.filter((e) => {
      if (puesto !== "todos" && e.puesto !== puesto) return false;
      if (t && !normaliza(`${e.nombre} ${e.especialidades.join(" ")}`).includes(t)) return false;
      return true;
    });
  }, [empleados, q, puesto]);

  const chips = ["todos", ...PUESTOS];
  const activos = empleados.filter((e) => e.estado === "activo").length;

  function abrirFicha(e: Empleado) {
    setSel(e);
    setModo("ficha");
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
          <h1 className="font-display text-title font-semibold text-ink">Empleados</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {empleados.length} en total · {activos} activos
          </p>
        </div>
        {esAdmin && (
          <Button magnetic={false} onClick={nuevo}>
            <UserPlus size={16} /> Nuevo empleado
          </Button>
        )}
      </div>

      <Input
        id="buscar-emp"
        type="search"
        placeholder="Buscar por nombre o especialidad…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        trailing={<Search size={18} className="mr-1 text-ink-faint" />}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setPuesto(c)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              puesto === c ? "bg-accent text-accent-contrast" : "glass text-ink-muted hover:text-ink"
            }`}
          >
            {c === "todos" ? "Todos" : PUESTO_LABEL[c] ?? cap(c)}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <p className="mt-12 text-center text-sm text-ink-faint">No hay empleados con este filtro.</p>
      ) : (
        <StaggerGroup className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtrados.map((e) => {
            const est = estadoEmpleado(e.estado);
            return (
              <StaggerItem key={e.id}>
                <button
                  type="button"
                  onClick={() => abrirFicha(e)}
                  className="glass shadow-card flex w-full items-center gap-3 rounded-lg p-3 text-left transition-transform hover:-translate-y-0.5"
                >
                  <Avatar nombre={e.nombre} foto={e.fotoUrl} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{e.nombre}</p>
                    <p className="truncate text-xs text-ink-faint">{PUESTO_LABEL[e.puesto] ?? e.puesto}</p>
                    {e.especialidades.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {e.especialidades.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-bg-2 px-2 py-0.5 text-[11px] text-ink-muted"
                          >
                            {cap(s)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${est.badge}`}>
                    {est.label}
                  </span>
                </button>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      )}

      <Sheet
        open={modo !== null}
        onClose={cerrar}
        title={modo === "form" ? (sel ? "Editar empleado" : "Nuevo empleado") : sel?.nombre ?? "Empleado"}
      >
        {modo === "form" && (
          <EmpleadoForm empleado={sel} onClose={cerrar} onSaved={guardado} />
        )}
        {modo === "ficha" && sel && (
          <EmpleadoFicha
            empleado={sel}
            esAdmin={esAdmin}
            onEditar={() => setModo("form")}
            onCambio={() => router.refresh()}
          />
        )}
      </Sheet>
    </div>
  );
}
