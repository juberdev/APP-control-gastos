import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn>(async () => false);

interface Pending {
  options: ConfirmOptions;
  resolve: (ok: boolean) => void;
}

// Modal de confirmación propio (mismo diseño en web y celular).
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);

  const confirm = useCallback<ConfirmFn>(
    (options) => new Promise<boolean>((resolve) => setPending({ options, resolve })),
    [],
  );

  function answer(ok: boolean) {
    pending?.resolve(ok);
    setPending(null);
  }

  const o = pending?.options;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal visible={!!pending} transparent animationType="fade" onRequestClose={() => answer(false)}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <Text style={styles.icon}>{o?.destructive ? "⚠️" : "❓"}</Text>
            <Text style={styles.title}>{o?.title}</Text>
            <Text style={styles.message}>{o?.message}</Text>

            <View style={styles.actions}>
              <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={() => answer(false)}>
                <Text style={styles.cancelText}>{o?.cancelLabel ?? "Cancelar"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, o?.destructive ? styles.danger : styles.confirm]}
                onPress={() => answer(true)}
              >
                <Text style={styles.confirmText}>{o?.confirmLabel ?? "Confirmar"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  icon: { fontSize: 34, marginBottom: 10 },
  title: { color: colors.text, fontSize: 19, fontWeight: "800", textAlign: "center" },
  message: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },
  actions: { flexDirection: "row", gap: 10, marginTop: 22, alignSelf: "stretch" },
  btn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  cancel: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  cancelText: { color: colors.textMuted, fontWeight: "700" },
  confirm: { backgroundColor: colors.primary },
  danger: { backgroundColor: "#ef4444" },
  confirmText: { color: colors.white, fontWeight: "700" },
});
