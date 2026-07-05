import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { supabase } from "../../../services/supabase";
import { colors } from "../../../shared/theme";
import { AuthHero } from "../components/AuthHero";
import { AuthInput } from "../components/AuthInput";

type AuthNav = NavigationProp<{ Login: undefined; Signup: undefined }>;

export function LoginScreen() {
  const navigation = useNavigation<AuthNav>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function login() {
    if (!email.trim() || !password) {
      Alert.alert("Faltan datos", "Ingresa tu correo y contraseña.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) Alert.alert("Error", error.message);
  }

  async function forgot() {
    if (!email.trim()) {
      Alert.alert("Correo requerido", "Escribe tu correo para enviarte el enlace.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    Alert.alert(
      error ? "Error" : "Revisa tu correo",
      error ? error.message : "Te enviamos un enlace para restablecer tu contraseña.",
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AuthHero />

        <View style={styles.form}>
          <Text style={styles.brand}>💳 Mis Gastos</Text>

          <AuthInput
            icon="👤"
            placeholder="Correo / usuario"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <AuthInput
            icon="🔒"
            placeholder="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.btn, busy && styles.btnBusy]}
            disabled={busy}
            onPress={login}
            activeOpacity={0.85}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.btnText}>Ingresar</Text>
            )}
          </TouchableOpacity>

          <View style={styles.links}>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.link}>Regístrate</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={forgot}>
              <Text style={styles.linkMuted}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  form: { paddingHorizontal: 28, paddingTop: 8, paddingBottom: 40 },
  brand: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.primaryDark,
    textAlign: "center",
    marginBottom: 28,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 6,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  btnBusy: { opacity: 0.85 },
  btnText: { color: colors.white, fontWeight: "700", fontSize: 16, letterSpacing: 2 },
  links: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  link: { color: colors.primaryDark, fontWeight: "700", fontSize: 14 },
  linkMuted: { color: colors.textFaint, fontSize: 14 },
});
