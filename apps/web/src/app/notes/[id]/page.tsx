"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { parseTags } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CommentsSection } from "@/components/CommentsSection";
import { ClientDate } from "@/components/ClientDate";
import type { Comment, Note } from "@kb/shared";
import { Pencil, Trash2 } from "lucide-react";

export default function NoteDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [note, setNote] = useState<Note | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([api.notes.get(id), api.comments.list(id)])
      .then(([n, c]) => {
        setNote(n);
        setComments(c);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load note"));
  }, [id]);

  async function handleDelete() {
    if (!confirm("Delete this note? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await api.notes.delete(id);
      window.location.href = "/notes";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  }

  if (error) return <div className="p-6 text-red-400">{error}</div>;
  if (!note) return <div className="p-6 text-muted">Loading...</div>;

  const tags = parseTags(note.tags);

  return (
    <article className="mx-auto max-w-4xl p-6">
      <header className="mb-6 border-b border-border pb-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{note.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
              <span>{note.author}</span>
              <span>·</span>
              <ClientDate iso={note.updated_at} />
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
                {note.status}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/notes/${id}/edit`}
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm hover:border-accent/40"
            >
              <Pencil size={14} />
              Edit
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1 rounded-lg border border-red-900/50 px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/20"
            >
              <Trash2 size={14} />
              Delete
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
      <CommentsSection noteId={id} initialComments={comments} />
    </article>
  );
}
