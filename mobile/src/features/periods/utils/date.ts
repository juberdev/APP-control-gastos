// Fecha local -> "YYYY-MM-DD" (sin corrimiento por zona horaria).
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// "YYYY-MM-DD" -> Date local (mediodía para evitar saltos de día).
export function fromISODate(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

export const todayISO = () => toISODate(new Date());

// "YYYY-MM-DD" -> "DD/MM".
export function formatShort(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

// Etiqueta de rango de un periodo: "05/07 → en curso" o "25/06 → 28/07".
export function periodoLabel(inicio: string, fin: string | null): string {
  return `${formatShort(inicio)} → ${fin ? formatShort(fin) : "en curso"}`;
}
