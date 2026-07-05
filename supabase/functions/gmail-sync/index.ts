// Edge Function: gmail-sync
// Lee los correos recientes del banco, los parsea e inserta las transacciones.
// Pensada para ejecutarse:
//   - bajo demanda (la app la llama con el JWT del usuario), o
//   - por cron (pg_cron / Scheduled Function) iterando todos los usuarios.
//
// POST {}  — usa el usuario del JWT.
// Auth: header Authorization: Bearer <supabase user JWT>

import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { decrypt } from "../_shared/crypto.ts";
import {
  getMessageBody,
  listMessages,
  refreshAccessToken,
} from "../_shared/google.ts";
import { gmailQuery, resolveParser } from "../_shared/parsers.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Cliente service_role PURO → lee/escribe saltando RLS.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return json({ error: "No autenticado" }, 401);

    // 1. Conexión de Gmail del usuario.
    const { data: conn } = await supabase
      .from("gmail_connections")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!conn) return json({ error: "Sin conexión de Gmail" }, 400);

    // 2. access_token fresco a partir del refresh_token cifrado.
    const refreshToken = await decrypt(conn.refresh_token_enc);
    const accessToken = await refreshAccessToken(refreshToken);

    // 3. Trae los correos de bancos de los últimos días.
    const messages = await listMessages(accessToken, gmailQuery(30));

    let inserted = 0;
    for (const m of messages) {
      const { body, date, from } = await getMessageBody(accessToken, m.id);
      const parser = resolveParser(from, body);
      if (!parser) continue;

      const parsed = parser.parse(body);
      if (!parsed) continue;

      // 4. Resuelve/crea la tarjeta (si detectamos los últimos 4 dígitos).
      let cardId: string | null = null;
      if (parsed.last4) {
        const { data: card } = await supabase
          .from("cards")
          .upsert(
            { user_id: user.id, banco: parsed.banco, last4: parsed.last4 },
            { onConflict: "user_id,banco,last4" },
          )
          .select("id")
          .single();
        cardId = card?.id ?? null;
      }

      // 5. Inserta la transacción (dedupe por messageId de Gmail).
      const { error: insErr } = await supabase.from("transactions").insert({
        user_id: user.id,
        origen: "gmail",
        card_id: cardId,
        monto: parsed.monto,
        moneda: parsed.moneda,
        comercio: parsed.comercio,
        fecha: (parsed.fecha ?? date).toISOString(),
        dedupe_key: `gmail:${m.id}`,
        raw_json: { from, snippet: body.slice(0, 500) },
      });
      // Ignora duplicados (violación de unique user_id,dedupe_key).
      if (!insErr) inserted++;
    }

    // 6. Marca el último sync.
    await supabase
      .from("gmail_connections")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", conn.id);

    return json({ ok: true, revisados: messages.length, insertados: inserted });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
