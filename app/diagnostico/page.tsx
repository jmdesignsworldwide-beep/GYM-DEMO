import { checkSupabase } from "@/lib/checkSupabase";

// ⚠️ PÁGINA TEMPORAL DE DIAGNÓSTICO — se elimina al terminar la verificación.
// NO muestra valores secretos: solo presencia, longitud y un preview enmascarado.
export const dynamic = "force-dynamic";

function present(v: string | undefined) {
  return typeof v === "string" && v.length > 0;
}

function mask(v: string | undefined) {
  if (!v) return "—";
  if (v.length <= 16) return `${v.length} chars (¡muy corta!)`;
  return `${v.slice(0, 8)}…${v.slice(-6)} (${v.length} chars)`;
}

export default async function Diagnostico() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // 🚨 Esta NUNCA debería existir: sería un hueco de seguridad grave.
  const leakedService = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

  const status = await checkSupabase();

  const rows: { label: string; value: string; bad?: boolean; good?: boolean }[] = [
    {
      label: "NEXT_PUBLIC_SUPABASE_URL",
      value: url ? url : "FALTA",
      bad: !present(url),
      good: present(url),
    },
    {
      label: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      value: mask(anon),
      bad: !present(anon),
      good: present(anon),
    },
    {
      label: "SUPABASE_SERVICE_ROLE_KEY (solo servidor)",
      value: present(service) ? `presente (${service!.length} chars)` : "FALTA",
      bad: !present(service),
      good: present(service),
    },
    {
      label: "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY (¡NO debe existir!)",
      value: present(leakedService)
        ? "🚨 EXISTE — HUECO DE SEGURIDAD, renombrar sin NEXT_PUBLIC_"
        : "no existe ✓",
      bad: present(leakedService),
      good: !present(leakedService),
    },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-bold">JM FIT — Diagnóstico de Supabase</h1>
      <p className="text-sm text-neutral-500">Página temporal. No muestra secretos.</p>

      <table className="text-sm border-collapse">
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b">
              <td className="py-2 pr-6 font-medium align-top">{r.label}</td>
              <td
                className={`py-2 align-top ${
                  r.bad ? "text-red-600" : r.good ? "text-green-600" : ""
                }`}
              >
                {r.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-2 max-w-xl rounded-lg border px-5 py-3 text-sm">
        <div className="font-semibold mb-1">Respuesta en vivo de Supabase:</div>
        {status.state === "ok" && (
          <span className="text-green-600 font-medium">Conectado ✓ (HTTP 200)</span>
        )}
        {status.state === "missing-env" && (
          <span className="text-amber-600 font-medium">Faltan variables de entorno.</span>
        )}
        {status.state === "error" && (
          <span className="text-red-600 font-medium break-words">
            {status.status ? `HTTP ${status.status} — ` : ""}
            {status.detail}
          </span>
        )}
      </div>
    </main>
  );
}
