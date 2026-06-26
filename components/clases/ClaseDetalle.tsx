"use client";

import { useEffect, useState } from "react";
import { Pencil, Clock, MapPin, UserPlus, X, Check, Search } from "lucide-react";
import { Avatar } from "@/components/miembros/Avatar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/motion/Skeleton";
import { normaliza } from "@/lib/miembros/estado";
import {
  getInscritos,
  getMiembrosDisponibles,
  inscribirMiembro,
  quitarInscripcion,
  registrarAsistencia,
} from "@/app/(app)/clases/actions";
import { type Clase, DIAS } from "@/lib/clases/data";
import type { MiembroInscrito } from "@/lib/clases/data";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type Disponible = { id: string; nombre: string; fotoUrl: string | null };

export function ClaseDetalle({
  clase,
  esAdmin,
  onEditar,
  onCambio,
}: {
  clase: Clase;
  esAdmin: boolean;
  onEditar: () => void;
  onCambio: () => void;
}) {
  const [inscritos, setInscritos] = useState<MiembroInscrito[] | null>(null);
  const [picker, setPicker] = useState(false);
  const [disponibles, setDisponibles] = useState<Disponible[] | null>(null);
  const [q, setQ] = useState("");
  const [asistio, setAsistio] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  async function cargar() {
    const data = await getInscritos(clase.id);
    setInscritos(data);
  }
  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clase.id]);

  async function abrirPicker() {
    setPicker(true);
    setDisponibles(null);
    setQ("");
    const d = await getMiembrosDisponibles(clase.id);
    setDisponibles(d);
  }

  async function inscribir(m: Disponible) {
    if (busy) return;
    setBusy(true);
    const res = await inscribirMiembro(clase.id, m.id);
    setBusy(false);
    if (res.ok) {
      setDisponibles((prev) => prev?.filter((x) => x.id !== m.id) ?? null);
      cargar();
      onCambio();
    }
  }

  async function quitar(i: MiembroInscrito) {
    const res = await quitarInscripcion(i.inscripcionId);
    if (res.ok) {
      cargar();
      onCambio();
    }
  }

  async function marcarAsistencia(i: MiembroInscrito) {
    const res = await registrarAsistencia(clase.id, i.miembroId);
    if (res.ok) {
      setAsistio((prev) => new Set(prev).add(i.miembroId));
      onCambio();
    }
  }

  const dispFiltrados = (disponibles ?? []).filter((m) =>
    normaliza(m.nombre).includes(normaliza(q.trim())),
  );

  const lista = inscritos ?? [];
  const principales = lista.filter((i) => i.estado === "inscrito");
  const espera = lista.filter((i) => i.estado === "espera");

  return (
    <div className="space-y-5">
      {/* Info */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-ink">{cap(clase.disciplina)}</p>
          <p className="text-sm text-ink-muted">{DIAS[clase.diaSemana]}</p>
          {clase.instructorNombre && (
            <p className="mt-0.5 text-sm text-ink-faint">con {clase.instructorNombre}</p>
          )}
        </div>
        {esAdmin && (
          <Button variant="secondary" magnetic={false} onClick={onEditar}>
            <Pencil size={15} /> Editar
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-lg bg-bg-2 p-3 text-sm text-ink">
        <span className="inline-flex items-center gap-1.5">
          <Clock size={14} className="text-ink-faint" /> {clase.hora} · {clase.duracionMin} min
        </span>
        {clase.sala && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} className="text-ink-faint" /> {clase.sala}
          </span>
        )}
      </div>

      {/* Cupos */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink-muted">
          Inscritos {principales.length}/{clase.capacidad}
          {espera.length > 0 && <span className="text-ink-faint"> · {espera.length} en espera</span>}
        </p>
        <Button magnetic={false} onClick={abrirPicker}>
          <UserPlus size={15} /> Inscribir
        </Button>
      </div>

      {/* Lista de inscritos */}
      {inscritos === null ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : principales.length === 0 ? (
        <p className="text-sm text-ink-faint">Aún no hay inscritos. Toca “Inscribir”.</p>
      ) : (
        <div className="space-y-1">
          {principales.map((i) => {
            const fue = asistio.has(i.miembroId);
            return (
              <div key={i.inscripcionId} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-bg-2">
                <Avatar nombre={i.nombre} foto={i.fotoUrl} size={36} />
                <span className="min-w-0 flex-1 truncate text-sm text-ink">{i.nombre}</span>
                <button
                  type="button"
                  onClick={() => marcarAsistencia(i)}
                  disabled={fue}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    fue
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "glass text-ink-muted hover:text-ink"
                  }`}
                >
                  <Check size={13} /> {fue ? "Asistió" : "Asistencia"}
                </button>
                <button
                  type="button"
                  onClick={() => quitar(i)}
                  aria-label="Quitar"
                  className="grid h-7 w-7 place-items-center rounded-full text-ink-faint hover:bg-bg-3 hover:text-red-500"
                >
                  <X size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Lista de espera */}
      {espera.length > 0 && (
        <div>
          <p className="mb-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400">
            Lista de espera ({espera.length})
          </p>
          <div className="space-y-1">
            {espera.map((i, idx) => (
              <div key={i.inscripcionId} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-bg-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-500/15 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  {idx + 1}
                </span>
                <Avatar nombre={i.nombre} foto={i.fotoUrl} size={32} />
                <span className="min-w-0 flex-1 truncate text-sm text-ink">{i.nombre}</span>
                <button
                  type="button"
                  onClick={() => quitar(i)}
                  aria-label="Quitar"
                  className="grid h-7 w-7 place-items-center rounded-full text-ink-faint hover:bg-bg-3 hover:text-red-500"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Picker de miembros */}
      <Modal open={picker} onClose={() => setPicker(false)} title="Inscribir miembro">
        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              autoFocus
              className="h-11 w-full rounded-lg border bg-bg-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
              placeholder="Buscar miembro…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          {principales.length >= clase.capacidad && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-ink">
              La clase está llena. Los nuevos entran a la lista de espera.
            </p>
          )}
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {disponibles === null ? (
              <>
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
              </>
            ) : dispFiltrados.length === 0 ? (
              <p className="py-4 text-center text-sm text-ink-faint">Sin miembros disponibles.</p>
            ) : (
              dispFiltrados.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  disabled={busy}
                  onClick={() => inscribir(m)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-bg-2 disabled:opacity-50"
                >
                  <Avatar nombre={m.nombre} foto={m.fotoUrl} size={36} />
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">{m.nombre}</span>
                  <UserPlus size={16} className="text-accent" />
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
