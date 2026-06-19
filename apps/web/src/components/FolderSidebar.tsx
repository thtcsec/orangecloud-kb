"use client";

import Link from "next/link";
import { Folder, FolderOpen } from "lucide-react";

interface FolderSidebarProps {
  folders: string[];
  selected?: string;
  onSelect: (folder: string | undefined) => void;
}

export function FolderSidebar({ folders, selected, onSelect }: FolderSidebarProps) {
  return (
    <aside className="w-56 shrink-0 border-r border-border p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Folders</h3>
      <button
        type="button"
        onClick={() => onSelect(undefined)}
        className={`mb-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
          !selected ? "bg-accent/10 text-accent" : "text-zinc-400 hover:text-foreground"
        }`}
      >
        <FolderOpen size={16} />
        All notes
      </button>
      {folders.map((folder) => (
        <button
          key={folder}
          type="button"
          onClick={() => onSelect(folder)}
          className={`mb-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm ${
            selected === folder ? "bg-accent/10 text-accent" : "text-zinc-400 hover:text-foreground"
          }`}
        >
          <Folder size={16} />
          <span className="truncate">{folder}</span>
        </button>
      ))}
      {folders.length === 0 && <p className="text-xs text-muted">No folders yet</p>}
    </aside>
  );
}

export function TagFilter({
  tags,
  selected,
  onSelect,
}: {
  tags: string[];
  selected?: string;
  onSelect: (tag: string | undefined) => void;
}) {
  if (tags.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelect(undefined)}
        className={`rounded-full px-3 py-1 text-xs ${!selected ? "bg-accent text-black" : "bg-surface-elevated text-muted"}`}
      >
        All tags
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onSelect(tag)}
          className={`rounded-full px-3 py-1 text-xs ${
            selected === tag ? "bg-accent text-black" : "bg-surface-elevated text-muted hover:text-foreground"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
