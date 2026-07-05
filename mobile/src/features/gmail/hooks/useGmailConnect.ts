import { useCallback } from "react";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../../../services/supabase";

WebBrowser.maybeCompleteAuthSession();

// El Client ID NO es secreto (puede ir en la app). El Secret vive en el backend.
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!;
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;

// Google redirige AQUÍ (URL https válida para un cliente Web). La Edge Function
// intercambia el code, guarda el refresh_token y hace bounce de vuelta a la app.
const CONNECT_URL = `${SUPABASE_URL}/functions/v1/gmail-connect`;
const RETURN_URL = "misgastos://gmail-connected";

export interface UseGmailConnect {
  connect: () => Promise<void>;
}

// Abre el consentimiento de Google en un navegador in-app y espera el regreso.
export function useGmailConnect(onResult: (msg: string) => void): UseGmailConnect {
  const connect = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      onResult("Inicia sesión antes de conectar Gmail.");
      return;
    }

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: CONNECT_URL,
      response_type: "code",
      scope: "openid email https://www.googleapis.com/auth/gmail.readonly",
      access_type: "offline",
      prompt: "consent",
      // `state` identifica al usuario en la Edge Function (su JWT de Supabase).
      state: session.access_token,
    });
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    try {
      const result = await WebBrowser.openAuthSessionAsync(authUrl, RETURN_URL);
      if (result.type === "success") {
        const back = new URL(result.url);
        const msg = back.searchParams.get("msg");
        const email = back.searchParams.get("email");
        if (msg) onResult(msg);
        else onResult(email ? `Gmail conectado: ${email}` : "Gmail conectado ✅");
      } else if (result.type === "cancel" || result.type === "dismiss") {
        onResult("Conexión cancelada.");
      }
    } catch (e) {
      onResult(`Error al conectar: ${String(e)}`);
    }
  }, [onResult]);

  return { connect };
}
