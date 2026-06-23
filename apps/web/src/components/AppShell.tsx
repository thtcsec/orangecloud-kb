"use client";

import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/Toast";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="flex min-h-screen">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="fixed left-4 top-4 z-40 rounded-lg border border-border bg-surface p-2 shadow-md lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div
            className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 lg:static lg:translate-x-0 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="relative">
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

          <main className="flex-1 overflow-auto pl-0 lg:pl-0">{children}</main>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
