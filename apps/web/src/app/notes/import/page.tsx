"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Upload, FileText, CheckCircle, XCircle } from "lucide-react";

interface ImportResult {
  filename: string;
  status: "success" | "error";
  noteId?: string;
  error?: string;
}

export default function ImportPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [author, setAuthor] = useState("");

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!author.trim()) {
        alert("Vui lòng nhập tên tác giả trước khi import.");
        return;
      }

      setProcessing(true);
      setResults([]);
      const newResults: ImportResult[] = [];

      for (const file of Array.from(files)) {
        if (!file.name.endsWith(".md") && !file.name.endsWith(".markdown")) {
          newResults.push({ filename: file.name, status: "error", error: "Chỉ hỗ trợ file .md" });
          continue;
        }

        try {
          const content = await file.text();
          // Extract title from first heading or filename
          const titleMatch = content.match(/^#\s+(.+)$/m);
          const title = titleMatch?.[1] ?? file.name.replace(/\.(md|markdown)$/, "");

          // Extract folder from path-like filename (e.g., "research/topic.md")
          const parts = file.name.replace(/\.(md|markdown)$/, "").split("/");
          const folder = parts.length > 1 ? parts.slice(0, -1).join("/") : "";

          const note = await api.notes.create({
            title,
            content: titleMatch ? content.replace(/^#\s+.+\n?/, "") : content,
            author: author.trim(),
            folder: folder || undefined,
            status: "draft",
          });

          newResults.push({ filename: file.name, status: "success", noteId: note.id });
        } catch (err) {
          newResults.push({
            filename: file.name,
            status: "error",
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }

      setResults(newResults);
      setProcessing(false);
    },
    [author],
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  }

  const successCount = results.filter((r) => r.status === "success").length;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">{t("upload.title")}</h1>
        <p className="text-sm text-muted">{t("upload.desc")}</p>
      </header>

      {/* Author field */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium">Tác giả</label>
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Tên tác giả cho các ghi chú import"
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
        />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition ${
          dragOver
            ? "border-accent bg-accent/5"
            : "border-border hover:border-accent/40"
        }`}
      >
        <Upload size={40} className="mb-4 text-muted" />
        <p className="mb-2 text-sm text-muted">{t("upload.dropzone")}</p>
        <input
          type="file"
          accept=".md,.markdown"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </div>

      {processing && (
        <div className="mt-6 flex items-center gap-2 text-sm text-muted">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          {t("upload.processing")}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-6 space-y-2">
          <p className="text-sm font-medium">
            {successCount}/{results.length} {t("upload.success")}
          </p>
          {results.map((r, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${
                r.status === "success"
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-red-500/30 bg-red-500/5"
              }`}
            >
              {r.status === "success" ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : (
                <XCircle size={16} className="text-red-400" />
              )}
              <FileText size={14} className="text-muted" />
              <span className="flex-1 truncate">{r.filename}</span>
              {r.status === "success" && r.noteId && (
                <button
                  onClick={() => router.push(`/notes/${r.noteId}`)}
                  className="text-xs text-accent hover:underline"
                >
                  Xem
                </button>
              )}
              {r.error && <span className="text-xs text-red-400">{r.error}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
