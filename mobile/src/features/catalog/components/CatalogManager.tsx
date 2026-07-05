import { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../../shared/theme";
import { GradientHeader } from "../../../shared/components";
import type { CatalogItem } from "../types";

// Mantenedor genérico: agregar y editar elementos (no eliminar).
export function CatalogManager({
  title,
  subtitle,
  placeholder,
  items,
  onAdd,
  onUpdate,
}: {
  title: string;
  subtitle: string;
  placeholder: string;
  items: CatalogItem[];
  onAdd: (nombre: string) => Promise<void>;
  onUpdate: (id: string, nombre: string) => Promise<void>;
}) {
  const [nuevo, setNuevo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [busy, setBusy] = useState(false);

  async function add() {
    const nombre = nuevo.trim();
    if (!nombre) return;
    setBusy(true);
    try {
      await onAdd(nombre);
      setNuevo("");
    } catch (e) {
      Alert.alert("Error", String(e));
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit() {
    const nombre = editValue.trim();
    if (!nombre || !editingId) return;
    setBusy(true);
    try {
      await onUpdate(editingId, nombre);
      setEditingId(null);
      setEditValue("");
    } catch (e) {
      Alert.alert("Error", String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.screen}>
      <GradientHeader>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </GradientHeader>

      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          placeholder={placeholder}
          placeholderTextColor={colors.textFaint}
          value={nuevo}
          onChangeText={setNuevo}
          onSubmitEditing={add}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addBtn} onPress={add} disabled={busy}>
          <Text style={styles.addBtnText}>＋</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Aún no hay elementos. Agrega el primero arriba.</Text>
        }
        renderItem={({ item }) =>
          editingId === item.id ? (
            <View style={styles.rowEdit}>
              <TextInput
                style={styles.editInput}
                value={editValue}
                onChangeText={setEditValue}
                autoFocus
                onSubmitEditing={saveEdit}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={saveEdit}>
                <Text style={styles.save}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingId(null)}>
                <Text style={styles.cancel}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => {
                setEditingId(item.id);
                setEditValue(item.nombre);
              }}
            >
              <Text style={styles.rowText}>{item.nombre}</Text>
              <Text style={styles.edit}>✏️</Text>
            </TouchableOpacity>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  title: { color: colors.white, fontSize: 26, fontWeight: "800" },
  subtitle: { color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 4 },

  addRow: { flexDirection: "row", gap: 10, padding: 20, paddingBottom: 8 },
  addInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  addBtn: {
    width: 52,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { color: colors.white, fontSize: 24, fontWeight: "700" },

  list: { paddingHorizontal: 20, paddingBottom: 20 },
  empty: { color: colors.textFaint, textAlign: "center", marginTop: 24 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  rowText: { color: colors.text, fontSize: 16, fontWeight: "600" },
  edit: { fontSize: 16 },
  rowEdit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  editInput: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: 6 },
  save: { color: colors.primary, fontWeight: "700" },
  cancel: { color: colors.textFaint, fontSize: 18, paddingHorizontal: 4 },
});
