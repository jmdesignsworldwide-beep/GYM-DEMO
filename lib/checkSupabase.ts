// Verificación mínima de conexión a Supabase (sin tablas de negocio todavía).
// Hace una llamada ligera al endpoint REST de Supabase para confirmar que
// la URL y la anon key son válidas y que el servicio responde.

export type SupabaseStatus =
  | { state: "ok" }
  | { state: "missing-env" }
  | { state: "error"; status?: number; detail: string };

export async function checkSupabase(): Promise<SupabaseStatus> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return { state: "missing-env" };
  }

  try {
    // Usamos el endpoint de salud de Auth (GoTrue): el gateway exige un
    // apikey válido para enrutar, así que un 200 confirma que la URL y la
    // anon key son correctas. El endpoint raíz /rest/v1/ no sirve porque
    // solo lo acepta la service_role.
    const res = await fetch(`${url.replace(/\/$/, "")}/auth/v1/health`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      // El cuerpo de error de Supabase NO es secreto: suele traer un
      // mensaje/hint que explica exactamente qué falla con la llave.
      let body = "";
      try {
        body = (await res.text()).slice(0, 300);
      } catch {
        /* ignore */
      }
      return { state: "error", status: res.status, detail: body || `HTTP ${res.status}` };
    }

    return { state: "ok" };
  } catch (err) {
    return {
      state: "error",
      detail: err instanceof Error ? err.message : "fallo de red",
    };
  }
}
