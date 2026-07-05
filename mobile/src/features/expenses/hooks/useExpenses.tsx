import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Alert } from "react-native";
import { fetchTransactions } from "../api/expenses";
import { totalPEN } from "../utils/group";
import type { Transaction } from "../types";

interface ExpensesContextValue {
  txns: Transaction[];
  loading: boolean;
  total: number;
  load: () => Promise<void>;
}

const ExpensesContext = createContext<ExpensesContextValue | null>(null);

// Comparte las transacciones (y su carga) entre las pestañas Gastos y Resumen,
// evitando que cada pantalla vuelva a pedir los mismos datos.
export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setTxns(await fetchTransactions());
    } catch (e) {
      Alert.alert("Error", String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const total = useMemo(() => totalPEN(txns), [txns]);

  const value = useMemo<ExpensesContextValue>(
    () => ({ txns, loading, total, load }),
    [txns, loading, total, load],
  );

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
}

export function useExpenses(): ExpensesContextValue {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error("useExpenses debe usarse dentro de <ExpensesProvider>");
  return ctx;
}
