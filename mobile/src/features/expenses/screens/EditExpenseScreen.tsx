import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  useNavigation,
  useRoute,
  type NavigationProp,
  type RouteProp,
} from "@react-navigation/native";
import { colors } from "../../../shared/theme";
import { useCatalog } from "../../catalog";
import { ExpenseForm } from "../components/ExpenseForm";
import { updateTransaction } from "../api/expenses";
import { useExpenses } from "../hooks/useExpenses";
import { originLabel } from "../utils/group";

type EditNav = NavigationProp<{ EditExpense: { id: string } }>;
type EditRoute = RouteProp<{ EditExpense: { id: string } }, "EditExpense">;

// Pantalla de edición de un gasto. Se puede editar, pero no eliminar.
export function EditExpenseScreen() {
  const navigation = useNavigation<EditNav>();
  const { params } = useRoute<EditRoute>();
  const { txns, load } = useExpenses();
  const { tipos, personas } = useCatalog();
  const txn = txns.find((t) => t.id === params.id);

  if (!txn) {
    return (
      <View style={styles.center}>
        <Text style={styles.missing}>Este gasto ya no está disponible.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.body}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.meta}>
        {originLabel(txn.origen)} · {new Date(txn.fecha).toLocaleDateString()}
      </Text>
      <ExpenseForm
        initial={{
          monto: String(txn.monto),
          metodo: txn.metodo ?? undefined,
          descripcion: txn.comercio ?? "",
          persona: txn.persona ?? "",
        }}
        submitLabel="Guardar cambios"
        tipos={tipos.map((t) => t.nombre)}
        personas={personas.map((p) => p.nombre)}
        onSubmit={async ({ monto, metodo, descripcion, persona }) => {
          await updateTransaction(txn.id, { monto, metodo, descripcion, persona });
          await load();
          Alert.alert("Actualizado", "Los cambios se guardaron.");
          navigation.goBack();
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20 },
  meta: { color: colors.textMuted, fontSize: 13, marginBottom: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg },
  missing: { color: colors.textMuted, fontSize: 15 },
});
