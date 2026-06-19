export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
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
