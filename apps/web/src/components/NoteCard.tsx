"use client";

import Link from "next/link";
import type { Note } from "@kb/shared";
import { parseTags, stripMarkdownPreview } from "@/lib/utils";
import { ClientDate } from "./ClientDate";
import { FileText, GripVertical } from "lucide-react";
import { useState } from "react";

const MAX_VISIBLE_TAGS = 3;

interface NoteCardProps {
  note: Note;
  draggable?: boolean;
}

export function NoteCard({ note, draggable }: NoteCardProps) {
  const tags = parseTags(note.tags);
  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTagCount = tags.length - visibleTags.length;
  const preview = stripMarkdownPreview(note.content);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/note-id", note.id);
        e.dataTransfer.effectAllowed = "move";
        setIsDragging(true);
      }}
      onDragEnd={() => setIsDragging(false)}
      className={`group relative transition-all duration-200 ${
        isDragging ? "opacity-50 scale-95 rotate-1" : ""
      }`}
    >
      {draggable && (
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
          <GripVertical size={14} className="text-muted" />
        </div>
      )}
      <Link
        href={`/notes/${note.id}`}
        className="block h-full rounded-xl border border-border bg-surface p-4 transition-all duration-200 hover:border-accent/40 hover:bg-surface-elevated hover:-translate-y-0.5 hover:shadow-md"
        onClick={(e) => {
          if (isDragging) e.preventDefault();
        }}
        title={hiddenTagCount > 0 ? `Tags: ${tags.join(", ")}` : undefined}
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="flex items-center gap-2 font-semibold text-foreground line-clamp-2">
            <FileText size={16} className="mt-0.5 shrink-0 text-accent" />
            {note.title}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
              note.status === "published"
                ? "bg-green-500/15 text-green-700 dark:text-green-400"
                : "bg-surface-elevated text-muted"
            }`}
          >
            {note.status === "published" ? "Đã xuất bản" : "Bản nháp"}
          </span>
        </div>

        <p className="mb-3 line-clamp-2 min-h-[2.5rem] text-sm text-muted">
          {preview || "Không có nội dung xem trước."}
        </p>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>{note.author}</span>
          {note.folder && (
            <>
              <span>·</span>
              <span className="text-accent/80">{note.folder}</span>
            </>
          )}
        </div>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted/90">
          <span>
            Tạo: <ClientDate iso={note.created_at} />
          </span>
          {note.updated_at !== note.created_at && (
            <span>
              Sửa: <ClientDate iso={note.updated_at} />
            </span>
          )}
        </div>

        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="max-w-[9rem] truncate rounded bg-accent/10 px-2 py-0.5 text-xs text-accent"
              >
                {tag}
              </span>
            ))}
            {hiddenTagCount > 0 && (
              <span className="rounded bg-surface-elevated px-2 py-0.5 text-xs text-muted">
                +{hiddenTagCount}
              </span>
            )}
          </div>
        )}
      </Link>
    </div>
  );
}
