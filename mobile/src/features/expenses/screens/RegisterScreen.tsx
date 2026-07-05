import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { colors } from "../../../shared/theme";
import { GradientHeader } from "../../../shared/components";
import { useCatalog } from "../../catalog";
import { ExpenseForm } from "../components/ExpenseForm";
import { addManualTransaction } from "../api/expenses";
import { useExpenses } from "../hooks/useExpenses";

type Nav = NavigationProp<{ Registrar: undefined; Dashboard: undefined }>;

// Pestaña "Registrar": alta de un gasto manual, con el header de la landing.
export function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { load } = useExpenses();
  const { tipos, personas } = useCatalog();

  return (
    <View style={styles.screen}>
      <GradientHeader>
        <Text style={styles.title}>Registrar gasto</Text>
        <Text style={styles.subtitle}>Agrega un gasto manualmente</Text>
      </GradientHeader>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <ExpenseForm
          submitLabel="Guardar gasto"
          tipos={tipos.map((t) => t.nombre)}
          personas={personas.map((p) => p.nombre)}
          onSubmit={async ({ monto, metodo, descripcion, persona }) => {
            await addManualTransaction({ monto, metodo, descripcion, persona });
            await load();
            Alert.alert("Guardado", "Tu gasto se registró.");
            navigation.navigate("Dashboard");
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  title: { color: "#ffffff", fontSize: 26, fontWeight: "800" },
  subtitle: { color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 4 },
  body: { padding: 20 },
});
