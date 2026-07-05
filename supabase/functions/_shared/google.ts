// Helpers para hablar con Google OAuth y Gmail API.

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

export interface GmailMessageMeta {
  id: string;
  threadId: string;
}

// Intercambia el "authorization code" (del flujo OAuth en la app) por tokens.
// Devuelve el refresh_token que guardaremos cifrado.
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
): Promise<{ refresh_token: string; access_token: string; email: string }> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
      client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Google token exchange falló: ${await res.text()}`);
  const data = await res.json();
  if (!data.refresh_token) {
    throw new Error("Google no devolvió refresh_token (usa access_type=offline&prompt=consent)");
  }

  // Sacamos el email de la cuenta desde el id_token (sin verificar firma; el
  // intercambio ya vino directo de Google).
  let email = "";
  if (data.id_token) {
    const payload = JSON.parse(atob(data.id_token.split(".")[1]));
    email = payload.email ?? "";
  }
  return { refresh_token: data.refresh_token, access_token: data.access_token, email };
}

// Con el refresh_token obtenemos un access_token fresco para llamar a Gmail.
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
      client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Refresh de access_token falló: ${await res.text()}`);
  return (await res.json()).access_token;
}

// Lista los IDs de correos que coinciden con la query de búsqueda de Gmail.
export async function listMessages(
  accessToken: string,
  query: string,
): Promise<GmailMessageMeta[]> {
  const url = `${GMAIL_BASE}/messages?q=${encodeURIComponent(query)}&maxResults=50`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Gmail list falló: ${await res.text()}`);
  return (await res.json()).messages ?? [];
}

// Trae un correo completo y devuelve su cuerpo de texto plano decodificado.
export async function getMessageBody(
  accessToken: string,
  id: string,
): Promise<{ body: string; date: Date; from: string }> {
  const res = await fetch(`${GMAIL_BASE}/messages/${id}?format=full`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Gmail get falló: ${await res.text()}`);
  const msg = await res.json();

  const headers: { name: string; value: string }[] = msg.payload?.headers ?? [];
  const from = headers.find((h) => h.name.toLowerCase() === "from")?.value ?? "";
  const dateHeader = headers.find((h) => h.name.toLowerCase() === "date")?.value;
  const date = dateHeader ? new Date(dateHeader) : new Date();

  return { body: extractBody(msg.payload), date, from };
}

// Recorre el árbol MIME y devuelve el texto (prefiere text/plain).
function extractBody(payload: any): string {
  if (!payload) return "";
  const decode = (data: string) =>
    new TextDecoder().decode(
      Uint8Array.from(atob(data.replace(/-/g, "+").replace(/_/g, "/")), (c) =>
        c.charCodeAt(0)
      ),
    );

  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return decode(payload.body.data);
  }
  if (payload.parts) {
    // Primero busca text/plain; si no, cae a cualquier parte con datos.
    const plain = payload.parts.find((p: any) => p.mimeType === "text/plain");
    if (plain?.body?.data) return decode(plain.body.data);
    for (const part of payload.parts) {
      const nested = extractBody(part);
      if (nested) return nested;
    }
  }
  if (payload.body?.data) return decode(payload.body.data);
  return "";
}
