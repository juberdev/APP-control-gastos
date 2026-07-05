import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../../shared/theme";
import { useGmailConnect } from "../../gmail";
import { syncGmail } from "../api/expenses";
import { useExpenses } from "../hooks/useExpenses";

// Acciones de ingesta desde correo: conectar Gmail y sincronizar.
export function SyncActions() {
  const { load } = useExpenses();
  const { connect } = useGmailConnect((msg) => Alert.alert("Gmail", msg));

  async function onSync() {
    try {
      const r = await syncGmail();
      Alert.alert("Sincronizado", `Insertadas ${r.insertados} de ${r.revisados}`);
      load();
    } catch (e) {
      Alert.alert("Error al sincronizar", String(e));
    }
  }

  return (
    <View>
      <TouchableOpacity style={styles.connectBtn} onPress={() => connect()}>
        <Text style={styles.text}>📧 Conectar Gmail</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.syncBtn} onPress={onSync}>
        <Text style={styles.text}>↻ Sincronizar correos</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  connectBtn: { backgroundColor: colors.sky, borderRadius: 12, padding: 14, marginTop: 20 },
  syncBtn: { backgroundColor: colors.primary, borderRadius: 12, padding: 14, marginTop: 10 },
  text: { color: colors.white, textAlign: "center", fontWeight: "600" },
});
