import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rutas del sistema que requieren sesión.
const APP_PATHS = [
  "/dashboard",
  "/miembros",
  "/empleados",
  "/pagos",
  "/caja",
  "/pos",
  "/inventario",
  "/equipos",
  "/acceso",
  "/calendario",
  "/clases",
  "/entrenamiento",
  "/nutricion",
  "/reportes",
  "/configuracion",
];

// Rutas solo para admin (datos financieros / configuración / inventario / equipos).
const ADMIN_PATHS = ["/pagos", "/reportes", "/configuracion", "/inventario", "/equipos"];

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

  // Con sesión y dentro del sistema: el servidor valida vigencia y rol.
  if (user && match(path, APP_PATHS)) {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol,acceso_expira")
      .eq("user_id", user.id)
      .single();

    // Acceso de demostración vencido → bloqueo total, a la pantalla de expirado.
    const expirado =
      perfil?.acceso_expira != null &&
      new Date(perfil.acceso_expira as string).getTime() < Date.now();
    if (expirado) {
      const url = req.nextUrl.clone();
      url.pathname = "/expirado";
      url.search = "";
      return NextResponse.redirect(url);
    }

    // Rutas solo-admin: bloquea al cajero aun forzando la URL.
    if (match(path, ADMIN_PATHS) && perfil?.rol !== "admin") {
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
