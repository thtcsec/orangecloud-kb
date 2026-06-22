export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hour12: false,
  }).format(date);
}

export function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function buildFolderTree(folders: string[]): Record<string, Record<string, unknown>> {
  const tree: Record<string, Record<string, unknown>> = {};
  for (const folder of folders) {
    const parts = folder.split("/").filter(Boolean);
    let current = tree;
    for (const part of parts) {
      if (!current[part]) current[part] = {};
      current = current[part] as Record<string, Record<string, unknown>>;
    }
  }
  return tree;
}
