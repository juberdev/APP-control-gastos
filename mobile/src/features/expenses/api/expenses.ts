import * as Crypto from "expo-crypto";
import { supabase } from "../../../services/supabase";
import type { Transaction } from "../types";

// Trae las transacciones del usuario (RLS garantiza que solo vea las suyas).
export async function fetchTransactions(limit = 50): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("id, origen, metodo, persona, monto, moneda, comercio, fecha, card_id, periodo_id")
    .order("fecha", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// Registro manual de un gasto. La fecha se pone automática (ahora).
export async function addManualTransaction(input: {
  monto: number;
  metodo: string;
  descripcion?: string;
  persona?: string;
  periodoId?: string | null;
  moneda?: string;
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    origen: input.metodo === "Yape" ? "yape" : "manual",
    metodo: input.metodo,
    persona: input.persona?.trim() || null,
    periodo_id: input.periodoId ?? null,
    monto: input.monto,
    moneda: input.moneda ?? "PEN",
    comercio: input.descripcion?.trim() || null,
    fecha: new Date().toISOString(),
    dedupe_key: `manual:${Crypto.randomUUID()}`,
  });
  if (error) throw error;
}

// Edita un gasto existente. Los registros se pueden editar pero NO eliminar,
// por eso no hay una función de borrado.
export async function updateTransaction(
  id: string,
  input: { monto: number; metodo: string; descripcion?: string; persona?: string },
): Promise<void> {
  const { error } = await supabase
    .from("transactions")
    .update({
      monto: input.monto,
      metodo: input.metodo,
      persona: input.persona?.trim() || null,
      comercio: input.descripcion?.trim() || null,
    })
    .eq("id", id);
  if (error) throw error;
}

// Dispara la sincronización de correos (Edge Function gmail-sync).
export async function syncGmail(): Promise<{ revisados: number; insertados: number }> {
  const { data, error } = await supabase.functions.invoke("gmail-sync", { body: {} });
  if (error) throw error;
  return data;
}
