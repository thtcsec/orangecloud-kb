"use client";

import { useEffect, useId, useRef } from "react";
import mermaid from "mermaid";
import { useResolvedTheme } from "./ThemeProvider";

export function MermaidDiagram({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const theme = useResolvedTheme();
  const baseId = useId().replace(/:/g, "");

  useEffect(() => {
    if (!ref.current) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: theme === "dark" ? "dark" : "default",
      securityLevel: "loose",
    });

    const renderId = `mermaid-${baseId}`;
    let cancelled = false;

    mermaid
      .render(renderId, chart)
      .then(({ svg }) => {
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      })
      .catch((err) => {
        if (!cancelled && ref.current) {
          ref.current.textContent = `Mermaid error: ${err instanceof Error ? err.message : "unknown"}`;
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chart, theme, baseId]);

  return (
    <div
      ref={ref}
      className="my-4 overflow-x-auto rounded-lg border border-border bg-surface-elevated p-4"
      suppressHydrationWarning
    />
  );
}
