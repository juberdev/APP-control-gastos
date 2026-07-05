import { type ReactNode } from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme";

// Cabecera con degradado morado (mismo lenguaje visual que la landing).
// Gestiona el inset superior para dibujar bajo la barra de estado.
export function GradientHeader({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={[colors.primaryDark, colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + 18 }]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
});
