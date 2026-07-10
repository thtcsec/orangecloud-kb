"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { FolderSelect } from "@/components/FolderSelect";
import { useI18n } from "@/lib/i18n";
import { Upload, FileText, CheckCircle, XCircle, PenLine } from "lucide-react";

type Mode = "write" | "import";

export default function NewNotePage() {
  const { t } = useI18n();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("write");

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{t("notes.new")}</h1>
      </header>

      {/* Mode toggle */}
      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("write")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            mode === "write"
              ? "bg-accent text-black"
              : "border border-border text-muted hover:border-accent/40 hover:text-foreground"
          }`}
        >
          <PenLine size={16} />
          Viết mới
        </button>
        <button
          type="button"
          onClick={() => setMode("import")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            mode === "import"
              ? "bg-accent text-black"
              : "border border-border text-muted hover:border-accent/40 hover:text-foreground"
          }`}
        >
          <Upload size={16} />
          Import .md
        </button>
      </div>

      {mode === "write" ? <WriteMode /> : <ImportMode />}
    </div>
  );
}

function WriteMode() {
  const { t } = useI18n();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [folder, setFolder] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const note = await api.notes.create({ title, content, author, tags, folder, status });
      router.push(`/notes/${note.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("notes.createError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("notes.titleField")} required className="w-full" />
        <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder={t("notes.author")} required className="w-full" />
        <FolderSelect value={folder} onChange={setFolder} />
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder={t("notes.tags")} className="w-full" />
        <select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")} className="w-full">
          <option value="draft">{t("notes.draft")}</option>
          <option value="published">{t("notes.publish")}</option>
        </select>
      </div>

      <MarkdownEditor value={content} onChange={setContent} placeholder={t("notes.contentPlaceholder")} />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button type="submit" disabled={loading} className="rounded-lg bg-accent px-4 py-2 font-medium text-black hover:bg-accent-hover disabled:opacity-50">
        {loading ? t("notes.saving") : t("notes.create")}
      </button>
    </form>
  );
}

interface ImportResult {
  filename: string;
  status: "success" | "error";
  noteId?: string;
  error?: string;
}

function ImportMode() {
  const { t } = useI18n();
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [author, setAuthor] = useState("");
  const [error, setError] = useState("");

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!author.trim()) {
        setError("Vui lòng nhập tên tác giả trước khi import.");
        return;
      }

      setProcessing(true);
      setResults([]);
      setError("");
      const newResults: ImportResult[] = [];

      for (const file of Array.from(files)) {
        if (!file.name.endsWith(".md") && !file.name.endsWith(".markdown")) {
          newResults.push({ filename: file.name, status: "error", error: "Chỉ hỗ trợ file .md" });
          setResults([...newResults]);
          continue;
        }

        try {
          const content = await file.text();
          const titleMatch = content.match(/^#\s+(.+)$/m);
          const title = titleMatch?.[1] ?? file.name.replace(/\.(md|markdown)$/, "");
          const parts = file.name.replace(/\.(md|markdown)$/, "").split("/");
          const folder = parts.length > 1 ? parts.slice(0, -1).join("/") : "";

          const note = await api.notes.create({
            title,
            content: titleMatch ? content.replace(/^#\s+.+\n?/, "").trim() : content,
            author: author.trim(),
            folder: folder || undefined,
            status: "draft",
          });

          newResults.push({ filename: file.name, status: "success", noteId: note.id });
        } catch (err) {
          newResults.push({
            filename: file.name,
            status: "error",
            error: err instanceof Error ? err.message : "Lỗi không xác định",
          });
        }
        setResults([...newResults]);
      }

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
    <div className="space-y-6">
      {/* Author field */}
      <div>
        <label className="mb-2 block text-sm font-medium">{t("notes.author")}</label>
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Tên tác giả cho các ghi chú import"
          className="w-full max-w-md"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-all duration-200 cursor-pointer ${
          dragOver
            ? "border-accent bg-accent/5 scale-[1.01]"
            : "border-border hover:border-accent/50 hover:bg-surface-elevated/50"
        }`}
      >
        <div className={`mb-4 rounded-full p-4 transition-colors ${dragOver ? "bg-accent/20" : "bg-surface-elevated group-hover:bg-accent/10"}`}>
          <Upload size={32} className={`transition-colors ${dragOver ? "text-accent" : "text-muted group-hover:text-accent"}`} />
        </div>
        <p className="mb-1 text-sm font-medium">{t("upload.dropzone")}</p>
        <p className="text-xs text-muted">Hỗ trợ .md, .markdown — nhiều file cùng lúc</p>
        <input
          type="file"
          accept=".md,.markdown"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </div>

      {/* Processing indicator */}
      {processing && (
        <div className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 p-4 animate-fade-in">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <div className="flex-1">
            <span className="text-sm font-medium">{t("upload.processing")}</span>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
                style={{ width: `${results.length > 0 ? (results.length / Math.max(results.length + 1, 1)) * 100 : 10}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2 animate-fade-up">
          <p className="text-sm font-medium">
            {successCount}/{results.length} file import thành công
          </p>
          {results.map((r, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-lg border p-3 text-sm animate-slide-in ${
                r.status === "success"
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-red-500/30 bg-red-500/5"
              }`}
            >
              {r.status === "success" ? (
                <CheckCircle size={16} className="shrink-0 text-green-500" />
              ) : (
                <XCircle size={16} className="shrink-0 text-red-400" />
              )}
              <FileText size={14} className="shrink-0 text-muted" />
              <span className="flex-1 truncate">{r.filename}</span>
              {r.status === "success" && r.noteId && (
                <button
                  type="button"
                  onClick={() => router.push(`/notes/${r.noteId}`)}
                  className="shrink-0 text-xs font-medium text-accent hover:underline"
                >
                  Xem →
                </button>
              )}
              {r.error && <span className="shrink-0 text-xs text-red-400">{r.error}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
