"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
});

export function MermaidDiagram({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const id = `mermaid-${Math.random().toString(36).slice(2)}`;

    mermaid
      .render(id, chart)
      .then(({ svg }) => {
        if (ref.current) ref.current.innerHTML = svg;
      })
      .catch((err) => {
        if (ref.current) {
          ref.current.textContent = `Mermaid error: ${err instanceof Error ? err.message : "unknown"}`;
        }
      });
  }, [chart]);

  return <div ref={ref} className="my-4 overflow-x-auto rounded-lg border border-border bg-black/20 p-4" />;
}
