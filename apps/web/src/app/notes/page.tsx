"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { NoteCard } from "@/components/NoteCard";
import { FolderSidebar, TagFilter } from "@/components/FolderSidebar";
import { Search } from "lucide-react";

export default function NotesPage() {
  const [notes, setNotes] = useState<Awaited<ReturnType<typeof api.notes.list>>>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>();
  const [selectedTag, setSelectedTag] = useState<string>();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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
    <div className="flex h-full min-h-screen">
      <FolderSidebar folders={folders} selected={selectedFolder} onSelect={setSelectedFolder} />

      <div className="flex-1 p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">All Notes</h1>
        </header>

        <div className="relative mb-4 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-10"
          />
        </div>

        <TagFilter tags={tags} selected={selectedTag} onSelect={setSelectedTag} />

        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
            {notes.length === 0 && <p className="text-muted">No notes found.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
