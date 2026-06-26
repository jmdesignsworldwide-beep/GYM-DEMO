"use server";

import { getAdminSupabase } from "@/lib/supabase/admin";
import { getSupabaseServer } from "@/lib/supabase/ssr-server";

const DOMINIO = "jmfit.local";
const MAX_INTENTOS = 5; // fallos antes de bloquear
const VENTANA_MIN = 15; // ventana de conteo (min)
const BLOQUEO_MIN = 15; // duración del bloqueo (min)

export type LoginResult = { ok: true } | { ok: false; message: string };

/**
 * Inicia sesión con throttle POR USUARIO en el servidor (no solo por IP, que
 * en Vercel sería la IP del servidor). Tras MAX_INTENTOS fallos en la ventana,
 * la cuenta queda bloqueada temporalmente. El conteo vive en `login_intentos`,
 * una tabla server-only (RLS sin políticas → solo la service_role la toca).
 */
export async function iniciarSesion(username: string, password: string): Promise<LoginResult> {
  const user = (username ?? "").trim().toLowerCase();
  if (!user || !password) {
    return { ok: false, message: "Escribe tu usuario y contraseña para continuar." };
  }

  const admin = getAdminSupabase();
  const ahora = Date.now();

  // 1) ¿Está bloqueado por intentos previos?
  const { data: row } = await admin
    .from("login_intentos")
    .select("intentos,ventana_inicio,bloqueado_hasta")
    .eq("username", user)
    .maybeSingle();

  if (row?.bloqueado_hasta && new Date(row.bloqueado_hasta as string).getTime() > ahora) {
    const min = Math.max(1, Math.ceil((new Date(row.bloqueado_hasta as string).getTime() - ahora) / 60000));
    return {
      ok: false,
      message: `Demasiados intentos. Espera ${min} ${min === 1 ? "minuto" : "minutos"} e inténtalo de nuevo.`,
    };
  }

  // 2) Intento real — en el servidor, para que la sesión quede en cookies.
  const sb = getSupabaseServer();
  const { error } = await sb.auth.signInWithPassword({
    email: `${user}@${DOMINIO}`,
    password,
  });

  if (!error) {
    // Éxito → limpia el contador.
    await admin.from("login_intentos").delete().eq("username", user);
    return { ok: true };
  }

  // 3) Fallo → suma al contador (ventana deslizante).
  const ventanaVigente =
    row && ahora - new Date(row.ventana_inicio as string).getTime() < VENTANA_MIN * 60000;
  const intentos = (ventanaVigente ? (row!.intentos as number) : 0) + 1;
  const ventanaInicio = ventanaVigente ? (row!.ventana_inicio as string) : new Date(ahora).toISOString();
  const bloqueadoHasta =
    intentos >= MAX_INTENTOS ? new Date(ahora + BLOQUEO_MIN * 60000).toISOString() : null;

  await admin.from("login_intentos").upsert({
    username: user,
    intentos,
    ventana_inicio: ventanaInicio,
    bloqueado_hasta: bloqueadoHasta,
  });

  if (bloqueadoHasta) {
    return {
      ok: false,
      message: `Demasiados intentos. Espera ${BLOQUEO_MIN} minutos e inténtalo de nuevo.`,
    };
  }
  // Mensaje genérico: no revela si el usuario existe.
  return { ok: false, message: "Usuario o contraseña incorrectos. Revísalos e inténtalo de nuevo." };
}
