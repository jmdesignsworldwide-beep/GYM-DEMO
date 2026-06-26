import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

// ⚠️ ENDPOINT TEMPORAL — crea el usuario cajero de prueba (auth + perfil).
// Usa service_role solo en el servidor. Se elimina tras verificar la pieza.
export const dynamic = "force-dynamic";

const SECRET = "jmfit-seed-2026";
const EMAIL = "cajero@jmfit.local";
const PASSWORD = "Cajero123";

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("secret") !== SECRET) {
    return NextResponse.json({ ok: false, error: "no autorizado" }, { status: 401 });
  }

  const sb = getAdminSupabase();

  let userId: string | undefined;
  const { data: created } = await sb.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
  });
  if (created?.user) {
    userId = created.user.id;
  } else {
    const { data: list } = await sb.auth.admin.listUsers();
    const found = list?.users.find((u) => u.email === EMAIL);
    userId = found?.id;
    if (userId) await sb.auth.admin.updateUserById(userId, { password: PASSWORD, email_confirm: true });
  }

  if (!userId) {
    return NextResponse.json({ ok: false, error: "no se pudo crear el cajero" }, { status: 500 });
  }

  const { error: pErr } = await sb
    .from("perfiles")
    .upsert({ user_id: userId, username: "cajero", rol: "cajero", activo: true }, { onConflict: "user_id" });
  if (pErr) {
    return NextResponse.json({ ok: false, error: "usuario creado, perfil falló" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, usuario: "cajero", rol: "cajero" });
}
