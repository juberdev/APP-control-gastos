// Paleta única de la app (tema claro, alineado a la landing/login).
// Un solo lugar para tocar colores.
export const colors = {
  bg: "#f4f5fb",         // fondo general de la app
  surface: "#ffffff",    // tarjetas
  surfaceAlt: "#eef2ff", // relleno sutil (chips inactivos)
  border: "#e2e8f0",     // bordes de tarjetas / inputs
  track: "#e9ecf5",      // fondo de barras del resumen
  primary: "#6366f1",
  primaryDark: "#4f46e5",
  primaryLight: "#818cf8",
  sky: "#0ea5e9",
  text: "#1e293b",       // texto principal
  textMuted: "#64748b",  // texto secundario
  textFaint: "#94a3b8",  // placeholders / detalles
  textSubtle: "#475569",
  white: "#ffffff",
};

// Colores rotativos para las barras del resumen por tipo.
export const chartColors = [
  "#6366f1",
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#ec4899",
  "#a855f7",
];

export const chartColorAt = (i: number) => chartColors[i % chartColors.length];
