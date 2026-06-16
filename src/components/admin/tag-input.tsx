import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  error?: string;
  maxTags?: number;
};

export function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
  error,
  maxTags = 40,
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  function addTag(raw: string) {
    const tag = raw.trim().replace(/,$/, "");
    if (!tag) return;
    if (value.length >= maxTags) return;
    if (value.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function onPaste(text: string) {
    const parts = text.split(/[,;\n]+/).map((p) => p.trim()).filter(Boolean);
    if (parts.length <= 1) return;
    const next = [...value];
    for (const part of parts) {
      if (next.length >= maxTags) break;
      if (!next.some((t) => t.toLowerCase() === part.toLowerCase())) {
        next.push(part);
      }
    }
    onChange(next);
    setDraft("");
  }

  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 min-h-10 rounded-md border bg-transparent px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-ring",
          error ? "border-destructive focus-within:ring-destructive" : "border-input",
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-2.5 py-0.5 text-xs text-foreground"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              className="rounded-full p-0.5 hover:bg-[var(--gold)]/20 text-muted-foreground hover:text-foreground"
              onClick={() => onChange(value.filter((t) => t !== tag))}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => { if (draft.trim()) addTag(draft); }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (text.includes(",") || text.includes(";") || text.includes("\n")) {
              e.preventDefault();
              onPaste(text);
            }
          }}
          placeholder={value.length ? "Add another…" : placeholder}
          disabled={value.length >= maxTags}
          className="flex-1 min-w-[140px] bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
      </div>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        <p className="text-xs text-muted-foreground">Press Enter to add each item. Paste comma-separated lists too.</p>
      )}
    </div>
  );
}
