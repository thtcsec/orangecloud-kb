"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import type { Note } from "@kb/shared";

export default function EditNotePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [folder, setFolder] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.notes
      .get(id)
      .then((n) => {
        setNote(n);
        setTitle(n.title);
        setContent(n.content);
        setAuthor(n.author);
        setTags(n.tags ?? "");
        setFolder(n.folder ?? "");
        setStatus(n.status);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Không thể tải ghi chú"));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.notes.update(id, { title, content, author, tags, folder, status });
      router.push(`/notes/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  }

  if (!note && !error) return <div className="p-6 text-muted">Đang tải...</div>;

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Chỉnh sửa ghi chú</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề" required className="w-full" />
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Tác giả" required className="w-full" />
          <input value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="Thư mục" className="w-full" />
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags" className="w-full" />
          <select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")} className="w-full">
            <option value="draft">Bản nháp</option>
            <option value="published">Xuất bản</option>
          </select>
        </div>

        <MarkdownEditor value={content} onChange={setContent} />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button type="submit" disabled={loading} className="rounded-lg bg-accent px-4 py-2 font-medium text-black hover:bg-accent-hover">
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
}
