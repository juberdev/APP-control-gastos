// Cifrado simétrico (AES-GCM) para guardar el refresh_token de Google.
// La clave vive en el secreto TOKEN_ENC_KEY (32 bytes en base64), NUNCA en la app.
//
// Generar una clave:  openssl rand -base64 32

function getKeyBytes(): Uint8Array {
  const b64 = Deno.env.get("TOKEN_ENC_KEY");
  if (!b64) throw new Error("Falta el secreto TOKEN_ENC_KEY");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function importKey(): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    getKeyBytes(),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

const b64 = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromB64 = (s: string) =>
  Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

// Devuelve "iv.ciphertext" en base64.
export async function encrypt(plaintext: string): Promise<string> {
  const key = await importKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext),
  );
  return `${b64(iv)}.${b64(ct)}`;
}

export async function decrypt(payload: string): Promise<string> {
  const key = await importKey();
  const [ivB64, ctB64] = payload.split(".");
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromB64(ivB64) },
    key,
    fromB64(ctB64),
  );
  return new TextDecoder().decode(pt);
}
