import { StatusBar } from "expo-status-bar";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "../shared/theme";
import { ConfirmProvider } from "../shared/components";
import { AuthProvider } from "./providers/AuthProvider";
import { RootNavigator } from "./navigation/RootNavigator";

// Tema de navegación alineado a la paleta clara de la app.
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.surface,
    border: colors.border,
    primary: colors.primary,
    text: colors.text,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ConfirmProvider>
          <NavigationContainer theme={navTheme}>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
        </ConfirmProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
