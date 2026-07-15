"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { FolderSelect } from "@/components/FolderSelect";
import { StatusRadio } from "@/components/StatusRadio";
import { writeLastAuthor } from "@/lib/preferences";
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
      writeLastAuthor(author);
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
        {note && (
          <p className="mt-1 text-xs text-muted">
            Ngày tạo gốc được giữ nguyên khi lưu / xuất bản — chỉ cập nhật ngày sửa.
          </p>
        )}
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề" required className="w-full" />
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Tác giả" required className="w-full" />
          <FolderSelect value={folder} onChange={setFolder} />
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags" className="w-full" />
          <div className="md:col-span-2 rounded-lg border border-border bg-surface px-4 py-3">
            <p className="mb-2 text-xs font-medium text-muted">Trạng thái</p>
            <StatusRadio
              value={status}
              onChange={setStatus}
              draftLabel="Bản nháp"
              publishLabel="Xuất bản"
            />
          </div>
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
