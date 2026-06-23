"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { NoteCard } from "@/components/NoteCard";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/motion";
import { Search, FileText, MessageSquare, BookOpen } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0, comments: 0 });
  const [recentNotes, setRecentNotes] = useState<Awaited<ReturnType<typeof api.notes.list>>>([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Awaited<ReturnType<typeof api.notes.list>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.notes.stats(), api.notes.list()])
      .then(([s, notes]) => {
        setStats(s);
        setRecentNotes(notes.slice(0, 6));
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    const results = await api.notes.list({ q: search.trim() });
    setSearchResults(results);
  }

  const statCards = [
    { label: "Tổng ghi chú", value: stats.total, icon: BookOpen },
    { label: "Đã xuất bản", value: stats.published, icon: FileText },
    { label: "Bản nháp", value: stats.drafts, icon: FileText },
    { label: "Bình luận", value: stats.comments, icon: MessageSquare },
  ];

  return (
    <PageTransition>
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Trang chủ</h1>
        <p className="mt-1 text-muted">Tổng quan hệ thống tri thức nội bộ</p>
      </header>

      <StaggerContainer className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <StaggerItem key={card.label}>
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted">{card.label}</span>
                <card.icon size={18} className="text-accent" />
              </div>
              <p className="text-3xl font-bold">{loading ? "—" : card.value}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm nhanh..."
            className="w-full pl-10"
          />
        </div>
        <button type="submit" className="rounded-lg bg-accent px-4 py-2 font-medium text-black hover:bg-accent-hover">
          Tìm
        </button>
      </form>

      {searchResults.length > 0 ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Kết quả tìm kiếm</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {searchResults.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </section>
      ) : (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Ghi chú gần đây</h2>
            <Link href="/notes" className="text-sm text-accent hover:text-accent-hover">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
            {!loading && recentNotes.length === 0 && (
              <p className="text-muted">
                Chưa có ghi chú nào.{" "}
                <Link href="/notes/new" className="text-accent">
                  Tạo ghi chú đầu tiên
                </Link>
              </p>
            )}
          </div>
        </section>
      )}
    </div>
    </PageTransition>
  );
}
