import type { Metadata } from "next";
import { SearchBar } from "@/components/ui/SearchBar";
import { BillCard } from "@/components/ui/BillCard";
import { Pagination } from "@/components/ui/Pagination";
import { searchBills, getDistinctCommittees } from "@/lib/db/queries";
import { FilterChips } from "./FilterChips";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    committee?: string;
    session?: string;
    state?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const sp = await searchParams;
  const q = sp.q ?? "";
  return {
    title: q ? `"${q}" — Search` : "Browse Bills",
    description: q
      ? `Massachusetts legislative bills matching "${q}"`
      : "Browse all Massachusetts legislative bills in the Beacon Hill Search.",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const committee = sp.committee;
  const session = sp.session;
  const state = sp.state;

  const results = searchBills({
    q,
    page,
    committeeId: committee,
    session,
    computedState: state,
  });

  const committees = getDistinctCommittees().slice(0, 30);

  function buildHref(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    if (committee) params.set("committee", committee);
    if (session) params.set("session", session);
    if (state) params.set("state", state);
    return `/search?${params.toString()}`;
  }

  const hasFilters = !!(committee || session || state);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Search input */}
      <div className="mb-6">
        <SearchBar defaultValue={q} />
      </div>

      {/* Filters */}
      <FilterChips
        committees={committees}
        activeCommittee={committee}
        activeState={state}
        q={q}
        page={page}
      />

      {/* Results header */}
      <div className="flex items-center justify-between mb-4 mt-5">
        <p className="text-sm text-navy-500">
          {results.total === 0 ? (
            "No results"
          ) : (
            <>
              <span className="font-semibold text-navy-800">
                {results.total.toLocaleString()}
              </span>{" "}
              {results.total === 1 ? "bill" : "bills"}
              {q && (
                <>
                  {" "}
                  for{" "}
                  <span className="font-semibold text-navy-800">
                    &ldquo;{q}&rdquo;
                  </span>
                </>
              )}
              {results.totalPages > 1 && (
                <>
                  {" "}
                  &mdash; page {page} of {results.totalPages}
                </>
              )}
            </>
          )}
        </p>
        {hasFilters && (
          <a
            href={q ? `/search?q=${encodeURIComponent(q)}` : "/search"}
            className="text-xs text-navy-400 hover:text-navy-600 underline"
          >
            Clear filters
          </a>
        )}
      </div>

      {/* Results list */}
      {results.results.length === 0 ? (
        <EmptyState q={q} />
      ) : (
        <div className="space-y-3" role="list" aria-label="Search results">
          {results.results.map((bill) => (
            <div key={bill.artifactId} role="listitem">
              <BillCard bill={bill} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={results.totalPages}
        buildHref={buildHref}
      />
    </div>
  );
}

function EmptyState({ q }: { q: string }) {
  return (
    <div className="text-center py-16 text-navy-400">
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="mx-auto mb-4 text-navy-300"
        aria-hidden
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <p className="font-medium text-navy-600 mb-1">No bills found</p>
      <p className="text-sm">
        {q ? (
          <>
            No results for &ldquo;<strong>{q}</strong>&rdquo;. Try a different
            search term, bill number, or committee name.
          </>
        ) : (
          "Enter a search term or browse with filters."
        )}
      </p>
    </div>
  );
}
