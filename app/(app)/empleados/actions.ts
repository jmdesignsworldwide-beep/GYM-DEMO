"use server";

import { revalidatePath } from "next/cache";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { requireAdmin, requireSesion } from "@/lib/auth/perfil";

export type EmpResult = { ok: boolean; error?: string };

const s = (fd: FormData, k: string) => ((fd.get(k) as string) ?? "").trim();

function revalidar() {
  revalidatePath("/empleados");
  revalidatePath("/clases");
  revalidatePath("/entrenamiento");
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
    .from("fotos-empleados")
    .upload(path, buffer, { contentType: foto.type || "image/jpeg" });
  if (error) throw new Error("No se pudo subir la foto.");
  return sb.storage.from("fotos-empleados").getPublicUrl(path).data.publicUrl;
}

export async function guardarEmpleado(formData: FormData): Promise<EmpResult> {
  await requireAdmin();

  const id = s(formData, "id") || null;
  const nombre = s(formData, "nombre");
  const cedula = s(formData, "cedula");
  const telefono = s(formData, "telefono") || null;
  const puesto = s(formData, "puesto");
  const especialidades = s(formData, "especialidades"); // CSV
  const fecha_ingreso = s(formData, "fecha_ingreso") || null;
  const salario = Number(formData.get("salario"));
  const horario = s(formData, "horario") || null;
  const estado = s(formData, "estado") || "activo";
  const notas = s(formData, "notas") || null;
  const foto = formData.get("foto") as File | null;

  if (!nombre) return { ok: false, error: "El nombre es obligatorio." };
  if (!cedula) return { ok: false, error: "La cédula es obligatoria." };
  if (!puesto) return { ok: false, error: "Selecciona un puesto." };
  if (isNaN(salario) || salario < 0) return { ok: false, error: "Salario inválido." };

  let foto_url: string | undefined;
  try {
    foto_url = await subirFoto(foto);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error con la foto." };
  }

  const especialidadesArr = especialidades
    ? especialidades.split(",").map((x) => x.trim()).filter(Boolean)
    : [];

  const sb = getAdminSupabase();
  const row: Record<string, unknown> = {
    nombre,
    cedula,
    telefono,
    puesto,
    especialidades: especialidadesArr,
    salario,
    horario,
    estado,
    notas,
  };
  if (fecha_ingreso) row.fecha_ingreso = fecha_ingreso;
  if (foto_url) row.foto_url = foto_url;

  if (id) {
    const { error } = await sb.from("empleados").update(row).eq("id", id);
    if (error) return { ok: false, error: "No se pudo guardar." };
  } else {
    const { error } = await sb.from("empleados").insert(row);
    if (error) return { ok: false, error: "No se pudo crear el empleado." };
  }

  revalidar();
  return { ok: true };
}

export async function eliminarEmpleado(id: string): Promise<EmpResult> {
  await requireAdmin();
  const sb = getAdminSupabase();
  const { error } = await sb.from("empleados").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar (puede tener clases o sesiones asignadas)." };
  revalidar();
  return { ok: true };
}

/** Registrar pago de nómina → además entra a Caja como egreso (organismo). */
export async function registrarNomina(input: {
  empleadoId: string;
  monto: number;
  periodo: string;
  tipo: string;
}): Promise<EmpResult> {
  const perfil = await requireAdmin();
  const monto = Number(input.monto);
  if (!monto || monto <= 0) return { ok: false, error: "Monto inválido." };

  const sb = getAdminSupabase();
  const { data: emp } = await sb
    .from("empleados")
    .select("nombre")
    .eq("id", input.empleadoId)
    .single();
  if (!emp) return { ok: false, error: "Empleado no encontrado." };

  // 1) Egreso en Caja (fuente única de salidas de dinero).
  const { data: egreso, error: eErr } = await sb
    .from("egresos")
    .insert({
      monto,
      categoria: "nomina",
      nota: `Nómina · ${emp.nombre}${input.periodo ? ` · ${input.periodo}` : ""}`,
      user_id: perfil.userId,
    })
    .select("id")
    .single();
  if (eErr) return { ok: false, error: "No se pudo registrar el egreso." };

  // 2) Registro de nómina enlazado al egreso.
  const { error: nErr } = await sb.from("nominas").insert({
    empleado_id: input.empleadoId,
    monto,
    periodo: input.periodo || null,
    tipo: input.tipo || "salario",
    egreso_id: egreso?.id ?? null,
    user_id: perfil.userId,
  });
  if (nErr) return { ok: false, error: "Se registró el egreso pero falló la nómina." };

  revalidatePath("/empleados");
  revalidatePath("/caja");
  revalidatePath("/dashboard");
  return { ok: true };
}

