import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../../../services/supabase";
import { GradientHeader } from "../../../shared/components";

// Cabecera del dashboard: total (ya filtrado) + rango del periodo + salir.
export function PeriodHeader({ total, subtitle }: { total: number; subtitle?: string }) {
  return (
    <GradientHeader>
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Gastado {subtitle ? `· ${subtitle}` : "este periodo"}</Text>
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
