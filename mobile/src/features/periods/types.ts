export interface Periodo {
  id: string;
  nombre: string | null;
  fecha_inicio: string; // YYYY-MM-DD
  fecha_fin: string | null;
  estado: "abierto" | "cerrado";
}
