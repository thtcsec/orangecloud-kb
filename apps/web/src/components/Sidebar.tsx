"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, MessageSquare, Plus, Settings } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/", label: "Dashboard", icon: Home, exact: true },
  { href: "/notes", label: "Notes", icon: BookOpen, matchNotes: true },
  { href: "/notes/new", label: "New Note", icon: Plus },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string, exact?: boolean, matchNotes?: boolean): boolean {
  if (exact) return pathname === href;
  if (matchNotes) {
    return pathname === "/notes" || (pathname.startsWith("/notes/") && !pathname.startsWith("/notes/new"));
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-surface p-4">
      <div className="mb-8 px-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">OrangeCloud</p>
        <h1 className="text-lg font-bold text-foreground">Knowledge Base</h1>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ href, label, icon: Icon, exact, matchNotes }) => {
          const active = isActive(pathname, href, exact, matchNotes);

          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
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

      <ThemeToggle />
    </aside>
  );
}
