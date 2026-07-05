import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { closePeriodo, fetchPeriodos, openPeriodo } from "../api/periods";
import type { Periodo } from "../types";

interface PeriodsContextValue {
  periodos: Periodo[];
  activePeriodo: Periodo | null;
  reload: () => Promise<void>;
  open: (fechaInicio: string) => Promise<void>;
  close: (id: string, fechaFin: string) => Promise<void>;
}

const PeriodsContext = createContext<PeriodsContextValue | null>(null);

export function PeriodsProvider({ children }: { children: ReactNode }) {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);

  const reload = useCallback(async () => {
    try {
      setPeriodos(await fetchPeriodos());
    } catch {
      // tabla aún no creada (migración pendiente) → lista vacía
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const open = useCallback(
    async (fechaInicio: string) => {
      await openPeriodo(fechaInicio);
      await reload();
    },
    [reload],
  );

  const close = useCallback(
    async (id: string, fechaFin: string) => {
      await closePeriodo(id, fechaFin);
      await reload();
    },
    [reload],
  );

  const activePeriodo = useMemo(
    () => periodos.find((p) => p.estado === "abierto") ?? null,
    [periodos],
  );

  const value = useMemo<PeriodsContextValue>(
    () => ({ periodos, activePeriodo, reload, open, close }),
    [periodos, activePeriodo, reload, open, close],
  );

  return <PeriodsContext.Provider value={value}>{children}</PeriodsContext.Provider>;
}

export function usePeriods(): PeriodsContextValue {
  const ctx = useContext(PeriodsContext);
  if (!ctx) throw new Error("usePeriods debe usarse dentro de <PeriodsProvider>");
  return ctx;
}
