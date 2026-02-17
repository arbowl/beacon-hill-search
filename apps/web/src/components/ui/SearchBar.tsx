"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  /** Compact variant for header use */
  compact?: boolean;
  /** Initial query value (pass from server component via searchParams) */
  defaultValue?: string;
  /** Custom placeholder */
  placeholder?: string;
}

export function SearchBar({
  compact = false,
  defaultValue = "",
  placeholder = "Search by bill number, title, legislator, committee…",
}: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search legislative bills"
      className="flex gap-2"
    >
      <div className="relative flex-1">
        <span
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none",
            compact ? "text-white/50" : "text-navy-300"
          )}
          aria-hidden
        >
          <svg
            width={compact ? 16 : 20}
            height={compact ? 16 : 20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={compact ? "Search bills…" : placeholder}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          className={cn(
            "w-full rounded-md border bg-white pr-3 text-navy-900",
            "placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-gold-400",
            "transition-shadow",
            compact
              ? "h-8 pl-8 text-sm border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:bg-white/20"
              : "h-12 pl-10 text-base border-navy-200 shadow-sm hover:border-navy-300 focus:border-gold-400"
          )}
        />
      </div>
      <button
        type="submit"
        className={cn(
          "rounded-md font-medium transition-colors shrink-0",
          compact
            ? "h-8 px-3 text-sm bg-gold-500 text-navy-900 hover:bg-gold-400"
            : "h-12 px-5 text-base bg-navy-800 text-white hover:bg-navy-700 shadow-sm"
        )}
      >
        {compact ? "Go" : "Search"}
      </button>
    </form>
  );
}
