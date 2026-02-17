import Link from "next/link";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export function Pagination({ page, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageRange(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1 mt-8"
    >
      {/* Previous */}
      <PageLink
        href={page > 1 ? buildHref(page - 1) : null}
        aria-label="Previous page"
        disabled={page <= 1}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </PageLink>

      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="px-2 text-navy-400 text-sm select-none"
          >
            …
          </span>
        ) : (
          <PageLink
            key={p}
            href={buildHref(p as number)}
            active={p === page}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </PageLink>
        )
      )}

      {/* Next */}
      <PageLink
        href={page < totalPages ? buildHref(page + 1) : null}
        aria-label="Next page"
        disabled={page >= totalPages}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  children,
  active,
  disabled,
  "aria-label": ariaLabel,
  "aria-current": ariaCurrent,
}: {
  href: string | null;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-current"?: "page" | undefined;
}) {
  const base =
    "inline-flex items-center justify-center min-w-[36px] h-9 px-2 rounded text-sm font-medium transition-colors";

  if (disabled || !href) {
    return (
      <span
        aria-label={ariaLabel}
        aria-disabled
        className={cn(base, "text-navy-300 cursor-not-allowed")}
      >
        {children}
      </span>
    );
  }

  if (active) {
    return (
      <span
        aria-current={ariaCurrent}
        aria-label={ariaLabel}
        className={cn(base, "bg-navy-800 text-white cursor-default")}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        base,
        "text-navy-700 bg-white border border-navy-200 hover:bg-navy-50 hover:border-navy-300"
      )}
    >
      {children}
    </Link>
  );
}

function buildPageRange(
  current: number,
  total: number
): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (
    let p = Math.max(2, current - 1);
    p <= Math.min(total - 1, current + 1);
    p++
  ) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}
