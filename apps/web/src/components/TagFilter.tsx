"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const DEFAULT_VISIBLE = 14;

interface TagFilterProps {
  tags: string[];
  selectedTag?: string;
  onSelect: (tag: string | undefined) => void;
  allLabel: string;
}

export function TagFilter({ tags, selectedTag, onSelect, allLabel }: TagFilterProps) {
  const [expanded, setExpanded] = useState(false);

  const sorted = useMemo(() => {
    if (!selectedTag) return tags;
    return [selectedTag, ...tags.filter((t) => t !== selectedTag)];
  }, [tags, selectedTag]);

  if (tags.length === 0) return null;

  const needsCollapse = sorted.length > DEFAULT_VISIBLE;
  const visible = expanded || !needsCollapse ? sorted : sorted.slice(0, DEFAULT_VISIBLE);
  const hiddenCount = sorted.length - DEFAULT_VISIBLE;

  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelect(undefined)}
          className={`rounded-full px-3 py-1 text-xs transition-colors ${
            !selectedTag ? "bg-accent text-black" : "bg-surface-elevated text-muted hover:text-foreground"
          }`}
        >
          {allLabel}
        </button>
        {visible.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onSelect(tag)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              selectedTag === tag
                ? "bg-accent text-black"
                : "bg-surface-elevated text-muted hover:text-foreground"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      {needsCollapse && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 inline-flex items-center gap-1 text-xs text-muted hover:text-accent"
        >
          {expanded ? (
            <>
              <ChevronUp size={14} /> Thu gọn tags
            </>
          ) : (
            <>
              <ChevronDown size={14} /> Hiện thêm {hiddenCount} tags
            </>
          )}
        </button>
      )}
    </div>
  );
}
