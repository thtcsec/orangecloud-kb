"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { parseTags } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CommentsSection } from "@/components/CommentsSection";
import { ClientDate } from "@/components/ClientDate";
import type { Comment, Note, NoteAudit } from "@kb/shared";
import { Pencil, Trash2, ChevronLeft, History } from "lucide-react";

const ACTION_LABEL: Record<NoteAudit["action"], string> = {
  created: "Tạo mới",
  updated: "Chỉnh sửa",
  published: "Xuất bản",
  unpublished: "Hủy xuất bản",
};

export default function NoteDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [note, setNote] = useState<Note | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [audit, setAudit] = useState<NoteAudit[]>([]);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.notes.get(id),
      api.comments.list(id),
      api.notes.audit(id).catch(() => [] as NoteAudit[]),
    ])
      .then(([n, c, a]) => {
        setNote(n);
        setComments(c);
        setAudit(a);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Không thể tải ghi chú"));
  }, [id]);

  async function handleDelete() {
    if (!confirm("Xoá ghi chú này? Hành động không thể hoàn tác.")) return;
    setDeleting(true);
    try {
      await api.notes.delete(id);
      window.location.href = "/notes";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xoá thất bại");
      setDeleting(false);
    }
  }

  if (error) return <div className="p-6 text-red-400">{error}</div>;
  if (!note) return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-2/3 rounded bg-surface-elevated" />
        <div className="h-4 w-1/3 rounded bg-surface-elevated" />
        <div className="mt-8 space-y-3">
          <div className="h-4 w-full rounded bg-surface-elevated" />
          <div className="h-4 w-5/6 rounded bg-surface-elevated" />
          <div className="h-4 w-4/6 rounded bg-surface-elevated" />
        </div>
      </div>
    </div>
  );

  const tags = parseTags(note.tags);

  return (
    <article className="mx-auto max-w-4xl p-6">
      <Link href="/notes" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors">
        <ChevronLeft size={16} /> Quay lại danh sách
      </Link>
      <header className="mb-6 border-b border-border pb-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{note.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
              <span>{note.author}</span>
              {note.folder && (
                <>
                  <span>·</span>
                  <span className="text-accent">{note.folder}</span>
                </>
              )}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  note.status === "published"
                    ? "bg-green-500/15 text-green-700 dark:text-green-400"
                    : "bg-surface-elevated text-muted"
                }`}
              >
                {note.status === "published" ? "Đã xuất bản" : "Bản nháp"}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
              <span>
                Tạo lần đầu: <ClientDate iso={note.created_at} />
              </span>
              <span>
                Sửa gần nhất: <ClientDate iso={note.updated_at} />
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/notes/${id}/edit`}
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm hover:border-accent/40"
            >
              <Pencil size={14} />
              Sửa
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1 rounded-lg border border-red-900/50 px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/20"
            >
              <Trash2 size={14} />
              Xoá
            </button>
          </div>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span key={tag} className="rounded bg-accent/10 px-2 py-0.5 text-xs text-accent">
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <MarkdownRenderer content={note.content} />

      {audit.length > 0 && (
        <section className="mt-10 rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <History size={16} className="text-accent" />
            Lịch sử thay đổi
          </h2>
          <ol className="space-y-2 border-l border-border pl-4">
            {audit.map((entry) => (
              <li key={entry.id} className="relative text-sm">
                <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="font-medium text-foreground">{ACTION_LABEL[entry.action]}</span>
                  <span className="text-xs text-muted">
                    <ClientDate iso={entry.created_at} />
                  </span>
                  {entry.author && <span className="text-xs text-muted">· {entry.author}</span>}
                </div>
                {entry.summary && <p className="text-xs text-muted">{entry.summary}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}

      <CommentsSection noteId={id} initialComments={comments} />
    </article>
  );
}
