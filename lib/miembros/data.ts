import { getServerSupabase } from "@/lib/supabase/server";

export type Miembro = {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  email: string | null;
  direccion: string | null;
  plan: string;
  precio_mensual: number;
  estado: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  fecha_reanudacion: string | null;
  codigo: string | null;
  foto_url: string | null;
  contacto_emergencia_nombre: string | null;
  contacto_emergencia_telefono: string | null;
  notas: string | null;
};

const COLS =
  "id,nombre,cedula,telefono,email,direccion,plan,precio_mensual,estado,fecha_inicio,fecha_vencimiento,fecha_reanudacion,codigo,foto_url,contacto_emergencia_nombre,contacto_emergencia_telefono,notas";

export async function getMiembros(): Promise<Miembro[]> {
  const sb = getServerSupabase();
  const { data } = await sb.from("miembros").select(COLS).order("nombre").limit(2000);
  return (data ?? []).map((m) => ({ ...m, precio_mensual: Number(m.precio_mensual) })) as Miembro[];
}
