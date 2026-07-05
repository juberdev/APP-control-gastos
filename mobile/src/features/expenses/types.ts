export interface Transaction {
  id: string;
  origen: "gmail" | "yape" | "manual";
  metodo: string | null;
  persona: string | null;
  monto: number;
  moneda: string;
  comercio: string | null;
  fecha: string;
  card_id: string | null;
  periodo_id: string | null;
}

// Tipos de pago por defecto (fallback cuando el catálogo aún está vacío).
export const METODOS = ["BCP", "Interbank", "BBVA", "Yape"] as const;
export type Metodo = (typeof METODOS)[number];

// Agrupación de gastos por tipo para el resumen.
export interface Grupo {
  tipo: string;
  total: number;
  cantidad: number;
}
