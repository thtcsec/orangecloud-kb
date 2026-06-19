"use client";

import Link from "next/link";
import type { Note } from "@kb/shared";
import { formatDate, parseTags } from "@/lib/utils";
import { FileText } from "lucide-react";
import { motion } from "framer-motion";

export function NoteCard({ note }: { note: Note }) {
  const tags = parseTags(note.tags);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Link
        href={`/notes/${note.id}`}
        className="block rounded-xl border border-border bg-surface p-4 transition hover:border-accent/40 hover:bg-surface-elevated"
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="flex items-center gap-2 font-semibold text-foreground">
            <FileText size={16} className="shrink-0 text-accent" />
            {note.title}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
              note.status === "published" ? "bg-green-900/40 text-green-400" : "bg-zinc-800 text-zinc-400"
            }`}
          >
            {note.status}
          </span>
        </div>
        <p className="mb-3 line-clamp-2 text-sm text-muted">{note.content.slice(0, 160)}...</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>{note.author}</span>
          <span>·</span>
          <span>{formatDate(note.updated_at)}</span>
          {note.folder && (
            <>
              <span>·</span>
              <span className="text-accent/80">{note.folder}</span>
            </>
          )}
        </div>
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span key={tag} className="rounded bg-accent/10 px-2 py-0.5 text-xs text-accent">
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </motion.div>
  );
}
