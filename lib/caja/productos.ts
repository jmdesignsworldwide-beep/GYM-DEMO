import { getServerSupabase } from "@/lib/supabase/server";

export type Producto = {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
};

export async function getProductos(): Promise<Producto[]> {
  const sb = getServerSupabase();
  const { data } = await sb
    .from("productos")
    .select("id,nombre,precio,categoria")
    .eq("activo", true)
    .order("categoria")
    .order("nombre");
  return (data ?? []).map((p) => ({
    id: p.id as string,
    nombre: p.nombre as string,
    precio: Number(p.precio),
    categoria: p.categoria as string,
  }));
}
