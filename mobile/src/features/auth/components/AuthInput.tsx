import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors } from "../../../shared/theme";

// Input con ícono a la izquierda y línea inferior, estilo del mockup.
export function AuthInput({ icon, ...props }: TextInputProps & { icon: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>{icon}</Text>
      <TextInput style={styles.input} placeholderTextColor={colors.textFaint} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 22,
  },
  icon: { fontSize: 16, marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: colors.text, paddingVertical: 12 },
});
