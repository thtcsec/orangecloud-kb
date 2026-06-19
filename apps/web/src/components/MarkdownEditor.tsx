"use client";

import { useState } from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-surface">
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setTab("write")}
          className={`px-4 py-2 text-sm ${tab === "write" ? "border-b-2 border-accent text-accent" : "text-muted"}`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={`px-4 py-2 text-sm ${tab === "preview" ? "border-b-2 border-accent text-accent" : "text-muted"}`}
        >
          Preview
        </button>
      </div>

      {tab === "write" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[500px] flex-1 resize-none border-0 bg-transparent p-4 font-mono text-sm focus:ring-0"
        />
      ) : (
        <div className="min-h-[500px] flex-1 overflow-auto p-4">
          {value ? <MarkdownRenderer content={value} /> : <p className="text-muted">Nothing to preview</p>}
        </div>
      )}
    </div>
  );
}
