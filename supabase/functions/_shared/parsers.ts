// Parsers de correos de notificación de consumo, uno por banco.
//
// ⚠️ IMPORTANTE: los `senders` y los regex son APROXIMADOS. Hay que afinarlos
// con correos REALES de cada banco (remitente exacto + plantilla exacta).
// Por eso cada parser está aislado: cuando el banco cambie su plantilla,
// solo tocas su bloque.

export interface ParsedTxn {
  banco: string;
  monto: number;
  moneda: "PEN" | "USD";
  last4: string | null;
  comercio: string | null;
  fecha: Date | null; // si null, se usa la fecha del correo
}

export interface BankParser {
  banco: string;
  // Fragmentos que deben aparecer en el header "From" (correo directo del banco).
  senders: string[];
  // Marcadores que aparecen en el CUERPO (sirve para correos REENVIADOS, donde
  // el "From" ya no es el banco sino quien reenvía).
  bodyMarkers: string[];
  parse: (body: string) => ParsedTxn | null;
}

const toNumber = (s: string) => Number(s.replace(/,/g, ""));
const detectMoneda = (s: string): "PEN" | "USD" =>
  /US\$|USD|\$\s*\d/i.test(s) ? "USD" : "PEN";

// --------------------------- BCP ---------------------------
const bcp: BankParser = {
  banco: "BCP",
  senders: ["bcp.com.pe", "viabcp.com", "notificaciones@bcp"],
  bodyMarkers: ["bcp.com.pe", "viabcp.com", "banco de crédito", "banco de credito"],
  parse: (body) => {
    // Ej: "Se realizó un consumo de S/ 150.00 en PLAZA VEA con tu tarjeta
    //      terminada en 1234 el 27/06/2026"
    const montoM = body.match(/(?:S\/|US\$|\$)\s?([\d.,]+\.\d{2})/i);
    if (!montoM) return null;
    const last4 = body.match(/(?:terminada en|final(?:izada)? en|\*{2,})\s*(\d{4})/i)?.[1] ?? null;
    const comercio = body.match(/en\s+([A-ZÁÉÍÓÚÑ0-9 .&'-]{3,40}?)\s+(?:con|el|por)/i)?.[1]?.trim() ?? null;
    const fechaM = body.match(/(\d{2}\/\d{2}\/\d{4})/);
    return {
      banco: "BCP",
      monto: toNumber(montoM[1]),
      moneda: detectMoneda(montoM[0]),
      last4,
      comercio,
      fecha: fechaM ? parseDmy(fechaM[1]) : null,
    };
  },
};

// ------------------------ Interbank ------------------------
const interbank: BankParser = {
  banco: "Interbank",
  senders: ["interbank.pe", "interbank.com.pe", "notificaciones@interbank"],
  bodyMarkers: ["interbank.pe", "interbank.com.pe", "interbank"],
  parse: (body) => {
    const montoM = body.match(/(?:S\/|US\$|\$)\s?([\d.,]+\.\d{2})/i);
    if (!montoM) return null;
    const last4 = body.match(/(?:terminada en|final(?:izada)? en|\*{2,})\s*(\d{4})/i)?.[1] ?? null;
    const comercio = body.match(/en\s+([A-ZÁÉÍÓÚÑ0-9 .&'-]{3,40}?)\s+(?:con|el|por)/i)?.[1]?.trim() ?? null;
    const fechaM = body.match(/(\d{2}\/\d{2}\/\d{4})/);
    return {
      banco: "Interbank",
      monto: toNumber(montoM[1]),
      moneda: detectMoneda(montoM[0]),
      last4,
      comercio,
      fecha: fechaM ? parseDmy(fechaM[1]) : null,
    };
  },
};

function parseDmy(s: string): Date {
  const [d, m, y] = s.split("/").map(Number);
  return new Date(y, m - 1, d);
}

export const PARSERS: BankParser[] = [bcp, interbank];

// Elige el parser según el remitente O el contenido del correo.
// Lo segundo permite manejar correos REENVIADOS (el banco queda en el cuerpo).
export function resolveParser(from: string, body: string): BankParser | null {
  const fromLower = from.toLowerCase();
  const bodyLower = body.toLowerCase();
  return (
    PARSERS.find((p) => p.senders.some((s) => fromLower.includes(s))) ??
    PARSERS.find((p) => p.bodyMarkers.some((m) => bodyLower.includes(m))) ??
    null
  );
}

// Construye la query de Gmail. Incluye remitentes directos del banco Y
// palabras clave en el cuerpo, para capturar también correos reenviados.
export function gmailQuery(sinceDays = 30): string {
  const senders = PARSERS.flatMap((p) => p.senders)
    .filter((s) => s.includes("."))
    .map((s) => `from:${s}`);
  const keywords = ['"banco de crédito"', "interbank", "yape", "consumo"];
  return `newer_than:${sinceDays}d (${[...senders, ...keywords].join(" OR ")})`;
}
