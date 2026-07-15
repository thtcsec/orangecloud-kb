export interface MdIssue {
  line: number;
  message: string;
  severity: "error" | "warning";
}

/** Lightweight real-time markdown checks (no external deps). */
export function lintMarkdown(content: string): MdIssue[] {
  if (!content.trim()) return [];

  const issues: MdIssue[] = [];
  const lines = content.split("\n");

  let fenceOpen: number | null = null;
  let fenceMarker = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNo = i + 1;
    const fenceMatch = line.match(/^(`{3,}|~{3,})/);

    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      const len = fenceMatch[1].length;
      if (fenceOpen === null) {
        fenceOpen = lineNo;
        fenceMarker = marker.repeat(len);
      } else if (line.trim().startsWith(fenceMarker[0].repeat(fenceMarker.length)) || line.trim() === fenceMarker) {
        fenceOpen = null;
        fenceMarker = "";
      }
      continue;
    }

    if (fenceOpen !== null) continue;

    if (/^#{1,6}\s*$/.test(line)) {
      issues.push({ line: lineNo, message: "Heading trống (thiếu nội dung sau #)", severity: "error" });
    }

    if (/\[([^\]]*)\]\(\s*\)/.test(line)) {
      issues.push({ line: lineNo, message: "Link/ảnh có URL trống []()", severity: "error" });
    }

    const openBrackets = (line.match(/\[/g) ?? []).length;
    const closeBrackets = (line.match(/\]/g) ?? []).length;
    if (openBrackets !== closeBrackets) {
      issues.push({ line: lineNo, message: "Dấu ngoặc vuông [ ] không khớp", severity: "warning" });
    }

    // Unmatched ** outside inline code
    const withoutInlineCode = line.replace(/`[^`]*`/g, "");
    const boldCount = (withoutInlineCode.match(/\*\*/g) ?? []).length;
    if (boldCount % 2 !== 0) {
      issues.push({ line: lineNo, message: "Bold ** chưa đóng", severity: "warning" });
    }

  }

  if (fenceOpen !== null) {
    issues.push({
      line: fenceOpen,
      message: "Code fence ``` chưa đóng",
      severity: "error",
    });
  }

  // Global unmatched fenced blocks already handled; check overall ** balance loosely
  const globalWithoutFences = content.replace(/```[\s\S]*?```/g, "").replace(/~~~[\s\S]*?~~~/g, "");
  const globalBold = (globalWithoutFences.match(/\*\*/g) ?? []).length;
  if (globalBold % 2 !== 0 && !issues.some((i) => i.message.includes("Bold"))) {
    issues.push({ line: 1, message: "Có cặp ** chưa đóng trong tài liệu", severity: "warning" });
  }

  return issues.slice(0, 12);
}
