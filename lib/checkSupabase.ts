// Verificación mínima de conexión a Supabase (sin tablas de negocio todavía).
// Hace una llamada ligera al endpoint REST de Supabase para confirmar que
// la URL y la anon key son válidas y que el servicio responde.

export type SupabaseStatus =
  | { state: "ok" }
  | { state: "missing-env" }
  | { state: "error"; detail: string };

export async function checkSupabase(): Promise<SupabaseStatus> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return { state: "missing-env" };
  }

  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return { state: "error", detail: `HTTP ${res.status}` };
    }

    return { state: "ok" };
  } catch (err) {
    return {
      state: "error",
      detail: err instanceof Error ? err.message : "fallo de red",
    };
  }
}
