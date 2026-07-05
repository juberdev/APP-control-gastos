import { CatalogManager } from "../components/CatalogManager";
import { addPersona, updatePersona } from "../api/catalog";
import { useCatalog } from "../hooks/useCatalog";

// Mantenedor de Personas (nombres asociados a un gasto).
export function PersonasScreen() {
  const { personas, reloadPersonas } = useCatalog();
  return (
    <CatalogManager
      title="Personas"
      subtitle="Nombres asociados a tus gastos"
      placeholder="Ej. Juan, Mamá, Roommate..."
      items={personas}
      onAdd={async (nombre) => {
        await addPersona(nombre);
        await reloadPersonas();
      }}
      onUpdate={async (id, nombre) => {
        await updatePersona(id, nombre);
        await reloadPersonas();
      }}
    />
  );
}
