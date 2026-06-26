import { getServerSupabase } from "@/lib/supabase/server";

export type ObjetivoNut = {
  key: string;
  label: string;
  kcalKg: number; // calorías por kg de peso
  protKg: number; // proteína (g) por kg de peso
};

export const OBJETIVOS_NUT: ObjetivoNut[] = [
  { key: "bajar_grasa", label: "Bajar grasa", kcalKg: 24, protKg: 2.2 },
  { key: "mantenimiento", label: "Mantenimiento", kcalKg: 31, protKg: 1.8 },
  { key: "ganar_masa", label: "Ganar masa muscular", kcalKg: 36, protKg: 2.0 },
];

export const MOMENTOS = ["desayuno", "media mañana", "almuerzo", "merienda", "cena"] as const;

export type Macros = { calorias: number; proteina: number; carbos: number; grasa: number };

/**
 * Cálculo real de calorías y macros según peso (kg) y objetivo.
 * Proteína y calorías escalan con el peso; grasa ≈ 0.9 g/kg; el resto de
 * calorías se asigna a carbohidratos. (Proteína/carbos 4 kcal/g, grasa 9.)
 */
export function calcularMacros(peso: number, objetivoKey: string): Macros {
  const o = OBJETIVOS_NUT.find((x) => x.key === objetivoKey) ?? OBJETIVOS_NUT[1];
  const p = Math.max(30, peso || 0);
  const calorias = Math.round(p * o.kcalKg);
  const proteina = Math.round(p * o.protKg);
  const grasa = Math.round(p * 0.9);
  const carbos = Math.max(0, Math.round((calorias - proteina * 4 - grasa * 9) / 4));
  return { calorias, proteina, carbos, grasa };
}

export function objetivoLabel(key: string): string {
  return OBJETIVOS_NUT.find((o) => o.key === key)?.label ?? key;
}

export type PlanNutricion = {
  id: string;
  miembroId: string;
  miembroNombre: string;
  miembroFoto: string | null;
  objetivo: string;
  calorias: number;
  proteina: number;
  carbos: number;
  grasa: number;
  notas: string | null;
  activo: boolean;
  comidas: number;
};

export type Comida = {
  id: string;
  momento: string;
  descripcion: string;
  calorias: number | null;
  orden: number;
};

export async function getPlanesNutricion(): Promise<PlanNutricion[]> {
  const sb = getServerSupabase();
  const { data: planesRaw } = await sb
    .from("planes_nutricion")
    .select("id,miembro_id,objetivo,calorias,proteina_g,carbos_g,grasa_g,notas,activo,miembros(nombre,foto_url)")
    .eq("activo", true)
    .order("created_at", { ascending: false });

  const planes = planesRaw ?? [];

  // conteo de comidas
  const ids = planes.map((p) => p.id as string);
  const conteo: Record<string, number> = {};
  if (ids.length) {
    const { data: comidas } = await sb.from("comidas_plan").select("plan_id").in("plan_id", ids);
    (comidas ?? []).forEach((c) => {
      const k = c.plan_id as string;
      conteo[k] = (conteo[k] ?? 0) + 1;
    });
  }

  return planes.map((p) => {
    const m = p.miembros as unknown as { nombre?: string; foto_url?: string } | null;
    return {
      id: p.id as string,
      miembroId: p.miembro_id as string,
      miembroNombre: m?.nombre ?? "Miembro",
      miembroFoto: m?.foto_url ?? null,
      objetivo: p.objetivo as string,
      calorias: Number(p.calorias),
      proteina: Number(p.proteina_g),
      carbos: Number(p.carbos_g),
      grasa: Number(p.grasa_g),
      notas: (p.notas as string) ?? null,
      activo: p.activo as boolean,
      comidas: conteo[p.id as string] ?? 0,
    };
  });
}

export async function getMiembrosParaNutricion(): Promise<
  { id: string; nombre: string; fotoUrl: string | null }[]
> {
  const sb = getServerSupabase();
  const { data } = await sb.from("miembros").select("id,nombre,foto_url").order("nombre");
  return (data ?? []).map((m) => ({
    id: m.id as string,
    nombre: m.nombre as string,
    fotoUrl: (m.foto_url as string) ?? null,
  }));
}
