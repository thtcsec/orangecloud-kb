"use client";

import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/Toast";
import { I18nProvider } from "@/lib/i18n";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <ThemeProvider>
      <I18nProvider>
        <ToastProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Mobile menu button */}
            {!isAdmin && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="fixed left-4 top-4 z-40 rounded-lg border border-border bg-surface p-2 shadow-md lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
            )}

            {/* Mobile overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar - only show on non-admin routes */}
            {!isAdmin && (
              <div
                className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 lg:static lg:translate-x-0 ${
                  sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
              >
                <div className="relative h-full">
                  <Sidebar />
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="absolute right-3 top-3 rounded-md p-1 text-muted hover:text-foreground lg:hidden"
                    aria-label="Close menu"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Main content - scrollable */}
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </ToastProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
