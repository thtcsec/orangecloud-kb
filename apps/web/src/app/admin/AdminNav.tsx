"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Settings, ArrowLeft } from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/notes", label: "Ghi chú", icon: FileText },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 flex-col border-r border-border bg-surface p-4">
      <div className="mb-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-surface-elevated hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Về trang chính
        </Link>
      </div>

      <div className="mb-4 px-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-accent">Admin</h2>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {adminLinks.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href) && href !== "/admin";

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "text-muted hover:bg-surface-elevated hover:text-foreground"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
