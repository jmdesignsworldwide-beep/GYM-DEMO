import { NextRequest, NextResponse } from "next/server";

// ⚠️ ENDPOINT TEMPORAL — crea/repara el usuario de prueba en Supabase Auth.
// Usa la service_role SOLO en el servidor (desde las variables de Vercel);
// nunca se expone al navegador ni al chat. Se elimina al terminar la prueba.
export const dynamic = "force-dynamic";

const SEED_SECRET = "jmfit-seed-2026";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  if (searchParams.get("secret") !== SEED_SECRET) {
    return NextResponse.json({ ok: false, error: "no autorizado" }, { status: 401 });
  }

  const username = (searchParams.get("username") || "marien").trim().toLowerCase();
  const password = searchParams.get("password") || "";
  if (!password) {
    return NextResponse.json({ ok: false, error: "falta el parámetro password" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Faltan variables en este entorno. Asegúrate de que SUPABASE_SERVICE_ROLE_KEY y NEXT_PUBLIC_SUPABASE_URL estén habilitadas para el entorno 'Preview' en Vercel.",
      },
      { status: 500 },
    );
  }

  const email = `${username}@jmfit.local`;
  const base = url.replace(/\/$/, "");
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };

  // 1) Intentar crear el usuario ya confirmado.
  const createRes = await fetch(`${base}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password, email_confirm: true }),
  });

  if (createRes.ok) {
    return NextResponse.json({ ok: true, accion: "usuario creado y confirmado", usuario: username, email });
  }

  const errText = (await createRes.text()).slice(0, 400);

  // 2) Si ya existía, localizarlo y reiniciar contraseña + confirmar.
  if (createRes.status === 422 || /exist|registered|already/i.test(errText)) {
    const listRes = await fetch(`${base}/auth/v1/admin/users?per_page=200`, { headers });
    if (listRes.ok) {
      const data = await listRes.json();
      const users = Array.isArray(data) ? data : data.users || [];
      const found = users.find(
        (u: { id?: string; email?: string }) => (u.email || "").toLowerCase() === email,
      );
      if (found?.id) {
        const updRes = await fetch(`${base}/auth/v1/admin/users/${found.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ password, email_confirm: true }),
        });
        if (updRes.ok) {
          return NextResponse.json({
            ok: true,
            accion: "ya existía: contraseña reiniciada y cuenta confirmada",
            usuario: username,
            email,
          });
        }
        return NextResponse.json(
          { ok: false, error: "no se pudo actualizar el usuario", detalle: (await updRes.text()).slice(0, 300) },
          { status: 500 },
        );
      }
    }
    return NextResponse.json(
      { ok: false, error: "el usuario ya existe pero no se pudo localizar para repararlo", detalle: errText },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { ok: false, error: "no se pudo crear el usuario", status: createRes.status, detalle: errText },
    { status: 500 },
  );
}
