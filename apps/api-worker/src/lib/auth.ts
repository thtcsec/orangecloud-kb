const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getSigningKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(secret: string, ttlSeconds = 60 * 60 * 24 * 7): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = JSON.stringify({ exp: expiresAt, role: "admin" });
  const payloadB64 = toBase64Url(encoder.encode(payload));
  const key = await getSigningKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
  return `${payloadB64}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(secret: string, token: string): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, signatureB64] = parts;
  const key = await getSigningKey(secret);

  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signatureB64),
      encoder.encode(payloadB64),
    );
    if (!valid) return false;

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64))) as { exp: number };
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export const SESSION_COOKIE = "kb_session";

export function getSessionTokenFromRequest(request: Request): string | null {
  const cookie = request.headers.get("Cookie");
  if (!cookie) return null;
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return match?.[1] ?? null;
}

export function getApiKeyFromRequest(request: Request): string | null {
  const header = request.headers.get("Authorization");
  if (header?.startsWith("Bearer ")) {
    return header.slice(7);
  }
  return request.headers.get("X-API-Key");
}
