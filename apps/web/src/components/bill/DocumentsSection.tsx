import { Accordion } from "@/components/ui/Accordion";
import type { BillDocument } from "@/lib/models/bill";
import { cn } from "@/lib/utils";

interface DocumentsSectionProps {
  documents: BillDocument[];
}

const DOC_ICONS: Record<string, React.ReactNode> = {
  summary: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  votes: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
};

export function DocumentsSection({ documents }: DocumentsSectionProps) {
  const badge = (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-navy-100 text-navy-600 text-xs font-semibold">
      {documents.length}
    </span>
  );

  return (
    <Accordion title="Documents" badge={badge} defaultOpen={documents.length > 0}>
      {documents.length === 0 ? (
        <p className="text-sm text-navy-400 py-2">No documents on file.</p>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <DocumentCard key={doc.documentId} doc={doc} />
          ))}
        </div>
      )}
    </Accordion>
  );
}

function DocumentCard({ doc }: { doc: BillDocument }) {
  const icon = DOC_ICONS[doc.documentType];
  // Prefer full_text (complete); fall back to preview (may be truncated at source)
  const preview = doc.fullText || doc.preview;

  return (
    <div className="border border-navy-100 rounded-lg p-3 sm:p-4 bg-navy-50/30">
      <div className="flex items-start gap-2.5">
        <span className="text-navy-400 mt-0.5 shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
            <div className="mb-1">
              <span className="text-sm font-medium text-navy-800">
                {doc.documentTypeLabel}
              </span>
            </div>

          {preview && (
            <details className="mt-1">
              <summary className="text-xs text-navy-500 font-medium cursor-pointer hover:text-navy-700 select-none">
                Raw text (archived)
              </summary>
              <div className="mt-1.5">
                <p className="text-xs text-navy-400 italic mb-1.5">
                  Preserved from the official source. The authoritative version
                  lives on the{" "}
                  <a
                    href="https://malegislature.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-navy-600"
                  >
                    Massachusetts Legislature website
                  </a>{" "}
                  for as long as it is publicly hosted.
                </p>
                <p className="text-xs text-navy-600 bg-white border border-navy-100 rounded p-2.5 leading-relaxed font-mono whitespace-pre-wrap break-words">
                  {preview}
                </p>
              </div>
            </details>
          )}

          <div className="mt-2 flex items-center gap-3 flex-wrap">
            {doc.sourceUrl && (
              <a
                href={doc.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-navy-500 hover:text-navy-700 border border-navy-200 rounded px-2 py-0.5 bg-white hover:bg-navy-50 transition-colors"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                View source
              </a>
            )}
            {doc.parserModule && (
              <span className="text-xs text-navy-300">
                via {doc.parserModule}
              </span>
            )}
            {doc.contentHash && (
              <span
                title={`Content hash: ${doc.contentHash}`}
                className="text-xs text-navy-300 font-mono truncate max-w-[120px]"
              >
                #{doc.contentHash.slice(0, 8)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
