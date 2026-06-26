"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, KeyRound } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { crearUsuario, cambiarActivo, cambiarPassword } from "@/app/(app)/configuracion/actions";

const field =
  "h-11 w-full rounded-lg border bg-bg-2 px-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none";

type Usuario = { userId: string; username: string; rol: string; activo: boolean };

export function ConfiguracionView({
  usuarios,
  miUserId,
}: {
  usuarios: Usuario[];
  miUserId: string;
}) {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("cajero");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwUser, setPwUser] = useState<Usuario | null>(null);
  const [pwValue, setPwValue] = useState("");

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setMsg(null);
    const res = await crearUsuario({ usuario, password, rol });
    setLoading(false);
    if (res.ok) {
      setMsg({ ok: true, text: `Usuario "${usuario}" creado.` });
      setUsuario("");
      setPassword("");
      setRol("cajero");
      router.refresh();
    } else {
      setMsg({ ok: false, text: res.error ?? "Error." });
    }
  }

  async function toggle(u: Usuario) {
    const res = await cambiarActivo(u.userId, !u.activo);
    if (res.ok) router.refresh();
    else setMsg({ ok: false, text: res.error ?? "Error." });
  }

  async function guardarPw() {
    if (!pwUser) return;
    const res = await cambiarPassword(pwUser.userId, pwValue);
    if (res.ok) {
      setPwUser(null);
      setPwValue("");
      setMsg({ ok: true, text: "Contraseña actualizada." });
    } else {
      setMsg({ ok: false, text: res.error ?? "Error." });
    }
  }

  return (
    <div>
      <h1 className="mb-5 font-display text-title font-semibold text-ink">Configuración</h1>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Crear usuario */}
        <Card glowOnHover={false}>
          <div className="mb-4 flex items-center gap-2">
            <UserPlus size={18} className="text-accent" />
            <h2 className="font-display text-sm font-semibold text-ink">Crear cuenta</h2>
          </div>
          <form onSubmit={crear} className="space-y-3">
            <input
              className={field}
              placeholder="Usuario (ej. recepcion1)"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoCapitalize="none"
            />
            <input
              className={field}
              type="text"
              placeholder="Contraseña (mín. 6)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <select className={field} value={rol} onChange={(e) => setRol(e.target.value)}>
              <option value="cajero">Cajero / recepción</option>
              <option value="admin">Administrador</option>
            </select>
            <Button type="submit" loading={loading} magnetic={false} className="w-full">
              Crear usuario
            </Button>
            {msg && (
              <p
                className={`text-sm ${msg.ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}
              >
                {msg.text}
              </p>
            )}
          </form>
        </Card>

        {/* Lista de usuarios */}
        <Card glowOnHover={false}>
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">
            Usuarios ({usuarios.length})
          </h2>
          <div className="space-y-1">
            {usuarios.map((u) => (
              <div
                key={u.userId}
                className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-bg-2"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                  {u.username.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{u.username}</p>
                  <p className="text-xs text-ink-faint">
                    {u.rol === "admin" ? "Administrador" : "Cajero"}
                    {u.userId === miUserId ? " · tú" : ""}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    u.activo
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-zinc-500/15 text-zinc-500"
                  }`}
                >
                  {u.activo ? "Activo" : "Inactivo"}
                </span>
                <button
                  type="button"
                  onClick={() => setPwUser(u)}
                  aria-label="Cambiar contraseña"
                  className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-bg-3 hover:text-ink"
                >
                  <KeyRound size={15} />
                </button>
                {u.userId !== miUserId && (
                  <button
                    type="button"
                    onClick={() => toggle(u)}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-ink-muted hover:bg-bg-3 hover:text-ink"
                  >
                    {u.activo ? "Desactivar" : "Activar"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Cambiar contraseña */}
      <Modal open={!!pwUser} onClose={() => setPwUser(null)} title="Cambiar contraseña">
        {pwUser && (
          <div className="space-y-3">
            <p className="text-sm text-ink-muted">Usuario: {pwUser.username}</p>
            <input
              className={field}
              type="text"
              placeholder="Nueva contraseña (mín. 6)"
              value={pwValue}
              onChange={(e) => setPwValue(e.target.value)}
            />
            <Button magnetic={false} className="w-full" onClick={guardarPw}>
              Guardar contraseña
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
