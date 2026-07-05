import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../../shared/theme";
import { METODOS } from "../types";

export interface ExpenseFormValues {
  monto: number;
  metodo: string;
  descripcion: string;
  persona: string;
}

// Formulario compartido para registrar y editar un gasto.
export function ExpenseForm({
  initial,
  submitLabel,
  tipos,
  personas,
  onSubmit,
}: {
  initial?: { monto?: string; metodo?: string; descripcion?: string; persona?: string };
  submitLabel: string;
  tipos: string[];
  personas: string[];
  onSubmit: (values: ExpenseFormValues) => Promise<void>;
}) {
  // Si el catálogo de tipos aún está vacío, usamos los por defecto.
  const tipoOptions = tipos.length ? tipos : [...METODOS];

  const [monto, setMonto] = useState(initial?.monto ?? "");
  const [metodo, setMetodo] = useState<string>(initial?.metodo ?? tipoOptions[0]);
  const [persona, setPersona] = useState<string>(initial?.persona ?? "");
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    const value = Number(monto.replace(",", "."));
    if (!value || value <= 0) {
      Alert.alert("Monto inválido", "Ingresa un monto mayor a 0.");
      return;
    }
    setBusy(true);
    try {
      await onSubmit({ monto: value, metodo, descripcion, persona });
    } catch (e) {
      Alert.alert("Error", String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View>
      <Text style={styles.label}>Monto (S/)</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        placeholderTextColor={colors.textFaint}
        keyboardType="decimal-pad"
        value={monto}
        onChangeText={setMonto}
      />

      <Text style={styles.label}>Tipo</Text>
      <View style={styles.chips}>
        {tipoOptions.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, metodo === t && styles.chipActive]}
            onPress={() => setMetodo(t)}
          >
            <Text style={[styles.chipText, metodo === t && styles.chipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Persona</Text>
      {personas.length === 0 ? (
        <Text style={styles.hint}>Agrega personas en la pestaña Personas.</Text>
      ) : (
        <View style={styles.chips}>
          {personas.map((p) => {
            const active = persona === p;
            return (
              <TouchableOpacity
                key={p}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setPersona(active ? "" : p)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{p}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. Almuerzo, Uber, mercado..."
        placeholderTextColor={colors.textFaint}
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <TouchableOpacity style={styles.btn} disabled={busy} onPress={save} activeOpacity={0.85}>
        <Text style={styles.btnText}>{busy ? "Guardando..." : submitLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.textMuted, fontSize: 13, marginBottom: 6, marginTop: 6 },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSubtle, fontWeight: "600" },
  chipTextActive: { color: colors.white },
  hint: { color: colors.textFaint, fontSize: 13, marginBottom: 12 },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },
  btnText: { color: colors.white, fontWeight: "700", fontSize: 16 },
});
