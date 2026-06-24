import { checkSupabase } from "@/lib/checkSupabase";

// Página temporal de verificación de infraestructura.
// SIN diseño de marca todavía — solo confirma deploy + conexión a Supabase.
export const dynamic = "force-dynamic";

export default async function Home() {
  const status = await checkSupabase();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-bold tracking-tight">JM FIT</h1>
      <p className="text-lg text-neutral-500">Sistema en construcción 🏗️</p>

      <div className="mt-4 rounded-lg border px-5 py-3 text-sm">
        {status.state === "ok" && (
          <span className="font-medium text-green-600">Supabase conectado ✓</span>
        )}
        {status.state === "missing-env" && (
          <span className="font-medium text-amber-600">
            Supabase pendiente de configuración (faltan variables de entorno)
          </span>
        )}
        {status.state === "error" && (
          <span className="font-medium text-red-600">
            Supabase no responde ({status.detail})
          </span>
        )}
      </div>
    </main>
  );
}
