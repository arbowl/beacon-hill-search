import Link from "next/link";
import { ComplianceBadge } from "./ComplianceBadge";
import type { SearchResult } from "@/lib/models/bill";
import { cn } from "@/lib/utils";
import { getCommitteeShortName } from "@/lib/committees";

interface BillCardProps {
  bill: SearchResult;
  className?: string;
}

export function BillCard({ bill, className }: BillCardProps) {
  const hasCompanions = bill.companions.length > 0;

  return (
    <div
      className={cn(
        "bg-white border border-navy-100 rounded-lg overflow-hidden",
        "hover:border-navy-300 hover:shadow-md transition-all duration-150",
        className
      )}
    >
      {/* Primary result row */}
      <Link
        href={`/bills/${encodeURIComponent(bill.billId)}`}
        className={cn(
          "flex items-start justify-between gap-3 p-4 sm:p-5",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400",
          hasCompanions && "border-b border-navy-50"
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-xs font-semibold text-navy-700 bg-navy-50 border border-navy-100 px-1.5 py-0.5 rounded shrink-0">
              {bill.billLabel}
            </span>
            <ComplianceBadge state={bill.computedState} />
          </div>
          <h3 className="text-sm sm:text-base text-navy-900 font-medium leading-snug line-clamp-2">
            {bill.title || <span className="italic text-navy-400">Untitled bill</span>}
          </h3>
          {bill.committeeId && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-navy-400">
              <CommitteeIcon />
              {getCommitteeShortName(bill.committeeId)}
            </div>
          )}
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className="shrink-0 text-navy-300 mt-1" aria-hidden
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Link>

      {/* Companion rows — same bill, different committee referrals */}
      {hasCompanions && (
        <div className="divide-y divide-navy-50">
          {bill.companions.map((c) => (
            <Link
              key={c.artifactId}
              href={`/bills/${encodeURIComponent(bill.billId)}?artifact=${c.artifactId}`}
              className={cn(
                "flex items-center gap-2.5 px-4 sm:px-5 py-2.5",
                "bg-navy-50/40 hover:bg-navy-50 transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              )}
            >
              <span className="text-xs text-navy-400 shrink-0">Also referred to</span>
              <CommitteeIcon className="text-navy-300 shrink-0" />
              <span className="text-xs text-navy-600 flex-1 min-w-0 truncate">
                {getCommitteeShortName(c.committeeId)}
              </span>
              <ComplianceBadge state={c.computedState} className="shrink-0" />
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                className="shrink-0 text-navy-300" aria-hidden
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function CommitteeIcon({ className }: { className?: string }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      className={className} aria-hidden
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
