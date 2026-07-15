"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { api, API_URL } from "@/lib/api";
import { useTheme } from "./ThemeProvider";
import { lintMarkdown } from "@/lib/markdown-lint";
import { AlertTriangle, ImagePlus, Loader2 } from "lucide-react";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const { resolvedTheme, mounted } = useTheme();

  const issues = useMemo(() => lintMarkdown(value), [value]);
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

  const insertAtCursor = useCallback(
    (snippet: string) => {
      onChange(value ? `${value}\n\n${snippet}` : snippet);
    },
    [onChange, value],
  );

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const result = await api.attachments.upload(file);
      const isImage = result.contentType.startsWith("image/");
      const markdown = isImage
        ? `![${file.name}](${result.absoluteUrl})`
        : `[${file.name}](${result.absoluteUrl})`;
      insertAtCursor(markdown);
      setTab("write");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const colorMode = mounted && resolvedTheme === "light" ? "light" : "dark";

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border">
        <div className="flex">
          <button
            type="button"
            onClick={() => setTab("write")}
            className={`px-4 py-2 text-sm ${tab === "write" ? "border-b-2 border-accent text-accent" : "text-muted"}`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`px-4 py-2 text-sm ${tab === "preview" ? "border-b-2 border-accent text-accent" : "text-muted"}`}
          >
            Preview
          </button>
        </div>

        <div className="mr-3 flex items-center gap-3">
          {issues.length > 0 && (
            <span
              className={`flex items-center gap-1 text-xs ${
                errors.length ? "text-red-400" : "text-amber-500"
              }`}
              title={issues.map((i) => `L${i.line}: ${i.message}`).join("\n")}
            >
              <AlertTriangle size={14} />
              {errors.length ? `${errors.length} lỗi` : `${warnings.length} cảnh báo`}
            </span>
          )}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted hover:text-accent">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
            {uploading ? "Uploading..." : "Attach file"}
            <input
              type="file"
              className="hidden"
              accept="image/*,.pdf,.txt,.md"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {uploadError && <p className="border-b border-border px-4 py-2 text-sm text-red-500">{uploadError}</p>}

      {issues.length > 0 && (
        <ul className="max-h-28 space-y-1 overflow-y-auto border-b border-border px-4 py-2 text-xs">
          {issues.map((issue, idx) => (
            <li
              key={`${issue.line}-${idx}`}
              className={issue.severity === "error" ? "text-red-400" : "text-amber-500"}
            >
              Dòng {issue.line}: {issue.message}
            </li>
          ))}
        </ul>
      )}

      {tab === "write" ? (
        <div className="min-h-[500px] flex-1 [&_.w-md-editor]:min-h-[500px] [&_.w-md-editor]:bg-surface [&_.w-md-editor-toolbar]:bg-surface-elevated [&_.w-md-editor-toolbar]:border-border">
          <MDEditor
            value={value}
            onChange={(v) => onChange(v ?? "")}
            preview="edit"
            height={500}
            textareaProps={{ placeholder }}
            data-color-mode={colorMode}
            visibleDragbar={false}
          />
        </div>
      ) : (
        <div className="min-h-[500px] flex-1 overflow-auto p-4">
          {value ? <MarkdownRenderer content={value} /> : <p className="text-muted">Nothing to preview</p>}
        </div>
      )}

      <p className="border-t border-border px-4 py-2 text-xs text-muted">
        Upload ảnh/PDF qua R2 — cần đăng nhập admin tại Settings. API: {API_URL}
      </p>
    </div>
  );
}
