"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ClientDate } from "@/components/ClientDate";
import type { Note } from "@kb/shared";
import { Check, Trash2, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function AdminNotesPage() {
  return <AdminNotesContent />;
}

function AdminNotesContent() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.notes
      .list()
      .then(setNotes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === notes.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(notes.map((n) => n.id)));
    }
  }

  async function bulkAction(action: "publish" | "unpublish" | "delete") {
    if (selected.size === 0) return;
    const confirmMsg =
      action === "delete"
        ? `Xoá ${selected.size} ghi chú? Hành động không thể hoàn tác.`
        : `${action === "publish" ? "Xuất bản" : "Ẩn"} ${selected.size} ghi chú?`;

    if (!confirm(confirmMsg)) return;

    setActing(true);
    setMessage("");
    let success = 0;
    let failed = 0;

    for (const id of selected) {
      try {
        if (action === "delete") {
          await api.notes.delete(id);
        } else {
          await api.notes.update(id, { status: action === "publish" ? "published" : "draft" });
        }
        success++;
      } catch {
        failed++;
      }
    }

    setMessage(`${success} thành công, ${failed} thất bại`);
    setSelected(new Set());
    setActing(false);

    // Refresh list
    api.notes.list().then(setNotes).catch(console.error);
  }

  if (loading) {
    return <div className="p-6 text-muted">Đang tải...</div>;
  }

  return (
    <div className="p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin" className="mb-2 flex items-center gap-1 text-sm text-muted hover:text-foreground">
            <ArrowLeft size={14} /> Quay lại Admin
          </Link>
          <h1 className="text-2xl font-bold">Quản lý ghi chú</h1>
          <p className="text-sm text-muted">{notes.length} ghi chú</p>
        </div>
      </header>

      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 p-3">
          <span className="text-sm font-medium">{selected.size} đã chọn</span>
          <button
            onClick={() => bulkAction("publish")}
            disabled={acting}
            className="flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            <Eye size={14} /> Xuất bản
          </button>
          <button
            onClick={() => bulkAction("unpublish")}
            disabled={acting}
            className="flex items-center gap-1 rounded-md bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-700 disabled:opacity-50"
          >
            <EyeOff size={14} /> Ẩn
          </button>
          <button
            onClick={() => bulkAction("delete")}
            disabled={acting}
            className="flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 size={14} /> Xoá
          </button>
        </div>
      )}

      {message && (
        <div className="mb-4 rounded-lg border border-border bg-surface-elevated p-3 text-sm">
          {message}
        </div>
      )}

      {notes.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center text-muted">
          Chưa có ghi chú nào.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.size === notes.length && notes.length > 0}
                    onChange={toggleAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted">Tiêu đề</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Tác giả</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Trạng thái</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Thư mục</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {notes.map((note) => (
                <tr key={note.id} className="hover:bg-surface-elevated/50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(note.id)}
                      onChange={() => toggleSelect(note.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/notes/${note.id}`} className="font-medium text-foreground hover:text-accent">
                      {note.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{note.author}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                        note.status === "published"
                          ? "bg-green-500/15 text-green-700 dark:text-green-400"
                          : "bg-surface-elevated text-muted"
                      }`}
                    >
                      {note.status === "published" ? <Check size={12} /> : null}
                      {note.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{note.folder ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">
                    <ClientDate iso={note.updated_at} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