export type FichaEmpleado = {
  clases: { id: string; disciplina: string; dia: number; hora: string; capacidad: number; inscritos: number }[];
  sesionesPt: number;
  // Sensible — solo admin (vacío para cajero):
  esAdmin: boolean;
  salario: number | null;
  nominas: { id: string; monto: number; periodo: string | null; tipo: string; fecha: string }[];
  comisiones: { id: string; monto: number; origen: string; fecha: string; nota: string | null }[];
  totalNomina: number;
  totalComision: number;
};

/** Carga la ficha del empleado. Datos sensibles solo si quien pide es admin. */
export async function getFichaEmpleado(id: string): Promise<FichaEmpleado | null> {
  const perfil = await requireSesion();
  const esAdmin = perfil.rol === "admin";
  const sb = getAdminSupabase();

  const { data: clasesRaw } = await sb
    .from("clases")
    .select("id,disciplina,dia_semana,hora,capacidad")
    .eq("instructor_id", id)
    .eq("activa", true)
    .order("dia_semana");

  const clases = await Promise.all(
    (clasesRaw ?? []).map(async (c) => {
      const { count } = await sb
        .from("inscripciones")
        .select("id", { count: "exact", head: true })
        .eq("clase_id", c.id as string)
        .eq("estado", "inscrito");
      return {
        id: c.id as string,
        disciplina: c.disciplina as string,
        dia: c.dia_semana as number,
        hora: (c.hora as string).slice(0, 5),
        capacidad: c.capacidad as number,
        inscritos: count ?? 0,
      };
    }),
  );

  const { count: sesionesPt } = await sb
    .from("sesiones_pt")
    .select("id", { count: "exact", head: true })
    .eq("entrenador_id", id);

  if (!esAdmin) {
    return {
      clases,
      sesionesPt: sesionesPt ?? 0,
      esAdmin: false,
      salario: null,
      nominas: [],
      comisiones: [],
      totalNomina: 0,
      totalComision: 0,
    };
  }

  const { data: emp } = await sb.from("empleados").select("salario").eq("id", id).single();
  const { data: nominasRaw } = await sb
    .from("nominas")
    .select("id,monto,periodo,tipo,fecha")
    .eq("empleado_id", id)
    .order("fecha", { ascending: false });
  const { data: comisionesRaw } = await sb
    .from("comisiones")
    .select("id,monto,origen,fecha,nota")
    .eq("empleado_id", id)
    .order("fecha", { ascending: false });

  const nominas = (nominasRaw ?? []).map((n) => ({
    id: n.id as string,
    monto: Number(n.monto),
    periodo: (n.periodo as string) ?? null,
    tipo: n.tipo as string,
    fecha: n.fecha as string,
  }));
  const comisiones = (comisionesRaw ?? []).map((c) => ({
    id: c.id as string,
    monto: Number(c.monto),
    origen: c.origen as string,
    fecha: c.fecha as string,
    nota: (c.nota as string) ?? null,
  }));

  return {
    clases,
    sesionesPt: sesionesPt ?? 0,
    esAdmin: true,
    salario: Number(emp?.salario ?? 0),
    nominas,
    comisiones,
    totalNomina: nominas.reduce((a, n) => a + n.monto, 0),
    totalComision: comisiones.reduce((a, c) => a + c.monto, 0),
  };
}
