import Link from "next/link";
import { Accordion } from "@/components/ui/Accordion";
import type { OmnibusLinks, OmnibusRef } from "@/lib/models/bill";

interface OmnibusSectionProps {
  links: OmnibusLinks | null;
}

function ExternalIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="inline-block ml-0.5 shrink-0"
      aria-hidden
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function BillChip({ bill }: { bill: OmnibusRef }) {
  const inner = (
    <>
      <span className="font-mono">{bill.billLabel}</span>
      {!bill.internalUrl && <ExternalIcon />}
    </>
  );

  if (bill.internalUrl) {
    return (
      <Link
        href={bill.internalUrl}
        className="inline-flex items-center gap-0.5 px-2 py-1 rounded border border-navy-200 bg-navy-50 text-xs text-navy-700 hover:bg-navy-100 hover:border-navy-300 transition-colors"
      >
        {inner}
      </Link>
    );
  }

  return (
    <a
      href={bill.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-0.5 px-2 py-1 rounded border border-navy-200 bg-navy-50 text-xs text-navy-700 hover:bg-navy-100 hover:border-navy-300 transition-colors"
    >
      {inner}
    </a>
  );
}

function ParentLink({ bill }: { bill: OmnibusRef }) {
  if (bill.internalUrl) {
    return (
      <Link
        href={bill.internalUrl}
        className="font-mono font-semibold text-navy-700 hover:text-navy-900 underline underline-offset-2"
      >
        {bill.billLabel}
      </Link>
    );
  }
  return (
    <a
      href={bill.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-0.5 font-mono font-semibold text-navy-700 hover:text-navy-900 underline underline-offset-2"
    >
      {bill.billLabel}
      <ExternalIcon />
    </a>
  );
}

export function OmnibusSection({ links }: OmnibusSectionProps) {
  if (!links) return null;
  const { parent, constituents } = links;
  if (!parent && constituents.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Parent banner: this bill was rolled into an omnibus */}
      {parent && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="mt-0.5 shrink-0 text-amber-600"
            aria-hidden
          >
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          <p>
            This bill was incorporated into a committee redraft:{" "}
            <ParentLink bill={parent} />
          </p>
        </div>
      )}

      {/* Constituents accordion: this bill is an omnibus */}
      {constituents.length > 0 && (
        <Accordion
          title="Committee Redraft"
          badge={
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-navy-100 text-navy-600 text-xs font-semibold">
              {constituents.length}
            </span>
          }
          defaultOpen
        >
          <p className="text-xs text-navy-500 mb-3">
            This bill is a new draft incorporating {constituents.length} source{" "}
            {constituents.length === 1 ? "bill" : "bills"}.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {constituents.map((c) => (
              <BillChip key={c.billId} bill={c} />
            ))}
          </div>
        </Accordion>
      )}
    </div>
  );
}
