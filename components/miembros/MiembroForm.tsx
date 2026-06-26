"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "./Avatar";
import { PLANES, precioDePlan } from "@/lib/miembros/planes";
import { guardarMiembro } from "@/app/(app)/miembros/actions";
import type { Miembro } from "@/lib/miembros/data";

const field =
  "h-12 w-full rounded-lg border bg-bg-2 px-4 text-ink placeholder:text-ink-faint transition-colors focus:border-accent focus:outline-none";

const ESTADO_OPCIONES = [
  { v: "activo", t: "Activo" },
  { v: "vencido", t: "Vencido" },
  { v: "congelado", t: "Congelado" },
  { v: "cancelado", t: "Cancelado" },
];

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}
function masUnMes() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-muted">{label}</span>
      {children}
    </label>
  );
}

export function MiembroForm({
  miembro,
  onClose,
  onSaved,
}: {
  miembro: Miembro | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editar = !!miembro;
  const [form, setForm] = useState({
    nombre: miembro?.nombre ?? "",
    cedula: miembro?.cedula ?? "",
    telefono: miembro?.telefono ?? "",
    email: miembro?.email ?? "",
    direccion: miembro?.direccion ?? "",
    plan: miembro?.plan ?? PLANES[0].nombre,
    precio_mensual: miembro?.precio_mensual ?? PLANES[0].precio,
    estado: miembro?.estado ?? "activo",
    fecha_inicio: miembro?.fecha_inicio ?? hoyISO(),
    fecha_vencimiento: miembro?.fecha_vencimiento ?? masUnMes(),
    fecha_reanudacion: miembro?.fecha_reanudacion ?? "",
    contacto_emergencia_nombre: miembro?.contacto_emergencia_nombre ?? "",
    contacto_emergencia_telefono: miembro?.contacto_emergencia_telefono ?? "",
    notas: miembro?.notas ?? "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(miembro?.foto_url ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onPlan(plan: string) {
    setForm((f) => ({ ...f, plan, precio_mensual: precioDePlan(plan) || f.precio_mensual }));
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    const fd = new FormData();
    if (miembro?.id) fd.set("id", miembro.id);
    Object.entries(form).forEach(([k, v]) => fd.set(k, String(v)));
    if (file) fd.set("foto", file);

    const res = await guardarMiembro(fd);
    if (res.ok) {
      onSaved();
    } else {
      setError(res.error ?? "No se pudo guardar.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Foto */}
      <div className="flex items-center gap-4">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Foto" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <Avatar nombre={form.nombre || "Nuevo"} size={80} />
        )}
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full bg-bg-3 px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-bg-2"
          >
            <Camera size={16} /> {preview ? "Cambiar foto" : "Subir foto"}
          </button>
          <p className="mt-1 text-xs text-ink-faint">JPG o PNG, máx. 5 MB.</p>
        </div>
      </div>

      <Campo label="Nombre completo">
        <input
          className={field}
          value={form.nombre}
          onChange={(e) => set("nombre", e.target.value)}
          placeholder="Ej. Yokasta Peña"
        />
      </Campo>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Cédula">
          <input
            className={field}
            value={form.cedula}
            onChange={(e) => set("cedula", e.target.value)}
            placeholder="000-0000000-0"
            inputMode="numeric"
          />
        </Campo>
        <Campo label="Teléfono">
          <input
            className={field}
            value={form.telefono}
            onChange={(e) => set("telefono", e.target.value)}
            placeholder="809-000-0000"
            inputMode="tel"
          />
        </Campo>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Email">
          <input
            className={field}
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="correo@ejemplo.com"
          />
        </Campo>
        <Campo label="Dirección">
          <input
            className={field}
            value={form.direccion}
            onChange={(e) => set("direccion", e.target.value)}
            placeholder="Sector, ciudad"
          />
        </Campo>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Plan">
          <select className={field} value={form.plan} onChange={(e) => onPlan(e.target.value)}>
            {PLANES.map((p) => (
              <option key={p.nombre} value={p.nombre}>
                {p.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Precio mensual (RD$)">
          <input
            className={field}
            type="number"
            value={form.precio_mensual}
            onChange={(e) => set("precio_mensual", Number(e.target.value))}
            min={0}
          />
        </Campo>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Estado">
          <select
            className={field}
            value={form.estado}
            onChange={(e) => set("estado", e.target.value)}
          >
            {ESTADO_OPCIONES.map((o) => (
              <option key={o.v} value={o.v}>
                {o.t}
              </option>
            ))}
          </select>
        </Campo>
        {form.estado === "congelado" && (
          <Campo label="Reanuda el">
            <input
              className={field}
              type="date"
              value={form.fecha_reanudacion ?? ""}
              onChange={(e) => set("fecha_reanudacion", e.target.value)}
            />
          </Campo>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Inscripción">
          <input
            className={field}
            type="date"
            value={form.fecha_inicio}
            onChange={(e) => set("fecha_inicio", e.target.value)}
          />
        </Campo>
        <Campo label="Vencimiento">
          <input
            className={field}
            type="date"
            value={form.fecha_vencimiento}
            onChange={(e) => set("fecha_vencimiento", e.target.value)}
          />
        </Campo>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Contacto de emergencia">
          <input
            className={field}
            value={form.contacto_emergencia_nombre}
            onChange={(e) => set("contacto_emergencia_nombre", e.target.value)}
            placeholder="Nombre"
          />
        </Campo>
        <Campo label="Teléfono de emergencia">
          <input
            className={field}
            value={form.contacto_emergencia_telefono}
            onChange={(e) => set("contacto_emergencia_telefono", e.target.value)}
            placeholder="809-000-0000"
            inputMode="tel"
          />
        </Campo>
      </div>

      <Campo label="Notas internas">
        <textarea
          className={`${field} h-24 resize-none py-3`}
          value={form.notas}
          onChange={(e) => set("notas", e.target.value)}
          placeholder="Observaciones del miembro…"
        />
      </Campo>

      {error && (
        <p className="rounded-lg border border-accent bg-accent-soft px-3 py-2.5 text-sm text-ink">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} magnetic={false} className="flex-1">
          {editar ? "Guardar cambios" : "Crear miembro"}
        </Button>
        <Button type="button" variant="secondary" magnetic={false} onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
