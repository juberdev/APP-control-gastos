// Edge Function: gmail-connect
// Conecta la cuenta de Gmail del usuario guardando su refresh_token CIFRADO.
//
// Dos flujos soportados:
//  - GET  ?code&state   → Google redirige aquí (app instalada). `state` es el
//                         JWT del usuario. Al terminar hace "bounce" a la app.
//  - POST { code, redirectUri } con Authorization: Bearer <JWT>  (compat)

import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { encrypt } from "../_shared/crypto.ts";
import { exchangeCodeForTokens } from "../_shared/google.ts";

// Esquema de la app para volver del navegador (debe coincidir con app.json).
const APP_RETURN = "misgastos://gmail-connected";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // ---------- Flujo app instalada: redirect de Google (GET) ----------
  if (req.method === "GET") {
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // JWT del usuario
    const oauthErr = url.searchParams.get("error");
    if (oauthErr) return bounce({ msg: `Google: ${oauthErr}` });
    if (!code || !state) return bounce({ msg: "Faltan code/state" });

    try {
      const supabase = admin();
      const { data: { user }, error } = await supabase.auth.getUser(state);
      if (error || !user) return bounce({ msg: "Sesión inválida" });

      // El redirect_uri del intercambio debe ser EXACTO al usado por la app.
      const redirectUri = `${url.origin}${url.pathname}`;
      const email = await storeConnection(supabase, user.id, code, redirectUri);
      return bounce({ email });
    } catch (e) {
      return bounce({ msg: String(e) });
    }
  }

  // ---------- Compat: flujo anterior por POST ----------
  try {
    const supabase = admin();
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) return json({ error: "No autenticado" }, 401);

    const { code, redirectUri } = await req.json();
    if (!code || !redirectUri) return json({ error: "Faltan code/redirectUri" }, 400);

    const email = await storeConnection(supabase, user.id, code, redirectUri);
    return json({ ok: true, google_email: email });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

// Cliente service_role (salta RLS para escribir el token cifrado).
function admin(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

// Intercambia el code por tokens y guarda la conexión cifrada. Devuelve el email.
async function storeConnection(
  supabase: SupabaseClient,
  userId: string,
  code: string,
  redirectUri: string,
): Promise<string> {
  const { refresh_token, email } = await exchangeCodeForTokens(code, redirectUri);
  const refresh_token_enc = await encrypt(refresh_token);
  const { error } = await supabase
    .from("gmail_connections")
    .upsert(
      { user_id: userId, google_email: email, refresh_token_enc },
      { onConflict: "user_id,google_email" },
    );
  if (error) throw new Error(error.message);
  return email;
}

// Redirige de vuelta a la app (cierra el navegador in-app) con el resultado.
function bounce(params: { email?: string; msg?: string }): Response {
  const q = new URLSearchParams();
  if (params.email) q.set("email", params.email);
  if (params.msg) q.set("msg", params.msg);
  return new Response(null, {
    status: 302,
    headers: { Location: `${APP_RETURN}?${q.toString()}` },
  });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
