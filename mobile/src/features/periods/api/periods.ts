import { supabase } from "../../../services/supabase";
import type { Periodo } from "../types";

export async function fetchPeriodos(): Promise<Periodo[]> {
  const { data, error } = await supabase
    .from("periodos")
    .select("id, nombre, fecha_inicio, fecha_fin, estado")
    .order("fecha_inicio", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Periodo[];
}

// Apertura un nuevo periodo (queda 'abierto'). Solo puede haber uno abierto.
export async function openPeriodo(fechaInicio: string, nombre?: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { error } = await supabase.from("periodos").insert({
    user_id: user.id,
    fecha_inicio: fechaInicio,
    nombre: nombre?.trim() || null,
    estado: "abierto",
  });
  if (error) throw error;
}

// Cierra el periodo con su fecha de fin.
export async function closePeriodo(id: string, fechaFin: string): Promise<void> {
  const { error } = await supabase
    .from("periodos")
    .update({ estado: "cerrado", fecha_fin: fechaFin })
    .eq("id", id);
  if (error) throw error;
}
