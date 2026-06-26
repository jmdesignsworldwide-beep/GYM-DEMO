import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente de servidor con la sesión del usuario (cookies). Permite que los
// Server Components y Server Actions sepan quién es y validen su rol.
export function getSupabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // En Server Components no se pueden escribir cookies; el refresco
            // de sesión lo maneja el middleware. Se ignora con seguridad.
          }
        },
      },
    },
  );
}
