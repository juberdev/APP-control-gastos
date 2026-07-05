import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { colors } from "../../../shared/theme";
import { ExpenseRow } from "../components/ExpenseRow";
import { PeriodHeader } from "../components/PeriodHeader";
import { SummaryGroup } from "../components/SummaryGroup";
import { useExpenses } from "../hooks/useExpenses";
import { agruparPorTipo } from "../utils/group";

// Pestaña "Dashboard": header con degradado + gastos agrupados por tipo
// y la lista de los últimos gastos.
export function DashboardScreen() {
  const { txns, loading, load } = useExpenses();
  const { grupos, total } = agruparPorTipo(txns);

  const listHeader = (
    <View>
      <Text style={styles.section}>Por tipo de gasto</Text>
      {grupos.length === 0 ? (
        <Text style={styles.empty}>Aún no hay gastos que resumir.</Text>
      ) : (
        grupos.map((g, i) => (
          <SummaryGroup key={g.tipo} grupo={g} total={total} index={i} />
        ))
      )}

      <Text style={styles.section}>Últimos gastos</Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <PeriodHeader />
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={txns}
          keyExtractor={(t) => t.id}
          onRefresh={load}
          refreshing={loading}
          contentContainerStyle={styles.body}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <Text style={styles.empty}>Aún no hay gastos. Registra uno en la pestaña Registrar.</Text>
          }
          renderItem={({ item }) => <ExpenseRow item={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20 },
  section: { color: colors.textMuted, fontSize: 13, marginTop: 18, marginBottom: 12 },
  empty: { color: colors.textFaint, textAlign: "center", marginTop: 20, marginBottom: 10 },
});
