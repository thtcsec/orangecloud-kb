export const SCROLL_TOP_KEY = "kb-scroll-to-top";
export const LAST_AUTHOR_KEY = "kb-last-author";

export function readScrollToTopEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(SCROLL_TOP_KEY);
  if (stored === null) return true;
  return stored === "1" || stored === "true";
}

export function writeScrollToTopEnabled(enabled: boolean): void {
  localStorage.setItem(SCROLL_TOP_KEY, enabled ? "1" : "0");
}

export function readLastAuthor(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LAST_AUTHOR_KEY) ?? "";
}

export function writeLastAuthor(author: string): void {
  const trimmed = author.trim();
  if (trimmed) localStorage.setItem(LAST_AUTHOR_KEY, trimmed);
}
