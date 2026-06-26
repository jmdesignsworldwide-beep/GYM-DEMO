"use server";

import { revalidatePath } from "next/cache";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { requireSesion } from "@/lib/auth/perfil";

export type CajaResult = { ok: boolean; error?: string };
export type CierreResult = {
  ok: boolean;
  error?: string;
  esperado?: number;
  contado?: number;
  diferencia?: number;
  ingresos?: number;
  egresos?: number;
};

export async function abrirCaja(base: number): Promise<CajaResult> {
  const perfil = await requireSesion();
  const monto = Number(base);
  if (isNaN(monto) || monto < 0) return { ok: false, error: "Base inválida." };

  const sb = getAdminSupabase();
  const { data: abierta } = await sb
    .from("caja_sesiones")
    .select("id")
    .eq("estado", "abierta")
    .limit(1);
  if (abierta && abierta.length > 0) return { ok: false, error: "Ya hay una caja abierta." };

  const { error } = await sb.from("caja_sesiones").insert({
    abierta_por: perfil.userId,
    abierta_por_nombre: perfil.username,
    base: monto,
    estado: "abierta",
  });
  if (error) return { ok: false, error: "No se pudo abrir la caja." };

  revalidatePath("/caja");
  return { ok: true };
}

export async function registrarEgreso(input: {
  monto: number;
  categoria: string;
  nota: string;
}): Promise<CajaResult> {
  const perfil = await requireSesion();
  const monto = Number(input.monto);
  if (!monto || monto <= 0) return { ok: false, error: "El monto debe ser mayor que cero." };
  if (!input.categoria) return { ok: false, error: "Selecciona una categoría." };

  const sb = getAdminSupabase();
  const { error } = await sb.from("egresos").insert({
    monto,
    categoria: input.categoria,
    nota: input.nota?.trim() || null,
    fecha: new Date().toISOString(),
    user_id: perfil.userId,
  });
  if (error) return { ok: false, error: "No se pudo registrar el egreso." };

  revalidatePath("/caja");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function cerrarCaja(efectivoContado: number): Promise<CierreResult> {
  await requireSesion();
  const contado = Number(efectivoContado);
  if (isNaN(contado) || contado < 0) return { ok: false, error: "Monto contado inválido." };

  const sb = getAdminSupabase();
  const { data: sesiones } = await sb
    .from("caja_sesiones")
    .select("id,base,abierta_at")
    .eq("estado", "abierta")
    .order("abierta_at", { ascending: false })
    .limit(1);
  const sesion = sesiones?.[0];
  if (!sesion) return { ok: false, error: "No hay una caja abierta." };

  // Recalcula en el servidor (no confía en el cliente). Día = el más reciente con pagos.
  const { data: pagosData } = await sb
    .from("pagos")
    .select("monto,metodo,fecha")
    .order("fecha", { ascending: false })
    .limit(3000);
  const pagos = (pagosData ?? []).map((p) => ({
    monto: Number(p.monto),
    metodo: p.metodo as string,
    fecha: p.fecha as string,
  }));
  const refDate = pagos.length ? pagos[0].fecha.slice(0, 10) : new Date().toISOString().slice(0, 10);
  const ingresos = pagos.filter((p) => p.fecha.slice(0, 10) === refDate).reduce((s, p) => s + p.monto, 0);
  const ingresosEfectivo = pagos
    .filter((p) => p.fecha.slice(0, 10) === refDate && p.metodo === "efectivo")
    .reduce((s, p) => s + p.monto, 0);

  const { data: egData } = await sb.from("egresos").select("monto,fecha").limit(2000);
  const egresos = (egData ?? [])
    .filter((e) => (e.fecha as string).slice(0, 10) === refDate)
    .reduce((s, e) => s + Number(e.monto), 0);

  const esperado = Number(sesion.base) + ingresosEfectivo - egresos;
  const diferencia = contado - esperado;

  const { error } = await sb
    .from("caja_sesiones")
    .update({ estado: "cerrada", cerrada_at: new Date().toISOString(), efectivo_contado: contado })
    .eq("id", sesion.id);
  if (error) return { ok: false, error: "No se pudo cerrar la caja." };

  revalidatePath("/caja");
  return { ok: true, esperado, contado, diferencia, ingresos, egresos };
}
