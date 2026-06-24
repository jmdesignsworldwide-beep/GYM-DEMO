import { getSupabase } from "@/lib/supabase/client";

// El cliente solo ve "usuario + contraseña". Por detrás mapeamos el usuario
// a un email interno para Supabase Auth (que requiere email internamente).
const AUTH_DOMAIN = "jmfit.local";

export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${AUTH_DOMAIN}`;
}

export type SignInResult =
  | { ok: true }
  | { ok: false; message: string };

/**
 * Inicia sesión contra Supabase con usuario + contraseña.
 * Devuelve mensajes de error en la voz del sistema (español, claros).
 */
export async function signIn(
  username: string,
  password: string,
): Promise<SignInResult> {
  if (!username.trim() || !password) {
    return { ok: false, message: "Escribe tu usuario y contraseña para continuar." };
  }

  try {
    const { error } = await getSupabase().auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    });

    if (!error) return { ok: true };

    // Traducimos los errores comunes a la voz del sistema.
    const raw = error.message.toLowerCase();
    if (raw.includes("invalid login credentials")) {
      return { ok: false, message: "Usuario o contraseña incorrectos. Revísalos e inténtalo de nuevo." };
    }
    if (raw.includes("email not confirmed")) {
      return { ok: false, message: "Esta cuenta aún no está confirmada. Avísale al administrador." };
    }
    if (raw.includes("too many requests") || raw.includes("rate limit")) {
      return { ok: false, message: "Demasiados intentos. Espera un momento antes de volver a intentar." };
    }
    return { ok: false, message: "No pudimos iniciar sesión. Inténtalo de nuevo en un momento." };
  } catch {
    return { ok: false, message: "No pudimos conectar. Revisa tu internet e inténtalo otra vez." };
  }
}

export async function signOut() {
  await getSupabase().auth.signOut();
}
