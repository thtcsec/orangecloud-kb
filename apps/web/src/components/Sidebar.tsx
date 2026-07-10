"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, MessageSquare, Plus, Settings } from "lucide-react";
import { useResolvedTheme } from "./ThemeProvider";
import { useI18n } from "@/lib/i18n";

export function Sidebar() {
  const pathname = usePathname();
  const resolvedTheme = useResolvedTheme();
  const { t } = useI18n();

  const links = [
    { href: "/", label: t("nav.home"), icon: Home, exact: true },
    { href: "/notes", label: t("nav.notes"), icon: BookOpen, matchNotes: true },
    { href: "/notes/new", label: t("nav.new"), icon: Plus },
    { href: "/chat", label: t("nav.chat"), icon: MessageSquare },
    { href: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  function isActive(href: string, exact?: boolean, matchNotes?: boolean): boolean {
    if (exact) return pathname === href;
    if (matchNotes) {
      return pathname === "/notes" || (pathname.startsWith("/notes/") && !pathname.startsWith("/notes/new"));
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-surface p-4">
      {/* Logo — click to go home */}
      <Link href="/" className="relative mb-6 flex items-center justify-center h-16 overflow-hidden">
        <Image
          src="/logo-light.png"
          alt="OrangeCloud Knowledge Base"
          width={200}
          height={52}
          priority
          className={`absolute transition-opacity duration-300 ease-in-out object-contain ${
            resolvedTheme === "light" ? "opacity-100" : "opacity-0"
          }`}
        />
        <Image
          src="/logo-dark.png"
          alt="OrangeCloud Knowledge Base"
          width={200}
          height={52}
          priority
          className={`absolute transition-opacity duration-300 ease-in-out object-contain ${
            resolvedTheme === "dark" ? "opacity-100" : "opacity-0"
          }`}
        />
      </Link>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ href, label, icon: Icon, exact, matchNotes }) => {
          const active = isActive(href, exact, matchNotes);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
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

      {/* Footer */}
      <div className="border-t border-border pt-3 px-2">
        <p className="text-[10px] text-muted leading-relaxed">
          Built by <span className="text-foreground font-medium">Trinh Hoang Tu</span> &amp; <span className="text-foreground font-medium">Le Sy Cuong</span>
        </p>
      </div>
    </aside>
  );
}
