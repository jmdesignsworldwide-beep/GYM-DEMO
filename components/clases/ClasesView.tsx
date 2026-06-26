"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Clock, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { ClaseForm } from "./ClaseForm";
import { ClaseDetalle } from "./ClaseDetalle";
import { type Clase, type InstructorOpcion, DISCIPLINAS, DIAS } from "@/lib/clases/data";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Acento sutil por disciplina (solo el puntito/etiqueta).
const DISC_DOT: Record<string, string> = {
  spinning: "bg-sky-500",
  zumba: "bg-pink-500",
  yoga: "bg-violet-500",
  funcional: "bg-emerald-500",
  crossfit: "bg-orange-500",
  baile: "bg-rose-500",
};

function cupoInfo(c: Clase): { texto: string; clase: string } {
  const libres = c.capacidad - c.inscritos;
  if (libres <= 0) {
    return {
      texto: c.espera > 0 ? `Llena · ${c.espera} en espera` : "Llena",
      clase: "bg-red-500/10 text-red-600 dark:text-red-400",
    };
  }
  if (libres <= 3) {
    return {
      texto: `${libres} ${libres === 1 ? "cupo" : "cupos"}`,
      clase: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    };
  }
  return {
    texto: `${libres} cupos`,
    clase: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  };
}

export function ClasesView({
  clases,
  instructores,
  esAdmin,
}: {
  clases: Clase[];
  instructores: InstructorOpcion[];
  esAdmin: boolean;
}) {
  const router = useRouter();
  const [disc, setDisc] = useState("todas");
  const [sel, setSel] = useState<Clase | null>(null);
  const [modo, setModo] = useState<"detalle" | "form" | null>(null);

  const filtradas = useMemo(
    () => (disc === "todas" ? clases : clases.filter((c) => c.disciplina === disc)),
    [clases, disc],
  );

  // Agrupa por día (solo días con clases).
  const porDia = useMemo(() => {
    const m = new Map<number, Clase[]>();
    filtradas.forEach((c) => {
      const arr = m.get(c.diaSemana) ?? [];
      arr.push(c);
      m.set(c.diaSemana, arr);
    });
    return Array.from(m.entries()).sort((a, b) => {
      // Lunes(1)…Sábado(6), Domingo(0) al final
      const norm = (d: number) => (d === 0 ? 7 : d);
      return norm(a[0]) - norm(b[0]);
    });
  }, [filtradas]);

  const chips = ["todas", ...DISCIPLINAS];

  function abrir(c: Clase) {
    setSel(c);
    setModo("detalle");
  }
  function nueva() {
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
          <h1 className="font-display text-title font-semibold text-ink">Clases</h1>
          <p className="mt-1 text-sm text-ink-muted">{clases.length} clases en la semana</p>
        </div>
        {esAdmin && (
          <Button magnetic={false} onClick={nueva}>
            <Plus size={16} /> Nueva clase
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setDisc(c)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              disc === c ? "bg-accent text-accent-contrast" : "glass text-ink-muted hover:text-ink"
            }`}
          >
            {c === "todas" ? "Todas" : cap(c)}
          </button>
        ))}
      </div>

      {porDia.length === 0 ? (
        <p className="mt-12 text-center text-sm text-ink-faint">No hay clases con este filtro.</p>
      ) : (
        <div className="mt-5 space-y-6">
          {porDia.map(([dia, lista]) => (
            <div key={dia}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-faint">
                {DIAS[dia]}
              </h2>
              <StaggerGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {lista.map((c) => {
                  const cupo = cupoInfo(c);
                  return (
                    <StaggerItem key={c.id}>
                      <button
                        type="button"
                        onClick={() => abrir(c)}
                        className="glass shadow-card flex w-full flex-col gap-2 rounded-lg p-4 text-left transition-transform hover:-translate-y-0.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${DISC_DOT[c.disciplina] ?? "bg-accent"}`} />
                          <p className="font-display font-semibold text-ink">{cap(c.disciplina)}</p>
                          <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${cupo.clase}`}>
                            {cupo.texto}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
                          <span className="inline-flex items-center gap-1">
                            <Clock size={13} /> {c.hora} · {c.duracionMin} min
                          </span>
                          {c.sala && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={13} /> {c.sala}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <Users size={13} /> {c.inscritos}/{c.capacidad}
                          </span>
                        </div>
                        {c.instructorNombre && (
                          <p className="text-xs text-ink-faint">con {c.instructorNombre}</p>
                        )}
                      </button>
                    </StaggerItem>
                  );
                })}
              </StaggerGroup>
            </div>
          ))}
        </div>
      )}

      <Sheet
        open={modo !== null}
        onClose={cerrar}
        title={modo === "form" ? (sel ? "Editar clase" : "Nueva clase") : sel ? cap(sel.disciplina) : "Clase"}
      >
        {modo === "form" && (
          <ClaseForm clase={sel} instructores={instructores} onClose={cerrar} onSaved={guardado} />
        )}
        {modo === "detalle" && sel && (
          <ClaseDetalle clase={sel} esAdmin={esAdmin} onEditar={() => setModo("form")} onCambio={() => router.refresh()} />
        )}
      </Sheet>
    </div>
  );
}
