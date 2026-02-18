"use client";
import { useState, useId } from "react";
import { cn } from "@/lib/utils";

interface AccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  className?: string;
}

export function Accordion({
  title,
  children,
  defaultOpen = false,
  badge,
  className,
}: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div
      className={cn(
        "border border-navy-100 rounded-lg overflow-hidden",
        className
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center justify-between px-4 sm:px-5 py-3.5",
          "bg-white hover:bg-navy-50 transition-colors text-left",
          "text-navy-900 font-medium text-sm sm:text-base"
        )}
      >
        <span className="flex items-center gap-2.5">
          {title}
          {badge}
        </span>
        <ChevronIcon open={open} />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="bg-white border-t border-navy-100"
      >
        <div className="px-4 sm:px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "shrink-0 text-navy-400 transition-transform duration-200",
        open && "rotate-180"
      )}
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
