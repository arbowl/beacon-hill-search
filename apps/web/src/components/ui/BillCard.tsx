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
  return (
    <Link
      href={`/bills/${encodeURIComponent(bill.billId)}`}
      className={cn(
        "block bg-white border border-navy-100 rounded-lg p-4 sm:p-5",
        "hover:border-navy-300 hover:shadow-md transition-all duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
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
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="shrink-0 text-navy-300 mt-1"
          aria-hidden
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>

      {bill.committeeId && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-navy-400">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {getCommitteeShortName(bill.committeeId)}
        </div>
      )}
    </Link>
  );
}
