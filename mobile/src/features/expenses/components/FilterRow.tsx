import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors } from "../../../shared/theme";

export interface FilterOption {
  key: string;
  label: string;
}

// Fila de filtro: etiqueta + chips horizontales con opción "Todos".
export function FilterRow({
  label,
  options,
  value,
  onChange,
  allLabel = "Todos",
}: {
  label: string;
  options: FilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  allLabel?: string;
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <Chip active={value === null} text={allLabel} onPress={() => onChange(null)} />
        {options.map((o) => (
          <Chip
            key={o.key}
            active={value === o.key}
            text={o.label}
            onPress={() => onChange(o.key)}
          />
        ))}
      </ScrollView>
    </>
  );
}

function Chip({
  active,
  text,
  onPress,
}: {
  active: boolean;
  text: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.textMuted, fontSize: 12, marginBottom: 8, marginTop: 4 },
  chips: { gap: 8, paddingRight: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSubtle, fontWeight: "600", fontSize: 13 },
  chipTextActive: { color: colors.white },
});
