import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBillByBillId, getBillByArtifactId } from "@/lib/db/queries";
import { BillSummaryCard } from "@/components/bill/BillSummaryCard";
import { TimelineSection } from "@/components/bill/TimelineSection";
import { HearingsSection } from "@/components/bill/HearingsSection";
import { DocumentsSection } from "@/components/bill/DocumentsSection";
import { DeadlinesSection } from "@/components/bill/DeadlinesSection";
import { OmnibusSection } from "@/components/bill/OmnibusSection";

interface BillPageProps {
  params: Promise<{ billId: string }>;
  searchParams: Promise<{ artifact?: string }>;
}

export async function generateMetadata({
  params,
}: BillPageProps): Promise<Metadata> {
  const { billId } = await params;
  const bill = getBillByBillId(decodeURIComponent(billId).toUpperCase());
  if (!bill) return { title: "Bill not found" };
  return {
    title: `${bill.billLabel} — ${bill.title?.slice(0, 60) ?? ""}`,
    description: bill.title ?? `Massachusetts legislative bill ${bill.billLabel}`,
  };
}

export default async function BillPage({ params, searchParams }: BillPageProps) {
  const { billId } = await params;
  const { artifact } = await searchParams;

  const bill = artifact
    ? getBillByArtifactId(artifact)
    : getBillByBillId(decodeURIComponent(billId).toUpperCase());

  if (!bill) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-navy-400 mb-5" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-navy-600 transition-colors">
          Home
        </Link>
        <span aria-hidden>/</span>
        <Link href="/search" className="hover:text-navy-600 transition-colors">
          Bills
        </Link>
        <span aria-hidden>/</span>
        <span className="text-navy-700 font-medium" aria-current="page">
          {bill.billLabel}
        </span>
      </nav>

      {/* Summary card */}
      <BillSummaryCard bill={bill} />

      {/* Accordion sections */}
      <div className="mt-4 space-y-3">
        <OmnibusSection links={bill.omnibusLinks} />
        <DeadlinesSection bill={bill} />
        <HearingsSection
          hearings={bill.hearings}
          computedState={bill.computedState}
          computedReason={bill.computedReason}
        />
        <TimelineSection
          actions={bill.timeline}
          committeeId={bill.committeeId}
        />
        <DocumentsSection documents={bill.documents} />
        <SourcesPanel bill={bill} />
      </div>
    </div>
  );
}

/** Traceability panel showing raw provenance metadata */
function SourcesPanel({ bill }: { bill: Awaited<ReturnType<typeof getBillByBillId>> }) {
  if (!bill) return null;

  const sources = [
    bill.billUrl && {
      label: "Official bill page",
      url: bill.billUrl,
      kind: "Legislature website",
    },
    ...bill.hearings
      .filter((h) => h.hearingUrl)
      .map((h) => ({
        label: `Hearing — ${h.hearingDate}`,
        url: h.hearingUrl!,
        kind: "Hearing record",
      })),
    ...bill.documents
      .filter((d) => d.sourceUrl)
      .map((d) => ({
        label: d.documentTypeLabel,
        url: d.sourceUrl!,
        kind: `Document (${d.documentType})`,
        hash: d.contentHash?.slice(0, 8),
      })),
  ].filter(Boolean) as {
    label: string;
    url: string;
    kind: string;
    hash?: string;
  }[];

  return (
    <details className="group">
      <summary className="flex items-center justify-between w-full border border-navy-100 rounded-lg px-4 sm:px-5 py-3.5 bg-white hover:bg-navy-50 transition-colors cursor-pointer list-none text-sm font-medium text-navy-700">
        <span className="flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Source &amp; Provenance
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-navy-400 transition-transform group-open:rotate-180" aria-hidden>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>
      <div className="border border-t-0 border-navy-100 rounded-b-lg bg-white px-4 sm:px-5 py-4">
        <p className="text-xs text-navy-400 mb-3 leading-relaxed">
          This bill record was assembled from the following official sources.
          Every normalized field in this page can be traced back to one of
          these documents. Artifact ID:{" "}
          <code className="font-mono bg-navy-50 px-1 rounded">{bill.artifactId}</code>
        </p>
        {sources.length === 0 ? (
          <p className="text-sm text-navy-400">No source URLs on record.</p>
        ) : (
          <ul className="space-y-1.5">
            {sources.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <span className="text-navy-300 mt-0.5 shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </span>
                <div>
                  <span className="text-navy-400">{s.kind}: </span>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-navy-600 hover:text-navy-900 underline break-all"
                  >
                    {s.label}
                  </a>
                  {s.hash && (
                    <span className="ml-1 text-navy-300 font-mono">
                      #{s.hash}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
