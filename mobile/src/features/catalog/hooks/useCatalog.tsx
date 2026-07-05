import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchPersonas, fetchTipos } from "../api/catalog";
import type { CatalogItem } from "../types";

interface CatalogContextValue {
  tipos: CatalogItem[];
  personas: CatalogItem[];
  reloadTipos: () => Promise<void>;
  reloadPersonas: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

// Comparte los catálogos (tipos y personas) entre el formulario de gasto y
// los mantenedores, evitando recargas duplicadas.
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [tipos, setTipos] = useState<CatalogItem[]>([]);
  const [personas, setPersonas] = useState<CatalogItem[]>([]);

  const reloadTipos = useCallback(async () => {
    try {
      setTipos(await fetchTipos());
    } catch {
      // Si la tabla aún no existe (migración pendiente), dejamos la lista vacía.
    }
  }, []);

  const reloadPersonas = useCallback(async () => {
    try {
      setPersonas(await fetchPersonas());
    } catch {
      // idem
    }
  }, []);

  useEffect(() => {
    reloadTipos();
    reloadPersonas();
  }, [reloadTipos, reloadPersonas]);

  const value = useMemo<CatalogContextValue>(
    () => ({ tipos, personas, reloadTipos, reloadPersonas }),
    [tipos, personas, reloadTipos, reloadPersonas],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog debe usarse dentro de <CatalogProvider>");
  return ctx;
}
