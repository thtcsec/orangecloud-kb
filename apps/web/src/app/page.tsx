"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { NoteCard } from "@/components/NoteCard";
import { Search, FileText, MessageSquare, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

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
    { label: "Total Notes", value: stats.total, icon: BookOpen },
    { label: "Published", value: stats.published, icon: FileText },
    { label: "Drafts", value: stats.drafts, icon: FileText },
    { label: "Comments", value: stats.comments, icon: MessageSquare },
  ];

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted">Internal knowledge base overview</p>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-muted">{card.label}</span>
              <card.icon size={18} className="text-accent" />
            </div>
            <p className="text-3xl font-bold">{loading ? "—" : card.value}</p>
          </motion.div>
        ))}
      </div>

      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Quick search notes..."
            className="w-full pl-10"
          />
        </div>
        <button type="submit" className="rounded-lg bg-accent px-4 py-2 font-medium text-black hover:bg-accent-hover">
          Search
        </button>
      </form>

      {searchResults.length > 0 ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Search Results</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {searchResults.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </section>
      ) : (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Notes</h2>
            <Link href="/notes" className="text-sm text-accent hover:text-accent-hover">
              View all →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
            {!loading && recentNotes.length === 0 && (
              <p className="text-muted">
                No notes yet.{" "}
                <Link href="/notes/new" className="text-accent">
                  Create your first note
                </Link>
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
