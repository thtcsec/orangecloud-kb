"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Folder, Plus } from "lucide-react";

interface FolderSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function FolderSelect({ value, onChange }: FolderSelectProps) {
  const [folders, setFolders] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);

  useEffect(() => {
    api.notes.folders().then(setFolders).catch(() => {});
  }, []);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  const filtered = folders.filter((f) =>
    f.toLowerCase().includes(search.toLowerCase()),
  );
  const showCreate = search.trim() && !folders.includes(search.trim());

  function select(folder: string) {
    onChange(folder);
    setSearch(folder);
    setOpen(false);
  }

  return (
    <div className="relative">
      <input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Thư mục (chọn hoặc tạo mới)"
        className="w-full"
      />
      {open && (filtered.length > 0 || showCreate) && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-auto rounded-lg border border-border bg-surface shadow-lg">
          {filtered.map((f) => (
            <button
              key={f}
              type="button"
              onMouseDown={() => select(f)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-elevated"
            >
              <Folder size={14} className="text-muted" />
              {f}
            </button>
          ))}
          {showCreate && (
            <button
              type="button"
              onMouseDown={() => select(search.trim())}
              className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm text-accent hover:bg-surface-elevated"
            >
              <Plus size={14} />
              Tạo &quot;{search.trim()}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
