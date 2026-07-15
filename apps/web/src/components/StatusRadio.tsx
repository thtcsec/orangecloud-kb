"use client";

interface StatusRadioProps {
  value: "draft" | "published";
  onChange: (value: "draft" | "published") => void;
  draftLabel: string;
  publishLabel: string;
}

export function StatusRadio({ value, onChange, draftLabel, publishLabel }: StatusRadioProps) {
  return (
    <fieldset className="flex flex-wrap items-center gap-4">
      <legend className="sr-only">Trạng thái</legend>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="radio"
          name="note-status"
          value="draft"
          checked={value === "draft"}
          onChange={() => onChange("draft")}
          className="accent-[var(--accent)]"
        />
        <span className={value === "draft" ? "text-foreground font-medium" : "text-muted"}>{draftLabel}</span>
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="radio"
          name="note-status"
          value="published"
          checked={value === "published"}
          onChange={() => onChange("published")}
          className="accent-[var(--accent)]"
        />
        <span className={value === "published" ? "text-foreground font-medium" : "text-muted"}>
          {publishLabel}
        </span>
      </label>
    </fieldset>
  );
}
