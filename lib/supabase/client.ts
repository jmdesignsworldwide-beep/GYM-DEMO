import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente de Supabase para el navegador (anon key, pública por diseño).
// Lazy: se instancia en el primer uso (en el cliente), no al importar el
// módulo — así el prerender no lo evalúa sin las variables de entorno.
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      },
    );
  }
  return client;
}
