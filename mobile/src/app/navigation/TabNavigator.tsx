import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { colors } from "../../shared/theme";
import { DashboardScreen, RegisterScreen } from "../../features/expenses";
import { PersonasScreen, TiposScreen } from "../../features/catalog";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabIcon = (emoji: string) => (color: string) =>
  <Text style={{ fontSize: 20, color }}>{emoji}</Text>;

// Barra de navegación inferior: registrar, dashboard y los mantenedores.
export function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen
        name="Registrar"
        component={RegisterScreen}
        options={{ tabBarIcon: ({ color }) => tabIcon("➕")(color) }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarIcon: ({ color }) => tabIcon("📊")(color) }}
      />
      <Tab.Screen
        name="Tipos"
        component={TiposScreen}
        options={{ tabBarIcon: ({ color }) => tabIcon("🏷️")(color) }}
      />
      <Tab.Screen
        name="Personas"
        component={PersonasScreen}
        options={{ tabBarIcon: ({ color }) => tabIcon("👤")(color) }}
      />
    </Tab.Navigator>
  );
}
