import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase para lectura en el servidor (Server Components).
// Usa la anon key; las tablas tienen RLS con política de lectura para anon.
export function getServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
