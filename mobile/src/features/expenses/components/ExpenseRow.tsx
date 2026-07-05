import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { colors } from "../../../shared/theme";
import { originLabel } from "../utils/group";
import type { Transaction } from "../types";

// Navegación mínima local hacia la pantalla de edición.
type Nav = NavigationProp<{ EditExpense: { id: string } }>;

// Fila de gasto. Tocar abre la edición (los registros se pueden editar,
// pero no eliminar).
export function ExpenseRow({ item }: { item: Transaction }) {
  const navigation = useNavigation<Nav>();
  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={() => navigation.navigate("EditExpense", { id: item.id })}
    >
      <View style={styles.left}>
        <Text style={styles.merchant}>{item.comercio ?? "Sin descripción"}</Text>
        <Text style={styles.meta}>
          {item.metodo ? `${item.metodo} · ` : ""}
          {item.persona ? `👤 ${item.persona} · ` : ""}
          {originLabel(item.origen)} · {new Date(item.fecha).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>
          {item.moneda === "USD" ? "$" : "S/"} {Number(item.monto).toFixed(2)}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  left: { flex: 1 },
  merchant: { color: colors.text, fontSize: 16, fontWeight: "600" },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  right: { flexDirection: "row", alignItems: "center" },
  amount: { color: colors.text, fontSize: 16, fontWeight: "700" },
  chevron: { color: colors.textFaint, fontSize: 22, marginLeft: 8, marginTop: -2 },
});
