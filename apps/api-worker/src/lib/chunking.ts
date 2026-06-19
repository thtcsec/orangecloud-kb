const CHARS_PER_TOKEN = 4;

export interface TextChunk {
  index: number;
  text: string;
}

export function chunkText(
  content: string,
  chunkSizeTokens = 500,
  overlapTokens = 50,
): TextChunk[] {
  const chunkSize = chunkSizeTokens * CHARS_PER_TOKEN;
  const overlap = overlapTokens * CHARS_PER_TOKEN;

  if (!content.trim()) {
    return [];
  }

  if (content.length <= chunkSize) {
    return [{ index: 0, text: content.trim() }];
  }

  const chunks: TextChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < content.length) {
    let end = Math.min(start + chunkSize, content.length);

    if (end < content.length) {
      const slice = content.slice(start, end);
      const breakAt = Math.max(
        slice.lastIndexOf("\n\n"),
        slice.lastIndexOf("\n"),
        slice.lastIndexOf(". "),
        slice.lastIndexOf(" "),
      );
      if (breakAt > chunkSize * 0.5) {
        end = start + breakAt + 1;
      }
    }

    const text = content.slice(start, end).trim();
    if (text) {
      chunks.push({ index, text });
      index += 1;
    }

    if (end >= content.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}

export function vectorId(noteId: string, chunkIndex: number): string {
  return `${noteId}::${chunkIndex}`;
}

export function parseVectorId(id: string): { noteId: string; chunkIndex: number } | null {
  const separator = id.lastIndexOf("::");
  if (separator === -1) return null;
  const noteId = id.slice(0, separator);
  const chunkIndex = Number.parseInt(id.slice(separator + 2), 10);
  if (!noteId || Number.isNaN(chunkIndex)) return null;
  return { noteId, chunkIndex };
}
