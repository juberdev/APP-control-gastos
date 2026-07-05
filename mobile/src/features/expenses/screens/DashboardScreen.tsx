import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { colors } from "../../../shared/theme";
import { useCatalog } from "../../catalog";
import { PeriodControl, periodoLabel, usePeriods } from "../../periods";
import { ExpenseRow } from "../components/ExpenseRow";
import { FilterRow } from "../components/FilterRow";
import { PeriodHeader } from "../components/PeriodHeader";
import { SummaryGroup } from "../components/SummaryGroup";
import { useExpenses } from "../hooks/useExpenses";
import { agruparPorTipo, totalPEN } from "../utils/group";

// Pestaña "Dashboard": periodo + filtros (periodo/persona/tipo) + resumen.
export function DashboardScreen() {
  const { txns, loading, load } = useExpenses();
  const { tipos, personas } = useCatalog();
  const { periodos, activePeriodo } = usePeriods();

  const [fPeriodo, setFPeriodo] = useState<string | null>(null);
  const [fPersona, setFPersona] = useState<string | null>(null);
  const [fTipo, setFTipo] = useState<string | null>(null);
  const [touchedPeriodo, setTouchedPeriodo] = useState(false);

  // Por defecto muestra el periodo abierto (hasta que el usuario cambie el filtro).
  useEffect(() => {
    if (!touchedPeriodo && activePeriodo) setFPeriodo(activePeriodo.id);
  }, [activePeriodo, touchedPeriodo]);

  const filtered = useMemo(
    () =>
      txns.filter(
        (t) =>
          (fPeriodo === null || t.periodo_id === fPeriodo) &&
          (fPersona === null || t.persona === fPersona) &&
          (fTipo === null || t.metodo === fTipo),
      ),
    [txns, fPeriodo, fPersona, fTipo],
  );

  const { grupos, total } = useMemo(() => agruparPorTipo(filtered), [filtered]);
  const totalFiltrado = useMemo(() => totalPEN(filtered), [filtered]);

  const subtitle = useMemo(() => {
    if (!fPeriodo) return "todos";
    const p = periodos.find((x) => x.id === fPeriodo);
    return p ? periodoLabel(p.fecha_inicio, p.fecha_fin) : undefined;
  }, [fPeriodo, periodos]);

  const listHeader = (
    <View>
      <PeriodControl />

      <FilterRow
        label="PERIODO"
        value={fPeriodo}
        onChange={(v) => {
          setTouchedPeriodo(true);
          setFPeriodo(v);
        }}
        options={periodos.map((p) => ({
          key: p.id,
          label: periodoLabel(p.fecha_inicio, p.fecha_fin),
        }))}
      />
      <FilterRow
        label="PERSONA"
        value={fPersona}
        onChange={setFPersona}
        options={personas.map((p) => ({ key: p.nombre, label: p.nombre }))}
      />
      <FilterRow
        label="TIPO"
        value={fTipo}
        onChange={setFTipo}
        options={tipos.map((t) => ({ key: t.nombre, label: t.nombre }))}
      />

      <Text style={styles.section}>Por tipo de gasto</Text>
      {grupos.length === 0 ? (
        <Text style={styles.empty}>Sin gastos para este filtro.</Text>
      ) : (
        grupos.map((g, i) => (
          <SummaryGroup key={g.tipo} grupo={g} total={total} index={i} />
        ))
      )}

      <Text style={styles.section}>Gastos</Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <PeriodHeader total={totalFiltrado} subtitle={subtitle} />
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(t) => t.id}
          onRefresh={load}
          refreshing={loading}
          contentContainerStyle={styles.body}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <Text style={styles.empty}>No hay gastos para el filtro seleccionado.</Text>
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
