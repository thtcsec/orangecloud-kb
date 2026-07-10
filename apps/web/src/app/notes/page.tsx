"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { NoteCard } from "@/components/NoteCard";
import { useI18n } from "@/lib/i18n";
import { Search, ChevronLeft, Folder, FolderOpen, PanelLeftClose, PanelLeft } from "lucide-react";

export default function NotesPage() {
  const { t } = useI18n();
  const [notes, setNotes] = useState<Awaited<ReturnType<typeof api.notes.list>>>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>();
  const [selectedTag, setSelectedTag] = useState<string>();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [folderOpen, setFolderOpen] = useState(true);

  useEffect(() => {
    api.notes.folders().then(setFolders);
    api.notes.tags().then(setTags);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (selectedFolder) params.folder = selectedFolder;
    if (selectedTag) params.tag = selectedTag;
    if (search.trim()) params.q = search.trim();

    api.notes
      .list(params)
      .then(setNotes)
      .finally(() => setLoading(false));
  }, [selectedFolder, selectedTag, search]);

  return (
    <div className="flex h-full">
      {/* Folder sidebar — collapsible */}
      {folderOpen && (
        <aside className="w-52 shrink-0 border-r border-border p-4 animate-fade-in">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">{t("folders.title")}</h3>
            <button
              type="button"
              onClick={() => setFolderOpen(false)}
              className="rounded p-1 text-muted hover:text-foreground"
              title="Thu gọn"
            >
              <PanelLeftClose size={14} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSelectedFolder(undefined)}
            className={`mb-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${
              !selectedFolder ? "bg-accent/10 text-accent" : "text-muted hover:text-foreground"
            }`}
          >
            <FolderOpen size={16} />
            {t("folders.all")}
          </button>
          {folders.map((folder) => (
            <button
              key={folder}
              type="button"
              onClick={() => setSelectedFolder(folder)}
              className={`mb-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                selectedFolder === folder ? "bg-accent/10 text-accent" : "text-muted hover:text-foreground"
              }`}
            >
              <Folder size={16} />
              <span className="truncate">{folder}</span>
            </button>
          ))}
          {folders.length === 0 && <p className="text-xs text-muted">{t("folders.empty")}</p>}
        </aside>
      )}

      {/* Main content */}
      <div className="flex-1 p-6">
        <header className="mb-6 flex items-center gap-3">
          {!folderOpen && (
            <button
              type="button"
              onClick={() => setFolderOpen(true)}
              className="rounded-lg border border-border p-2 text-muted hover:text-foreground transition-colors"
              title="Hiện thư mục"
            >
              <PanelLeft size={16} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/" className="text-muted hover:text-foreground transition-colors">
                <ChevronLeft size={18} />
              </Link>
              <h1 className="text-2xl font-bold">{t("notes.title")}</h1>
            </div>
          </div>
        </header>

        <div className="relative mb-4 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("notes.searchPlaceholder")}
            className="w-full pl-10"
          />
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedTag(undefined)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${!selectedTag ? "bg-accent text-black" : "bg-surface-elevated text-muted hover:text-foreground"}`}
            >
              {t("folders.allTags")}
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  selectedTag === tag ? "bg-accent text-black" : "bg-surface-elevated text-muted hover:text-foreground"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 stagger-children">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-surface p-4">
                <div className="mb-3 h-5 w-3/4 animate-pulse rounded bg-surface-elevated" />
                <div className="mb-2 h-4 w-full animate-pulse rounded bg-surface-elevated" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-surface-elevated" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 stagger-children">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
            {notes.length === 0 && <p className="text-muted">{t("notes.notFound")}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
