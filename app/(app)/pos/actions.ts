"use server";

import { revalidatePath } from "next/cache";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { requireSesion } from "@/lib/auth/perfil";

export type VentaResult = { ok: boolean; error?: string; total?: number };

export async function vender(input: {
  items: { productoId: string; cantidad: number }[];
  metodo: string;
}): Promise<VentaResult> {
  const perfil = await requireSesion();
  const { items, metodo } = input;

  if (!items || items.length === 0) return { ok: false, error: "El carrito está vacío." };
  if (!metodo) return { ok: false, error: "Selecciona un método de pago." };

  const sb = getAdminSupabase();
  const ids = items.map((i) => i.productoId);
  const { data: prods } = await sb.from("productos").select("id,nombre,precio,stock").in("id", ids);
  if (!prods || prods.length === 0) return { ok: false, error: "Productos no válidos." };

  const porId = new Map(prods.map((p) => [p.id as string, p]));

  // Valida stock y total en el SERVIDOR.
  let total = 0;
  for (const it of items) {
    const prod = porId.get(it.productoId);
    const cant = Number(it.cantidad);
    if (!prod || !cant || cant <= 0) return { ok: false, error: "Venta inválida." };
    const stock = Number(prod.stock);
    if (stock <= 0) return { ok: false, error: `Sin stock de ${prod.nombre}.` };
    if (cant > stock) return { ok: false, error: `Solo quedan ${stock} de ${prod.nombre}.` };
    total += Number(prod.precio) * cant;
  }
  if (total <= 0) return { ok: false, error: "Total inválido." };

  // Registra la venta como pago (fuente única de la caja).
  const { error: pErr } = await sb.from("pagos").insert({
    miembro_id: null,
    monto: total,
    metodo,
    categoria: "producto",
    fecha: new Date().toISOString(),
  });
  if (pErr) return { ok: false, error: "No se pudo registrar la venta." };

  // Descuenta stock real y registra el movimiento.
  for (const it of items) {
    const prod = porId.get(it.productoId)!;
    const nuevo = Number(prod.stock) - Number(it.cantidad);
    await sb.from("productos").update({ stock: nuevo }).eq("id", it.productoId);
    await sb.from("movimientos_stock").insert({
      producto_id: it.productoId,
      tipo: "venta",
      cantidad: -Number(it.cantidad),
      user_id: perfil.userId,
    });
  }

  revalidatePath("/caja");
  revalidatePath("/dashboard");
  revalidatePath("/pagos");
  revalidatePath("/pos");
  revalidatePath("/inventario");
  return { ok: true, total };
}
