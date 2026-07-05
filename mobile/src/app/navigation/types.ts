// Rutas tipadas para React Navigation.
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Main: undefined;
  EditExpense: { id: string };
};

export type MainTabParamList = {
  Registrar: undefined;
  Dashboard: undefined;
  Tipos: undefined;
  Personas: undefined;
};
