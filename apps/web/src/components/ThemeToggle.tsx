"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import type { Theme } from "@/lib/theme";

const options: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Sáng", icon: Sun },
  { value: "dark", label: "Tối", icon: Moon },
  { value: "system", label: "Hệ thống", icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className="mt-auto rounded-lg border border-border bg-surface-elevated p-1">
        <div className="h-9" aria-hidden />
      </div>
    );
  }

  return (
    <div className="mt-auto rounded-lg border border-border bg-surface-elevated p-1">
      <p className="mb-2 px-2 pt-1 text-xs font-medium text-muted">Giao diện</p>
      <div className="grid grid-cols-3 gap-1">
        {options.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={`flex flex-col items-center gap-1 rounded-md px-2 py-2 text-xs transition ${
              theme === value
                ? "bg-accent text-black"
                : "text-muted hover:bg-surface hover:text-foreground"
            }`}
            aria-pressed={theme === value}
            aria-label={`Chế độ ${label}`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
