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

export function SignupScreen() {
  const navigation = useNavigation<AuthNav>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function signup() {
    if (!email.trim() || !password) {
      Alert.alert("Faltan datos", "Ingresa tu correo y contraseña.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Contraseña corta", "Usa al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("No coincide", "Las contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    Alert.alert("Cuenta creada", "Revisa tu correo para confirmar.", [
      { text: "Ir a ingresar", onPress: () => navigation.navigate("Login") },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AuthHero />

        <View style={styles.form}>
          <Text style={styles.brand}>Crear cuenta</Text>

          <AuthInput
            icon="👤"
            placeholder="Correo"
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
          <AuthInput
            icon="✅"
            placeholder="Confirmar contraseña"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />

          <TouchableOpacity
            style={[styles.btn, busy && styles.btnBusy]}
            disabled={busy}
            onPress={signup}
            activeOpacity={0.85}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.btnText}>Crear cuenta</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.switch} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.switchText}>
              ¿Ya tienes cuenta? <Text style={styles.switchStrong}>Ingresa</Text>
            </Text>
          </TouchableOpacity>
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
  switch: { marginTop: 20, alignItems: "center" },
  switchText: { color: colors.textFaint, fontSize: 14 },
  switchStrong: { color: colors.primaryDark, fontWeight: "700" },
});
