import { getServerSupabase } from "@/lib/supabase/server";

export type Producto = {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  stock: number;
  umbralAlerta: number;
  fotoUrl: string | null;
  proveedor: string | null;
};

const COLS = "id,nombre,precio,categoria,stock,umbral_alerta,foto_url,proveedor";

function mapRow(p: Record<string, unknown>): Producto {
  return {
    id: p.id as string,
    nombre: p.nombre as string,
    precio: Number(p.precio),
    categoria: p.categoria as string,
    stock: Number(p.stock),
    umbralAlerta: Number(p.umbral_alerta),
    fotoUrl: (p.foto_url as string) ?? null,
    proveedor: (p.proveedor as string) ?? null,
  };
}

export async function getProductos(): Promise<Producto[]> {
  const sb = getServerSupabase();
  const { data } = await sb
    .from("productos")
    .select(COLS)
    .eq("activo", true)
    .order("categoria")
    .order("nombre");
  return (data ?? []).map(mapRow);
}
