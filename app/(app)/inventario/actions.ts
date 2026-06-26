"use server";

import { revalidatePath } from "next/cache";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/perfil";

export type ProductoResult = { ok: boolean; error?: string };

const s = (fd: FormData, k: string) => ((fd.get(k) as string) ?? "").trim();

function revalidar() {
  revalidatePath("/inventario");
  revalidatePath("/pos");
  revalidatePath("/dashboard");
}

async function subirFoto(foto: File | null): Promise<string | undefined> {
  if (!foto || foto.size === 0) return undefined;
  if (foto.size > 5 * 1024 * 1024) throw new Error("La foto no debe superar 5 MB.");
  const sb = getAdminSupabase();
  const ext = (foto.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await foto.arrayBuffer());
  const { error } = await sb.storage
    .from("fotos-productos")
    .upload(path, buffer, { contentType: foto.type || "image/jpeg" });
  if (error) throw new Error("No se pudo subir la foto.");
  return sb.storage.from("fotos-productos").getPublicUrl(path).data.publicUrl;
}

export async function guardarProducto(formData: FormData): Promise<ProductoResult> {
  await requireAdmin();

  const id = s(formData, "id") || null;
  const nombre = s(formData, "nombre");
  const categoria = s(formData, "categoria");
  const precio = Number(formData.get("precio"));
  const stock = Number(formData.get("stock"));
  const umbral = Number(formData.get("umbral_alerta"));
  const proveedor = s(formData, "proveedor") || null;
  const foto = formData.get("foto") as File | null;

  if (!nombre) return { ok: false, error: "El nombre es obligatorio." };
  if (!categoria) return { ok: false, error: "Selecciona una categoría." };
  if (!precio || precio <= 0) return { ok: false, error: "Precio inválido." };
  if (isNaN(stock) || stock < 0) return { ok: false, error: "Stock inválido." };

  let foto_url: string | undefined;
  try {
    foto_url = await subirFoto(foto);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error con la foto." };
  }

  const sb = getAdminSupabase();
  const row: Record<string, unknown> = {
    nombre,
    categoria,
    precio,
    stock,
    umbral_alerta: isNaN(umbral) ? 5 : umbral,
    proveedor,
  };
  if (foto_url) row.foto_url = foto_url;

  if (id) {
    const { error } = await sb.from("productos").update(row).eq("id", id);
    if (error) return { ok: false, error: "No se pudo guardar." };
  } else {
    row.activo = true;
    const { error } = await sb.from("productos").insert(row);
    if (error) return { ok: false, error: "No se pudo crear el producto." };
  }

  revalidar();
  return { ok: true };
}

export async function eliminarProducto(id: string): Promise<ProductoResult> {
  await requireAdmin();
  const sb = getAdminSupabase();
  const { error } = await sb.from("productos").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar." };
  revalidar();
  return { ok: true };
}

export async function reabastecer(id: string, cantidad: number): Promise<ProductoResult> {
  const perfil = await requireAdmin();
  const cant = Number(cantidad);
  if (!cant || cant <= 0) return { ok: false, error: "Cantidad inválida." };

  const sb = getAdminSupabase();
  const { data: prod } = await sb.from("productos").select("stock").eq("id", id).single();
  if (!prod) return { ok: false, error: "Producto no encontrado." };

  const nuevo = Number(prod.stock) + cant;
  const { error } = await sb.from("productos").update({ stock: nuevo }).eq("id", id);
  if (error) return { ok: false, error: "No se pudo reabastecer." };

  await sb.from("movimientos_stock").insert({
    producto_id: id,
    tipo: "reabastecimiento",
    cantidad: cant,
    user_id: perfil.userId,
  });

  revalidar();
  return { ok: true };
}
