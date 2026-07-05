import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../../../services/supabase";
import { GradientHeader } from "../../../shared/components";
import { useExpenses } from "../hooks/useExpenses";

// Cabecera del dashboard: total del periodo + salir, sobre el degradado morado.
export function PeriodHeader() {
  const { total } = useExpenses();
  return (
    <GradientHeader>
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Gastado este periodo (S/)</Text>
          <Text style={styles.total}>S/ {total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity onPress={() => supabase.auth.signOut()}>
          <Text style={styles.link}>Salir</Text>
        </TouchableOpacity>
      </View>
    </GradientHeader>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  label: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  total: { color: "#ffffff", fontSize: 36, fontWeight: "800", marginTop: 2 },
  link: { color: "rgba(255,255,255,0.95)", fontWeight: "700", marginTop: 6 },
});
