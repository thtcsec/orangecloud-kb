"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { AdminGuard } from "@/components/AdminGuard";
import { FileText, MessageSquare, Upload, Shield } from "lucide-react";

interface Stats {
  total: number;
  published: number;
  drafts: number;
  comments: number;
}

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}

function AdminDashboardContent() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.notes.stats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted">Tổng quan hệ thống và quản lý</p>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Tổng ghi chú" value={stats?.total ?? 0} />
        <StatCard icon={Upload} label="Đã xuất bản" value={stats?.published ?? 0} color="green" />
        <StatCard icon={FileText} label="Bản nháp" value={stats?.drafts ?? 0} color="yellow" />
        <StatCard icon={MessageSquare} label="Bình luận" value={stats?.comments ?? 0} color="blue" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <QuickAction
          href="/admin/notes"
          title="Quản lý ghi chú"
          description="Xuất bản, ẩn hoặc xoá hàng loạt"
          icon={FileText}
        />
        <QuickAction
          href="/admin/settings"
          title="Cài đặt hệ thống"
          description="Cấu hình API, trạng thái secrets, bảo mật"
          icon={Shield}
        />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof FileText;
  label: string;
  value: number;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    green: "text-green-500",
    yellow: "text-yellow-500",
    blue: "text-blue-500",
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <Icon size={18} className={colorClasses[color ?? ""] ?? "text-accent"} />
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: typeof FileText;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-4 rounded-xl border border-border bg-surface p-6 transition hover:border-accent/40 hover:shadow-sm"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
        <Icon size={20} className="text-accent" />
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
    </Link>
  );
}
