"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { readScrollToTopEnabled } from "@/lib/preferences";

const SCROLL_THRESHOLD = 400;

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(readScrollToTopEnabled());

    const onStorage = (e: StorageEvent) => {
      if (e.key === "kb-scroll-to-top") setEnabled(readScrollToTopEnabled());
    };
    const onPref = () => setEnabled(readScrollToTopEnabled());
    window.addEventListener("storage", onStorage);
    window.addEventListener("kb-prefs-changed", onPref);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("kb-prefs-changed", onPref);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return;
    }

    const container = document.querySelector<HTMLElement>("[data-scroll-container]");
    if (!container) return;

    const onScroll = () => setVisible(container.scrollTop > SCROLL_THRESHOLD);
    onScroll();
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [enabled]);

  if (!enabled || !visible) return null;

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => {
        const container = document.querySelector<HTMLElement>("[data-scroll-container]");
        container?.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-accent shadow-lg transition hover:bg-accent hover:text-black"
    >
      <ArrowUp size={18} />
    </button>
  );
}
