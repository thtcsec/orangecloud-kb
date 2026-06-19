export function jsonResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function errorResponse(message: string, status = 400, details?: string): Response {
  return jsonResponse({ error: message, details }, status);
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function escapeFtsQuery(query: string): string {
  return query
    .replace(/['"]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => `"${term}"*`)
    .join(" ");
}
