import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rutas del sistema que requieren sesión.
const APP_PATHS = [
  "/dashboard",
  "/miembros",
  "/pagos",
  "/acceso",
  "/calendario",
  "/clases",
  "/reportes",
  "/configuracion",
];

// Rutas solo para admin (datos financieros / configuración).
const ADMIN_PATHS = ["/pagos", "/reportes", "/configuracion"];

const match = (path: string, list: string[]) =>
  list.some((p) => path === p || path.startsWith(p + "/"));

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;

  // Sin sesión → al login (en rutas del sistema).
  if (match(path, APP_PATHS) && !user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Rutas solo-admin: el servidor verifica el rol y bloquea al cajero.
  if (user && match(path, ADMIN_PATHS)) {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("user_id", user.id)
      .single();
    if (perfil?.rol !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.searchParams.set("denegado", "1");
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login|api|.*\\.).*)"],
};
