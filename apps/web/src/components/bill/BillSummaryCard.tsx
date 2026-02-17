import Link from "next/link";
import { ComplianceBadge } from "@/components/ui/ComplianceBadge";
import type { BillDetail } from "@/lib/models/bill";
import { formatDate, isPast } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getCommitteeName } from "@/lib/committees";

interface BillSummaryCardProps {
  bill: BillDetail;
}

export function BillSummaryCard({ bill }: BillSummaryCardProps) {
  const deadlinePast = isPast(bill.effectiveDeadline);
  const reportedOnTime =
    bill.reportedOut &&
    bill.reportedDate &&
    bill.effectiveDeadline &&
    bill.reportedDate <= bill.effectiveDeadline;

  return (
    <div className="bg-white border border-navy-100 rounded-xl p-5 sm:p-6 shadow-sm">
      {/* Bill identifier row */}
      <div className="flex items-start gap-3 flex-wrap mb-3">
        <span className="font-mono text-sm font-bold text-navy-700 bg-navy-50 border border-navy-100 px-2 py-1 rounded">
          {bill.billLabel}
        </span>
        <ComplianceBadge state={bill.computedState} className="mt-0.5" />
        {bill.billUrl && (
          <a
            href={bill.billUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-xs text-navy-400 hover:text-navy-600 transition-colors shrink-0 mt-0.5"
          >
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
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Official source ↗
          </a>
        )}
      </div>

      {/* Title */}
      <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-navy-900 leading-snug mb-4">
        {bill.title || <span className="italic text-navy-400">Untitled bill</span>}
      </h1>

      {/* Key facts grid */}
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <FactItem label="Session" value={`Session ${bill.session}`} />
        <FactItem label="Committee" value={bill.committeeId ? getCommitteeName(bill.committeeId) : "—"} />
        <FactItem
          label="Reported out"
          value={
            bill.reportedOut
              ? bill.reportedDate
                ? formatDate(bill.reportedDate)
                : "Yes"
              : "Not yet"
          }
          highlight={bill.reportedOut ? (reportedOnTime ? "good" : "warn") : undefined}
        />
        <FactItem
          label="Expected deadline"
          value={formatDate(bill.effectiveDeadline)}
          highlight={
            !bill.reportedOut && deadlinePast
              ? "bad"
              : !bill.reportedOut && !deadlinePast
              ? "warn"
              : undefined
          }
        />
      </dl>

      {/* Compliance reason */}
      {bill.computedReason && (
        <div
          className={cn(
            "mt-3 rounded-lg px-4 py-3 text-sm border",
            bill.computedState === "Compliant"
              ? "bg-green-50 border-green-200 text-green-800"
              : bill.computedState === "Non-Compliant"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
          )}
        >
          <p className="font-semibold text-xs uppercase tracking-wide mb-1 opacity-70">
            {bill.computedState === "Compliant"
              ? "Why compliant"
              : bill.computedState === "Non-Compliant"
              ? "Why non-compliant"
              : "Status detail"}
          </p>
          <p className="leading-relaxed">{bill.computedReason}</p>
        </div>
      )}
    </div>
  );
}

function FactItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "good" | "warn" | "bad";
}) {
  return (
    <div className="bg-navy-50/50 rounded-lg px-3 py-2.5 border border-navy-100">
      <dt className="text-xs text-navy-400 mb-0.5">{label}</dt>
      <dd
        className={cn(
          "text-sm font-medium leading-snug",
          highlight === "good"
            ? "text-green-700"
            : highlight === "warn"
            ? "text-amber-700"
            : highlight === "bad"
            ? "text-red-700"
            : "text-navy-800"
        )}
      >
        {value}
      </dd>
    </div>
  );
}
