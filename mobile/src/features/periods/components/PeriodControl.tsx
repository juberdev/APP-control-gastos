import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../../shared/theme";
import { useConfirm } from "../../../shared/components";
import { usePeriods } from "../hooks/usePeriods";
import { periodoLabel, todayISO } from "../utils/date";
import { DateField } from "./DateField";

// Tarjeta para aperturar/cerrar el periodo activo.
export function PeriodControl() {
  const { activePeriodo, open, close } = usePeriods();
  const confirm = useConfirm();
  const [inicio, setInicio] = useState(todayISO());
  const [fin, setFin] = useState(todayISO());
  const [busy, setBusy] = useState(false);

  async function onOpen() {
    setBusy(true);
    try {
      await open(inicio);
    } catch (e) {
      Alert.alert("Error", String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onClose() {
    if (!activePeriodo) return;
    const ok = await confirm({
      title: "Cerrar periodo",
      message: `¿Seguro que quieres cerrar el periodo ${periodoLabel(
        activePeriodo.fecha_inicio,
        fin,
      )}? No podrás asociar más gastos a él.`,
      confirmLabel: "Cerrar periodo",
      destructive: true,
    });
    if (ok) confirmClose();
  }

  async function confirmClose() {
    if (!activePeriodo) return;
    setBusy(true);
    try {
      await close(activePeriodo.id, fin);
    } catch (e) {
      Alert.alert("Error", String(e));
    } finally {
      setBusy(false);
    }
  }

  if (activePeriodo) {
    return (
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.badge}>● Periodo abierto</Text>
            <Text style={styles.range}>{periodoLabel(activePeriodo.fecha_inicio, null)}</Text>
          </View>
          <DateField value={fin} onChange={setFin} />
        </View>
        <TouchableOpacity style={[styles.btn, styles.btnClose]} onPress={onClose} disabled={busy}>
          <Text style={styles.btnText}>{busy ? "..." : "Cerrar periodo"}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.badgeMuted}>Sin periodo abierto</Text>
          <Text style={styles.help}>Apertura uno para asociar tus gastos.</Text>
        </View>
        <DateField value={inicio} onChange={setInicio} />
      </View>
      <TouchableOpacity style={styles.btn} onPress={onOpen} disabled={busy}>
        <Text style={styles.btnText}>{busy ? "..." : "Aperturar periodo"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  badge: { color: "#16a34a", fontWeight: "700", fontSize: 13 },
  badgeMuted: { color: colors.textMuted, fontWeight: "700", fontSize: 13 },
  range: { color: colors.text, fontSize: 18, fontWeight: "800", marginTop: 2 },
  help: { color: colors.textFaint, fontSize: 12, marginTop: 2 },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  btnClose: { backgroundColor: colors.text },
  btnText: { color: colors.white, fontWeight: "700" },
});
