"use client";

import { Globe, Palette } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useI18n, type Locale } from "@/lib/i18n";

export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n();

  return (
    <div className="mx-auto max-w-2xl p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
        <p className="text-sm text-muted">{t("settings.subtitle")}</p>
      </header>

      {/* Theme */}
      <section className="mb-6 rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Palette size={18} className="text-accent" />
          {t("settings.theme")}
        </h2>
        <p className="mb-4 text-sm text-muted">{t("settings.themeDesc")}</p>
        <ThemeToggle />
      </section>

      {/* Language */}
      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Globe size={18} className="text-accent" />
          {t("settings.language")}
        </h2>
        <p className="mb-4 text-sm text-muted">{t("settings.languageDesc")}</p>
        <div className="grid grid-cols-2 gap-2">
          <LanguageOption
            label="Tiếng Việt"
            value="vi"
            current={locale}
            onSelect={setLocale}
          />
          <LanguageOption
            label="English"
            value="en"
            current={locale}
            onSelect={setLocale}
          />
        </div>
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
