"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getCommitteeShortName } from "@/lib/committees";

interface FilterChipsProps {
  committees: { id: string; count: number }[];
  activeCommittee?: string;
  activeState?: string;
  q: string;
  page: number;
}

const COMPLIANCE_STATES = [
  { value: "Compliant", label: "Compliant" },
  { value: "Non-Compliant", label: "Non-Compliant" },
];

export function FilterChips({
  committees,
  activeCommittee,
  activeState,
  q,
}: FilterChipsProps) {
  const router = useRouter();

  function buildUrl(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const next = {
      committee: activeCommittee,
      state: activeState,
      ...updates,
    };
    if (next.committee) params.set("committee", next.committee);
    if (next.state) params.set("state", next.state);
    return `/search?${params.toString()}`;
  }

  function handleCommitteeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    router.push(buildUrl({ committee: val || undefined }));
  }

  const hasFilters = activeCommittee || activeState;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">

      {/* Status chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-navy-400 shrink-0 mr-0.5">Status:</span>
        <Link
          href={buildUrl({ state: undefined })}
          className={cn(
            "text-xs px-2.5 py-1 rounded-full border transition-colors",
            !activeState
              ? "bg-navy-800 text-white border-navy-800"
              : "bg-white text-navy-600 border-navy-200 hover:border-navy-400"
          )}
        >
          All
        </Link>
        {COMPLIANCE_STATES.map((s) => (
          <Link
            key={s.value}
            href={buildUrl({ state: activeState === s.value ? undefined : s.value })}
            className={cn(
              "text-xs px-2.5 py-1 rounded-full border transition-colors",
              activeState === s.value
                ? s.value === "Compliant"
                  ? "bg-green-700 text-white border-green-700"
                  : "bg-red-700 text-white border-red-700"
                : "bg-white text-navy-600 border-navy-200 hover:border-navy-400"
            )}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {/* Committee dropdown */}
      <div className="flex items-center gap-1.5">
        <label
          htmlFor="committee-filter"
          className="text-xs text-navy-400 shrink-0"
        >
          Committee:
        </label>
        <select
          id="committee-filter"
          value={activeCommittee ?? ""}
          onChange={handleCommitteeChange}
          className={cn(
            "text-xs border rounded-full px-2.5 py-1 pr-6 bg-white transition-colors",
            "appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-400",
            activeCommittee
              ? "border-navy-800 bg-navy-800 text-white"
              : "border-navy-200 text-navy-600 hover:border-navy-400"
          )}
          style={{ backgroundImage: "none" }}
        >
          <option value="">All committees</option>
          {committees.map((c) => (
            <option key={c.id} value={c.id}>
              {getCommitteeShortName(c.id)} ({c.count})
            </option>
          ))}
        </select>
      </div>

      {/* Clear all */}
      {hasFilters && (
        <Link
          href={q ? `/search?q=${encodeURIComponent(q)}` : "/search"}
          className="text-xs text-navy-400 hover:text-navy-600 underline"
        >
          Clear filters
        </Link>
      )}
    </div>
  );
}
