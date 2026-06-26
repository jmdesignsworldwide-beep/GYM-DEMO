"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, KeyRound, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { crearUsuario, cambiarActivo, cambiarPassword } from "@/app/(app)/configuracion/actions";
import { crearCuentaCliente, renovarAcceso, revocarAcceso } from "@/app/(app)/configuracion/super-actions";

const field =
  "h-11 w-full rounded-lg border bg-bg-2 px-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none";

type Usuario = { userId: string; username: string; rol: string; activo: boolean };
type Cliente = { userId: string; username: string; accesoExpira: string | null };

function diasRestantes(iso: string | null): { texto: string; clase: string } {
  if (!iso) return { texto: "Sin vencimiento", clase: "text-emerald-600 dark:text-emerald-400" };
  const dias = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
  if (dias <= 0) return { texto: "Expirada", clase: "text-red-500" };
  if (dias <= 3) return { texto: `${dias} ${dias === 1 ? "día" : "días"}`, clase: "text-amber-600 dark:text-amber-400" };
  return { texto: `${dias} días`, clase: "text-ink" };
}

export function ConfiguracionView({
  usuarios,
  miUserId,
  superAdmin,
  clientes,
}: {
  usuarios: Usuario[];
  miUserId: string;
  superAdmin: boolean;
  clientes: Cliente[];
}) {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("cajero");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwUser, setPwUser] = useState<Usuario | null>(null);
  const [pwValue, setPwValue] = useState("");

  // Panel de cliente (super-admin)
  const [cUsuario, setCUsuario] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [cDias, setCDias] = useState("15");
  const [cCustom, setCCustom] = useState("");
  const [cLoading, setCLoading] = useState(false);
  const [cMsg, setCMsg] = useState<{ ok: boolean; text: string } | null>(null);

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

  async function crearCliente(e: React.FormEvent) {
    e.preventDefault();
    if (cLoading) return;
    setCLoading(true);
    setCMsg(null);
    const dias = cDias === "none" ? null : cDias === "custom" ? Number(cCustom) : Number(cDias);
    if (cDias === "custom" && (!dias || dias <= 0)) {
      setCLoading(false);
      setCMsg({ ok: false, text: "Indica un número de días válido." });
      return;
    }
    const res = await crearCuentaCliente({ usuario: cUsuario, password: cPassword, dias });
    setCLoading(false);
    if (res.ok) {
      setCMsg({ ok: true, text: `Cuenta "${cUsuario}" creada.` });
      setCUsuario("");
      setCPassword("");
      setCDias("15");
      setCCustom("");
      router.refresh();
    } else {
      setCMsg({ ok: false, text: res.error ?? "Error." });
    }
  }

  async function renovar(c: Cliente) {
    const txt = prompt(`¿Cuántos días sumar a "${c.username}"?`, "15");
    if (!txt) return;
    const res = await renovarAcceso(c.userId, Number(txt));
    if (res.ok) router.refresh();
    else setCMsg({ ok: false, text: res.error ?? "Error." });
  }

  async function revocar(c: Cliente) {
    if (!confirm(`¿Revocar el acceso de "${c.username}" ahora?`)) return;
    const res = await revocarAcceso(c.userId);
    if (res.ok) router.refresh();
    else setCMsg({ ok: false, text: res.error ?? "Error." });
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
                      : "bg-bg-3 text-ink-muted"
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

      {/* Panel de accesos de cliente — solo Marien (JM Designs) */}
      {superAdmin && (
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-2">
            <Clock size={18} className="text-accent" />
            <h2 className="font-display text-sm font-semibold text-ink">
              Accesos de cliente · JM Designs
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Crear acceso */}
            <Card glowOnHover={false}>
              <form onSubmit={crearCliente} className="space-y-3">
                <input
                  className={field}
                  placeholder="Usuario del cliente"
                  value={cUsuario}
                  onChange={(e) => setCUsuario(e.target.value)}
                  autoCapitalize="none"
                />
                <input
                  className={field}
                  placeholder="Contraseña (mín. 6)"
                  value={cPassword}
                  onChange={(e) => setCPassword(e.target.value)}
                />
                <select className={field} value={cDias} onChange={(e) => setCDias(e.target.value)}>
                  <option value="7">7 días</option>
                  <option value="15">15 días</option>
                  <option value="30">30 días</option>
                  <option value="custom">Personalizado…</option>
                  <option value="none">Sin vencimiento</option>
                </select>
                {cDias === "custom" && (
                  <input
                    className={field}
                    type="number"
                    min={1}
                    placeholder="Número de días"
                    value={cCustom}
                    onChange={(e) => setCCustom(e.target.value)}
                  />
                )}
                <Button type="submit" loading={cLoading} magnetic={false} className="w-full">
                  Crear acceso de cliente
                </Button>
                {cMsg && (
                  <p className={`text-sm ${cMsg.ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                    {cMsg.text}
                  </p>
                )}
              </form>
            </Card>

            {/* Lista de clientes */}
            <Card glowOnHover={false}>
              <h3 className="mb-3 text-sm font-semibold text-ink">Cuentas ({clientes.length})</h3>
              {clientes.length === 0 ? (
                <p className="py-4 text-sm text-ink-faint">Aún no has creado accesos de cliente.</p>
              ) : (
                <div className="space-y-1">
                  {clientes.map((c) => {
                    const d = diasRestantes(c.accesoExpira);
                    return (
                      <div key={c.userId} className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-bg-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{c.username}</p>
                          <p className={`text-xs font-medium ${d.clase}`}>{d.texto}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => renovar(c)}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-ink-muted hover:bg-bg-3 hover:text-ink"
                        >
                          Renovar
                        </button>
                        <button
                          type="button"
                          onClick={() => revocar(c)}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-red-500 hover:bg-bg-3"
                        >
                          Revocar
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

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
