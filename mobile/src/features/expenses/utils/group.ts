import type { Grupo, Transaction } from "../types";

export const originLabel = (o: string) =>
  o === "gmail" ? "📧 Correo" : o === "yape" ? "📱 Yape" : "✍️ Manual";

// Agrupa las transacciones en PEN por su tipo/método de pago,
// ordenadas de mayor a menor gasto. Devuelve también el total.
export function agruparPorTipo(txns: Transaction[]): { grupos: Grupo[]; total: number } {
  const mapa = new Map<string, Grupo>();
  let total = 0;
  for (const t of txns) {
    if (t.moneda !== "PEN") continue;
    const tipo = t.metodo?.trim() || originLabel(t.origen);
    const monto = Number(t.monto);
    total += monto;
    const g = mapa.get(tipo) ?? { tipo, total: 0, cantidad: 0 };
    g.total += monto;
    g.cantidad += 1;
    mapa.set(tipo, g);
  }
  const grupos = [...mapa.values()].sort((a, b) => b.total - a.total);
  return { grupos, total };
}

// Total de gastos en PEN (el periodo actual mostrado en el header).
export const totalPEN = (txns: Transaction[]) =>
  txns.filter((t) => t.moneda === "PEN").reduce((s, t) => s + Number(t.monto), 0);
