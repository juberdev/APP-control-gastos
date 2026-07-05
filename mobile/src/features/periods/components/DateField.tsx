import { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "../../../shared/theme";
import { formatShort, fromISODate, toISODate } from "../utils/date";

// Campo de fecha con selector nativo. Guarda/expone "YYYY-MM-DD".
export function DateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (iso: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <>
      <TouchableOpacity style={styles.field} onPress={() => setShow(true)}>
        <Text style={styles.text}>📅 {formatShort(value)}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={fromISODate(value)}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(_e, d) => {
            setShow(false);
            if (d) onChange(toISODate(d));
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  text: { color: colors.text, fontWeight: "600" },
});
