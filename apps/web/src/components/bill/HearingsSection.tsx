import { Accordion } from "@/components/ui/Accordion";
import type { ComplianceState, HearingRecord } from "@/lib/models/bill";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface HearingsSectionProps {
  hearings: HearingRecord[];
  computedState: ComplianceState | null;
  computedReason: string | null;
}

export function HearingsSection({ hearings, computedState, computedReason }: HearingsSectionProps) {
  const badge = (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-navy-100 text-navy-600 text-xs font-semibold">
      {hearings.length}
    </span>
  );

  return (
    <Accordion title="Hearings" badge={badge} defaultOpen>
      {hearings.length === 0 ? (
        <p className="text-sm text-navy-400 py-2">No hearings on record.</p>
      ) : (
        <div className="space-y-3">
          {hearings.map((h) => (
            <HearingCard
              key={h.recordId}
              hearing={h}
              computedState={computedState}
              computedReason={computedReason}
            />
          ))}
        </div>
      )}
    </Accordion>
  );
}

function HearingCard({
  hearing,
  computedState,
  computedReason,
}: {
  hearing: HearingRecord;
  computedState: ComplianceState | null;
  computedReason: string | null;
}) {
  const insufficientNotice =
    computedState === "Non-Compliant" &&
    !!computedReason?.toLowerCase().includes("insufficient hearing notice");

  const noticeBadge =
    hearing.noticeGapDays === null
      ? null
      : insufficientNotice
      ? { label: "Short notice", cls: "badge-non-compliant" }
      : { label: "Adequate notice", cls: "badge-compliant" };

  return (
    <div className="border border-navy-100 rounded-lg p-3 sm:p-4 bg-navy-50/40">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="font-semibold text-navy-900 text-sm">
            {formatDate(hearing.hearingDate)}
          </p>
          {hearing.announcementDate && (
            <p className="text-xs text-navy-400 mt-0.5">
              Announced {formatDate(hearing.announcementDate)}
              {hearing.noticeGapDays !== null && (
                <> &mdash; {hearing.noticeGapDays} day{hearing.noticeGapDays !== 1 ? "s" : ""} notice</>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {noticeBadge && (
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded border font-medium",
                noticeBadge.cls
              )}
            >
              {noticeBadge.label}
            </span>
          )}
          {hearing.hearingUrl && (
            <a
              href={hearing.hearingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-navy-500 hover:text-navy-700 border border-navy-200 rounded px-2 py-0.5 bg-white hover:bg-navy-50 transition-colors"
            >
              <svg
                width="11"
                height="11"
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
              Official hearing page
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
