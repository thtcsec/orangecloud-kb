"use client";

import type { Comment } from "@kb/shared";
import { useState } from "react";
import { api } from "@/lib/api";
import { ClientDate } from "./ClientDate";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";

export function CommentsSection({ noteId, initialComments }: { noteId: string; initialComments: Comment[] }) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;

    setLoading(true);
    setError("");
    try {
      const comment = await api.comments.create(noteId, { author, content });
      setComments((prev) => [...prev, comment]);
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 font-medium">
          <MessageSquare size={18} className="text-accent" />
          Comments ({comments.length})
        </span>
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {expanded && (
        <div className="border-t border-border p-4">
          <form onSubmit={handleSubmit} className="mb-6 space-y-3">
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name"
              className="w-full"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a comment (markdown supported)"
              rows={3}
              className="w-full resize-y"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent-hover"
            >
              {loading ? "Posting..." : "Post Comment"}
            </button>
          </form>

          <div className="space-y-4">
            {comments.map((comment) => (
              <article key={comment.id} className="rounded-lg border border-border bg-surface-elevated p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-accent">{comment.author}</span>
                  <ClientDate iso={comment.created_at} className="text-muted" />
                </div>
                <MarkdownRenderer content={comment.content} />
              </article>
            ))}
            {comments.length === 0 && <p className="text-sm text-muted">No comments yet.</p>}
          </div>
        </div>
      )}
    </section>
  );
}
