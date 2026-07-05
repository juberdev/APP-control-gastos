import { supabase } from "../../../services/supabase";
import type { CatalogItem } from "../types";

type Tabla = "tipos" | "personas";

async function fetchList(tabla: Tabla): Promise<CatalogItem[]> {
  const { data, error } = await supabase
    .from(tabla)
    .select("id, nombre")
    .order("nombre", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

async function addItem(tabla: Tabla, nombre: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { error } = await supabase
    .from(tabla)
    .insert({ user_id: user.id, nombre: nombre.trim() });
  if (error) throw error;
}

async function updateItem(tabla: Tabla, id: string, nombre: string): Promise<void> {
  const { error } = await supabase
    .from(tabla)
    .update({ nombre: nombre.trim() })
    .eq("id", id);
  if (error) throw error;
}

// Los catálogos se pueden crear y editar (no eliminar), igual que los gastos.
export const fetchTipos = () => fetchList("tipos");
export const addTipo = (nombre: string) => addItem("tipos", nombre);
export const updateTipo = (id: string, nombre: string) => updateItem("tipos", id, nombre);

export const fetchPersonas = () => fetchList("personas");
export const addPersona = (nombre: string) => addItem("personas", nombre);
export const updatePersona = (id: string, nombre: string) => updateItem("personas", id, nombre);
