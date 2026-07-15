"use client";

import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/Toast";
import { ScrollToTop } from "@/components/ScrollToTop";
import { I18nProvider } from "@/lib/i18n";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <ThemeProvider>
      <I18nProvider>
        <ToastProvider>
          <div className="flex h-screen">
            {!isAdmin && <Sidebar />}
            <main data-scroll-container className="flex-1 overflow-y-auto">
              {children}
            </main>
            {!isAdmin && <ScrollToTop />}
          </div>
        </ToastProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
