"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, MessageSquare, Plus, Settings } from "lucide-react";
import { motion } from "framer-motion";

const links = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/notes", label: "Notes", icon: BookOpen },
  { href: "/notes/new", label: "New Note", icon: Plus },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-surface p-4">
      <div className="mb-8 px-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">OrangeCloud</p>
        <h1 className="text-lg font-bold text-foreground">Knowledge Base</h1>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href) && href !== "/notes/new");
          const isNotes = href === "/notes";
          const notesActive = isNotes && (pathname === "/notes" || (pathname.startsWith("/notes/") && !pathname.startsWith("/notes/new")));

          return (
            <Link key={href} href={href} className="relative">
              {(active || notesActive) && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-accent/10 border border-accent/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  active || notesActive ? "text-accent" : "text-zinc-400 hover:text-foreground"
                }`}
              >
                <Icon size={18} />
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
