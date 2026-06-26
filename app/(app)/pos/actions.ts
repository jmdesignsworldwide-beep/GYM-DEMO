"use server";

import { revalidatePath } from "next/cache";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { requireSesion } from "@/lib/auth/perfil";

export type VentaResult = { ok: boolean; error?: string; total?: number };

export async function vender(input: {
  items: { productoId: string; cantidad: number }[];
  metodo: string;
}): Promise<VentaResult> {
  await requireSesion();
  const { items, metodo } = input;

  if (!items || items.length === 0) return { ok: false, error: "El carrito está vacío." };
  if (!metodo) return { ok: false, error: "Selecciona un método de pago." };

  const sb = getAdminSupabase();
  const ids = items.map((i) => i.productoId);
  const { data: prods } = await sb.from("productos").select("id,precio").in("id", ids);
  if (!prods || prods.length === 0) return { ok: false, error: "Productos no válidos." };

  const precioPorId = new Map(prods.map((p) => [p.id as string, Number(p.precio)]));

  // Total calculado en el SERVIDOR (no se confía en el precio del cliente).
  let total = 0;
  for (const it of items) {
    const precio = precioPorId.get(it.productoId);
    const cant = Number(it.cantidad);
    if (precio == null || !cant || cant <= 0) return { ok: false, error: "Venta inválida." };
    total += precio * cant;
  }
  if (total <= 0) return { ok: false, error: "Total inválido." };

  // La venta entra a la caja como un pago de categoría producto (fuente única).
  const { error } = await sb.from("pagos").insert({
    miembro_id: null,
    monto: total,
    metodo,
    categoria: "producto",
    fecha: new Date().toISOString(),
  });
  if (error) return { ok: false, error: "No se pudo registrar la venta." };

  revalidatePath("/caja");
  revalidatePath("/dashboard");
  revalidatePath("/pagos");
  return { ok: true, total };
}
