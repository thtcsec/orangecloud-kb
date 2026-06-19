"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { MarkdownEditor } from "@/components/MarkdownEditor";

export default function NewNotePage() {
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
      setError(err instanceof Error ? err.message : "Failed to create note");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">New Note</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required className="w-full" />
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author" required className="w-full" />
          <input value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="Folder (e.g. research/rag)" className="w-full" />
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma-separated)" className="w-full" />
          <select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")} className="w-full">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <MarkdownEditor value={content} onChange={setContent} placeholder="Write your note in markdown..." />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="rounded-lg bg-accent px-4 py-2 font-medium text-black hover:bg-accent-hover">
            {loading ? "Saving..." : "Create Note"}
          </button>
        </div>
      </form>
    </div>
  );
}
