import { Accordion } from "@/components/ui/Accordion";
import type { BillDetail } from "@/lib/models/bill";
import { formatDate, isPast } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface DeadlinesSectionProps {
  bill: BillDetail;
}

export function DeadlinesSection({ bill }: DeadlinesSectionProps) {
  const items = [
    {
      label: "Expected deadline",
      date: bill.effectiveDeadline,
      description: "The date by which the committee is expected to act on this bill.",
      effective: true,
    },
    ...(bill.reportedOut && bill.reportedDate
      ? [
          {
            label: "Reported out",
            date: bill.reportedDate,
            description: "Date the committee reported the bill out.",
            reportedOut: true,
          },
        ]
      : []),
  ].filter((i) => i.date);

  if (items.length === 0) return null;

  return (
    <Accordion title="Deadlines &amp; Compliance" defaultOpen>
      <div className="space-y-2.5">
        {items.map((item) => {
          const past = isPast(item.date);
          const isEffective = (item as { effective?: boolean }).effective;
          const isReportedOut = (item as { reportedOut?: boolean }).reportedOut;

          return (
            <div
              key={item.label}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border",
                isEffective
                  ? "border-gold-300 bg-gold-50"
                  : isReportedOut
                  ? "border-green-200 bg-green-50"
                  : "border-navy-100 bg-navy-50/40"
              )}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full mt-1.5 shrink-0",
                  isReportedOut
                    ? "bg-green-500"
                    : past && isEffective && !bill.reportedOut
                    ? "bg-red-500"
                    : past
                    ? "bg-navy-300"
                    : isEffective
                    ? "bg-gold-500"
                    : "bg-navy-300"
                )}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isEffective ? "text-gold-800" : isReportedOut ? "text-green-800" : "text-navy-800"
                    )}
                  >
                    {item.label}
                  </span>
                  <time
                    dateTime={item.date ?? ""}
                    className={cn(
                      "text-sm font-semibold",
                      isReportedOut
                        ? "text-green-700"
                        : past && isEffective && !bill.reportedOut
                        ? "text-red-700"
                        : isEffective
                        ? "text-gold-700"
                        : "text-navy-700"
                    )}
                  >
                    {formatDate(item.date)}
                  </time>
                </div>
                <p className="text-xs text-navy-400 mt-0.5">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-navy-400 leading-relaxed border-t border-navy-100 pt-3">
        Deadlines are computed by the Beacon Hill Compliance Tracker based on
        committee referral date and applicable session rules. These are not
        posted by the Legislature.{" "}
        <a
          href="https://beaconhilltracker.org/about"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-navy-600"
        >
          Learn about the methodology ↗
        </a>
      </p>
    </Accordion>
  );
}
