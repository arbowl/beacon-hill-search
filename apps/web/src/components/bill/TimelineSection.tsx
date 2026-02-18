import { Accordion } from "@/components/ui/Accordion";
import type { TimelineAction } from "@/lib/models/bill";
import { formatDateShort } from "@/lib/utils";
import { cn } from "@/lib/utils";

const BRANCH_COLORS: Record<string, string> = {
  House: "bg-blue-100 text-blue-700 border-blue-200",
  Senate: "bg-purple-100 text-purple-700 border-purple-200",
  Joint: "bg-navy-100 text-navy-700 border-navy-200",
  Governor: "bg-amber-100 text-amber-700 border-amber-200",
};

const CATEGORY_DOT: Record<string, string> = {
  "referral-committee": "bg-navy-400",
  "hearing-scheduled": "bg-blue-400",
  "hearing-rescheduled": "bg-yellow-400",
  "committee-passage": "bg-green-500",
  "committee-passage-unfavorable": "bg-red-500",
  passage: "bg-green-600",
  "reading-1": "bg-navy-300",
  "reading-2": "bg-navy-400",
  "reading-3": "bg-navy-500",
  "executive-signature": "bg-gold-500",
  "deadline-extension": "bg-orange-400",
  other: "bg-navy-200",
};

interface TimelineSectionProps {
  actions: TimelineAction[];
  /** The committee ID this bill artifact is being tracked under */
  committeeId?: string;
}

// Categories that are inherently committee actions (not chamber floor actions)
const COMMITTEE_CATEGORIES = new Set([
  "referral-committee",
  "hearing-scheduled",
  "hearing-rescheduled",
  "hearing-updated",
  "deadline-extension",
  "committee-passage",
  "committee-passage-unfavorable",
]);

// Categories that are chamber/floor actions — never highlight these as
// belonging to a specific committee window
const CHAMBER_CATEGORIES = new Set([
  "passage",
  "reading-1",
  "reading-2",
  "reading-3",
  "executive-signature",
  "amendment-passage",
]);

/**
 * Returns the set of action indices that belong to the current committee's
 * tenure window. An action qualifies if:
 *   (a) its extracted_data.committee_id explicitly matches committeeId, OR
 *   (b) it falls in the committee's date range AND is a committee-category
 *       action (not a chamber floor action).
 */
function computeWindowIndices(
  actions: TimelineAction[],
  committeeId: string | undefined
): Set<number> {
  if (!committeeId) return new Set();

  // Find window start: first REFERRED whose extracted_data.committee_id matches
  let startDate: string | null = null;
  for (const a of actions) {
    const cid = (a.extractedData as Record<string, unknown>)?.committee_id as string | undefined;
    if (a.actionType === "REFERRED" && cid === committeeId) {
      startDate = a.actionDate;
      break;
    }
  }
  if (!startDate) return new Set();

  // Find window end date: first REFERRED to a *different* known committee after start
  let endDate: string | null = null;
  for (const a of actions) {
    if (a.actionDate <= startDate) continue;
    const cid = (a.extractedData as Record<string, unknown>)?.committee_id as string | undefined;
    if (a.actionType === "REFERRED" && cid && cid !== committeeId) {
      endDate = a.actionDate;
      break;
    }
  }

  const inWindow = new Set<number>();
  for (let i = 0; i < actions.length; i++) {
    const a = actions[i];
    if (CHAMBER_CATEGORIES.has(a.category)) continue;

    const cid = (a.extractedData as Record<string, unknown>)?.committee_id as string | undefined;
    const explicitMatch = cid === committeeId;
    const inDateRange =
      a.actionDate >= startDate &&
      (endDate === null || a.actionDate < endDate) &&
      COMMITTEE_CATEGORIES.has(a.category);

    if (explicitMatch || inDateRange) {
      inWindow.add(i);
    }
  }
  return inWindow;
}

export function TimelineSection({ actions, committeeId }: TimelineSectionProps) {
  const inWindow = computeWindowIndices(actions, committeeId);
  const badge = (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-navy-100 text-navy-600 text-xs font-semibold">
      {actions.length}
    </span>
  );

  return (
    <Accordion
      title="Legislative Timeline"
      badge={badge}
      defaultOpen={actions.length > 0}
    >
      {actions.length === 0 ? (
        <p className="text-sm text-navy-400 py-2">No timeline actions recorded.</p>
      ) : (
        <ol className="relative space-y-0" aria-label="Legislative timeline">
          {actions.map((action, idx) => {
            const isLast = idx === actions.length - 1;
            const isCurrentWindow = inWindow.has(idx);
            const dotClass = CATEGORY_DOT[action.category] || "bg-navy-300";
            const branchClass =
              BRANCH_COLORS[action.branch] ||
              "bg-navy-100 text-navy-700 border-navy-200";
            return (
              <li key={action.actionId} className="flex gap-3 sm:gap-4">
                {/* Timeline rail */}
                <div className="flex flex-col items-center shrink-0 w-5">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full mt-1 shrink-0 border-2 border-white shadow-sm",
                      dotClass
                    )}
                  />
                  {!isLast && (
                    <div className="w-px flex-1 bg-navy-100 my-0.5" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <time
                      dateTime={action.actionDate}
                      className={cn(
                        "text-xs shrink-0",
                        isCurrentWindow ? "text-navy-400" : "text-navy-300"
                      )}
                    >
                      {formatDateShort(action.actionDate)}
                    </time>
                    <span
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded border font-medium shrink-0",
                        branchClass
                      )}
                    >
                      {action.branch}
                    </span>
                  </div>
                  <p className={cn(
                    "text-sm leading-snug",
                    isCurrentWindow
                      ? "font-semibold text-navy-900"
                      : "font-medium text-navy-500"
                  )}>
                    {action.actionLabel}
                  </p>
                  {action.rawText &&
                    action.rawText !== action.actionLabel && (
                      <details className="mt-1">
                        <summary className="text-xs text-navy-400 cursor-pointer hover:text-navy-600 select-none">
                          Original text
                        </summary>
                        <p className="mt-1 text-xs text-navy-500 bg-navy-50 rounded px-2 py-1.5 border border-navy-100 font-mono leading-relaxed">
                          {action.rawText}
                        </p>
                      </details>
                    )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Accordion>
  );
}
