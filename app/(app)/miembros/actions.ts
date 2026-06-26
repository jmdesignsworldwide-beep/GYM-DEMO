"use server";

import { revalidatePath } from "next/cache";
import { getAdminSupabase } from "@/lib/supabase/admin";
import {
  cedulaValida,
  telefonoValido,
  emailValido,
  formatCedula,
  formatTelefono,
} from "@/lib/miembros/validacion";

export type GuardarResult = { ok: boolean; error?: string };

const s = (fd: FormData, k: string) => ((fd.get(k) as string) ?? "").trim();

export async function guardarMiembro(formData: FormData): Promise<GuardarResult> {
  const id = s(formData, "id") || null;
  const nombre = s(formData, "nombre");
  const cedula = s(formData, "cedula");
  const telefono = s(formData, "telefono");
  const email = s(formData, "email");
  const direccion = s(formData, "direccion");
  const plan = s(formData, "plan");
  const precio = Number(formData.get("precio_mensual"));
  const estado = s(formData, "estado") || "activo";
  const fecha_inicio = s(formData, "fecha_inicio");
  const fecha_vencimiento = s(formData, "fecha_vencimiento");
  const fecha_reanudacion = s(formData, "fecha_reanudacion") || null;
  const cen = s(formData, "contacto_emergencia_nombre") || null;
  const cet = s(formData, "contacto_emergencia_telefono") || null;
  const notas = s(formData, "notas") || null;
  const foto = formData.get("foto") as File | null;

  // Validación en el servidor (no solo en la interfaz)
  if (!nombre) return { ok: false, error: "El nombre es obligatorio." };
  if (!cedulaValida(cedula)) return { ok: false, error: "La cédula debe tener 11 dígitos." };
  if (!telefonoValido(telefono))
    return { ok: false, error: "El teléfono debe ser dominicano (809/829/849 + 7 dígitos)." };
  if (email && !emailValido(email)) return { ok: false, error: "El email no tiene un formato válido." };
  if (!plan) return { ok: false, error: "Selecciona un plan." };
  if (!precio || precio <= 0) return { ok: false, error: "El precio mensual no es válido." };
  if (!fecha_inicio || !fecha_vencimiento)
    return { ok: false, error: "Las fechas de inscripción y vencimiento son obligatorias." };
  if (estado === "congelado" && !fecha_reanudacion)
    return { ok: false, error: "Indica la fecha de reanudación para un miembro congelado." };

  const sb = getAdminSupabase();

  // Foto opcional → Storage
  let foto_url: string | undefined;
  if (foto && foto.size > 0) {
    if (foto.size > 5 * 1024 * 1024) return { ok: false, error: "La foto no debe superar 5 MB." };
    const ext = (foto.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await foto.arrayBuffer());
    const { error: upErr } = await sb.storage
      .from("fotos-miembros")
      .upload(path, buffer, { contentType: foto.type || "image/jpeg", upsert: false });
    if (upErr) return { ok: false, error: "No se pudo subir la foto. Inténtalo de nuevo." };
    foto_url = sb.storage.from("fotos-miembros").getPublicUrl(path).data.publicUrl;
  }

  const row: Record<string, unknown> = {
    nombre,
    cedula: formatCedula(cedula),
    telefono: formatTelefono(telefono),
    email: email || null,
    direccion: direccion || null,
    plan,
    precio_mensual: precio,
    estado,
    fecha_inicio,
    fecha_vencimiento,
    fecha_reanudacion: estado === "congelado" ? fecha_reanudacion : null,
    contacto_emergencia_nombre: cen,
    contacto_emergencia_telefono: cet,
    notas,
  };
  if (foto_url) row.foto_url = foto_url;

  if (id) {
    const { error } = await sb.from("miembros").update(row).eq("id", id);
    if (error) return { ok: false, error: "No se pudieron guardar los cambios." };
  } else {
    const { count } = await sb.from("miembros").select("id", { count: "exact", head: true });
    row.codigo = "JMF-" + String((count ?? 0) + 1).padStart(4, "0");
    const { error } = await sb.from("miembros").insert(row);
    if (error) return { ok: false, error: "No se pudo crear el miembro." };
  }

  revalidatePath("/miembros");
  revalidatePath("/dashboard");
  return { ok: true };
}
