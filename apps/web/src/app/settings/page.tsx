"use client";

import { useEffect, useState } from "react";
import { ArrowUp, Globe, Palette } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useI18n, type Locale } from "@/lib/i18n";
import { readScrollToTopEnabled, writeScrollToTopEnabled } from "@/lib/preferences";

export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const [scrollToTop, setScrollToTop] = useState(true);

  useEffect(() => {
    setScrollToTop(readScrollToTopEnabled());
  }, []);

  function toggleScrollToTop(next: boolean) {
    setScrollToTop(next);
    writeScrollToTopEnabled(next);
    window.dispatchEvent(new Event("kb-prefs-changed"));
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
        <p className="text-sm text-muted">{t("settings.subtitle")}</p>
      </header>

      <section className="mb-6 rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Palette size={18} className="text-accent" />
          {t("settings.theme")}
        </h2>
        <p className="mb-4 text-sm text-muted">{t("settings.themeDesc")}</p>
        <ThemeToggle />
      </section>

      <section className="mb-6 rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Globe size={18} className="text-accent" />
          {t("settings.language")}
        </h2>
        <p className="mb-4 text-sm text-muted">{t("settings.languageDesc")}</p>
        <div className="grid grid-cols-2 gap-2">
          <LanguageOption label="Tiếng Việt" value="vi" current={locale} onSelect={setLocale} />
          <LanguageOption label="English" value="en" current={locale} onSelect={setLocale} />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <ArrowUp size={18} className="text-accent" />
          {t("settings.scrollTop")}
        </h2>
        <p className="mb-4 text-sm text-muted">{t("settings.scrollTopDesc")}</p>
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
          <span className="text-sm">{t("settings.scrollTopToggle")}</span>
          <button
            type="button"
            role="switch"
            aria-checked={scrollToTop}
            onClick={() => toggleScrollToTop(!scrollToTop)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              scrollToTop ? "bg-accent" : "bg-surface-elevated"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                scrollToTop ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </label>
      </section>
    </div>
  );
}

function LanguageOption({
  label,
  value,
  current,
  onSelect,
}: {
  label: string;
  value: Locale;
  current: Locale;
  onSelect: (locale: Locale) => void;
}) {
  const active = value === current;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-border text-muted hover:border-accent/40 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
