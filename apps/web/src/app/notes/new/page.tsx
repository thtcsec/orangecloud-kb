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
      setError(err instanceof Error ? err.message : "Không thể tạo ghi chú");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Tạo ghi chú mới</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề" required className="w-full" />
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Tác giả" required className="w-full" />
          <input value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="Thư mục (VD: research/rag)" className="w-full" />
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (phân cách bởi dấu phẩy)" className="w-full" />
          <select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")} className="w-full">
            <option value="draft">Bản nháp</option>
            <option value="published">Xuất bản</option>
          </select>
        </div>

        <MarkdownEditor value={content} onChange={setContent} placeholder="Viết nội dung bằng markdown..." />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="rounded-lg bg-accent px-4 py-2 font-medium text-black hover:bg-accent-hover">
            {loading ? "Đang lưu..." : "Tạo ghi chú"}
          </button>
        </div>
      </form>
    </div>
  );
}
