import { StyleSheet, Text, View } from "react-native";
import { chartColorAt, colors } from "../../../shared/theme";
import type { Grupo } from "../types";

// Una fila del resumen: tipo, monto, barra proporcional y % del total.
export function SummaryGroup({
  grupo,
  total,
  index,
}: {
  grupo: Grupo;
  total: number;
  index: number;
}) {
  const pct = total > 0 ? (grupo.total / total) * 100 : 0;
  const color = chartColorAt(index);
  return (
    <View style={styles.grupo}>
      <View style={styles.head}>
        <View style={styles.titulo}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={styles.tipo}>{grupo.tipo}</Text>
          <Text style={styles.count}>· {grupo.cantidad}</Text>
        </View>
        <Text style={styles.monto}>S/ {grupo.total.toFixed(2)}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.pct}>{pct.toFixed(1)}% del total</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  titulo: { flexDirection: "row", alignItems: "center", flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  tipo: { color: colors.text, fontSize: 16, fontWeight: "600" },
  count: { color: colors.textFaint, fontSize: 13, marginLeft: 6 },
  monto: { color: colors.text, fontSize: 16, fontWeight: "700" },
  track: { height: 8, borderRadius: 999, backgroundColor: colors.track, overflow: "hidden" },
  fill: { height: 8, borderRadius: 999 },
  pct: { color: colors.textMuted, fontSize: 12, marginTop: 6 },
});
