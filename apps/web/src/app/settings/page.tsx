"use client";

import { Palette } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Cài đặt</h1>
        <p className="text-sm text-muted">Tuỳ chỉnh giao diện</p>
      </header>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Palette size={18} className="text-accent" />
          Giao diện
        </h2>
        <p className="mb-4 text-sm text-muted">Chọn chế độ hiển thị phù hợp với bạn.</p>
        <ThemeToggle />
      </section>
    </div>
  );
}
