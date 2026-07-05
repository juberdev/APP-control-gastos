// API pública del módulo de gastos.
export { ExpensesProvider, useExpenses } from "./hooks/useExpenses";
export { RegisterScreen } from "./screens/RegisterScreen";
export { DashboardScreen } from "./screens/DashboardScreen";
export { EditExpenseScreen } from "./screens/EditExpenseScreen";
export {
  fetchTransactions,
  addManualTransaction,
  updateTransaction,
  syncGmail,
} from "./api/expenses";
export { agruparPorTipo, originLabel, totalPEN } from "./utils/group";
export { METODOS, type Metodo, type Transaction, type Grupo } from "./types";
