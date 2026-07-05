import { CatalogManager } from "../components/CatalogManager";
import { addTipo, updateTipo } from "../api/catalog";
import { useCatalog } from "../hooks/useCatalog";

// Mantenedor de Tipos (formas de pago).
export function TiposScreen() {
  const { tipos, reloadTipos } = useCatalog();
  return (
    <CatalogManager
      title="Tipos"
      subtitle="Formas de pago para tus gastos"
      placeholder="Ej. BCP, Yape, Efectivo..."
      items={tipos}
      onAdd={async (nombre) => {
        await addTipo(nombre);
        await reloadTipos();
      }}
      onUpdate={async (id, nombre) => {
        await updateTipo(id, nombre);
        await reloadTipos();
      }}
    />
  );
}
