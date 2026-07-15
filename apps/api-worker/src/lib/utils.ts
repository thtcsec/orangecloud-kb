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

/** Canonical storage form: "tag-a, tag-b" (trimmed, comma+space). */
export function normalizeTags(tags: string | null | undefined): string | null {
  const parsed = parseTags(tags);
  return parsed.length ? parsed.join(", ") : null;
}

/** Escape % and _ for SQLite LIKE. */
export function escapeLike(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/**
 * Match a single tag token in the comma-separated tags column,
 * tolerant of "a,b" / "a, b" / " a , b " spacing.
 */
export function tagEqualsSql(column = "tags"): string {
  return `(
    ',' || REPLACE(REPLACE(REPLACE(COALESCE(${column}, ''), ', ', ','), ' ,', ','), ',,', ',') || ','
  ) LIKE ? ESCAPE '\\'`;
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
