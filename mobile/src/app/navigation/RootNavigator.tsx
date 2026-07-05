import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../../shared/theme";
import { LoginScreen, SignupScreen } from "../../features/auth";
import { CatalogProvider } from "../../features/catalog";
import { EditExpenseScreen, ExpensesProvider } from "../../features/expenses";
import { useAuth } from "../providers/AuthProvider";
import { TabNavigator } from "./TabNavigator";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

// Decide entre el flujo de autenticación y la app según la sesión.
export function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
      </Stack.Navigator>
    );
  }

  // Autenticado: los gastos viven en un provider que envuelve tanto las
  // pestañas como la pantalla de edición, para compartir los mismos datos.
  return (
    <ExpensesProvider>
      <CatalogProvider>
        <Stack.Navigator>
          <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen
            name="EditExpense"
            component={EditExpenseScreen}
            options={{
              presentation: "modal",
              title: "Editar gasto",
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.text,
            }}
          />
        </Stack.Navigator>
      </CatalogProvider>
    </ExpensesProvider>
  );
}
