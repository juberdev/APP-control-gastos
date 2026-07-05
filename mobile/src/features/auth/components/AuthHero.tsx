import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../../shared/theme";

const HERO_HEIGHT = 260;

// Estrellas dispersas en el cielo (posiciones fijas para un look estable).
const STARS = [
  { top: 34, left: 44, size: 4 },
  { top: 70, left: 120, size: 3 },
  { top: 46, left: 210, size: 5 },
  { top: 96, left: 74, size: 3 },
  { top: 28, left: 280, size: 4 },
  { top: 120, left: 250, size: 3 },
  { top: 150, left: 40, size: 4 },
];

// Un pico de montaña nevada (triángulo).
function Mountain({
  w,
  h,
  color,
  style,
}: {
  w: number;
  h: number;
  color: string;
  style?: object;
}) {
  return (
    <View
      style={[
        {
          width: 0,
          height: 0,
          borderLeftWidth: w / 2,
          borderRightWidth: w / 2,
          borderBottomWidth: h,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: color,
        },
        style,
      ]}
    />
  );
}

// Ilustración nocturna de la cabecera de auth: cielo degradado, luna,
// estrellas, montañas nevadas y un muñeco de nieve.
export function AuthHero() {
  return (
    <View style={styles.hero} pointerEvents="none">
      <LinearGradient
        colors={[colors.primaryDark, colors.primary, colors.primaryLight]}
        style={StyleSheet.absoluteFill}
      />

      {STARS.map((s, i) => (
        <View
          key={i}
          style={[
            styles.star,
            { top: s.top, left: s.left, width: s.size, height: s.size, borderRadius: s.size },
          ]}
        />
      ))}

      <Text style={styles.moon}>🌙</Text>

      {/* Montañas nevadas apoyadas en la franja de nieve inferior */}
      <Mountain w={190} h={78} color="#e0e7ff" style={styles.mtnBack1} />
      <Mountain w={230} h={104} color="#eef2ff" style={styles.mtnFront} />
      <Mountain w={180} h={70} color="#e0e7ff" style={styles.mtnBack2} />

      <Text style={styles.snowman}>⛄</Text>

      {/* Franja de nieve que mezcla el hero con el formulario blanco */}
      <View style={styles.snow} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: HERO_HEIGHT, overflow: "hidden" },
  star: { position: "absolute", backgroundColor: "#fde68a" },
  moon: { position: "absolute", top: 26, right: 34, fontSize: 54 },
  mtnBack1: { position: "absolute", bottom: 22, left: -20 },
  mtnBack2: { position: "absolute", bottom: 22, right: -24 },
  mtnFront: { position: "absolute", bottom: 22, left: 80 },
  snowman: { position: "absolute", bottom: 30, right: 46, fontSize: 34 },
  snow: { position: "absolute", left: 0, right: 0, bottom: 0, height: 26, backgroundColor: colors.bg },
});
