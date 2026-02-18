import Link from "next/link";
import { SearchBar } from "@/components/ui/SearchBar";
import { getStats } from "@/lib/db/queries";

function StatsBar() {
  const stats = getStats();
  const items = [
    { label: "Bills tracked", value: stats.totalBills.toLocaleString() },
    { label: "Legislative actions", value: stats.totalActions.toLocaleString() },
    { label: "Hearings on record", value: stats.totalHearings.toLocaleString() },
    { label: "Documents indexed", value: stats.totalDocuments.toLocaleString() },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-navy-100 rounded-xl overflow-hidden border border-navy-100 shadow-sm">
      {items.map((item) => (
        <div key={item.label} className="bg-white px-4 py-4 text-center">
          <div className="text-2xl font-bold text-navy-900">{item.value}</div>
          <div className="text-xs text-navy-400 mt-0.5">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

const HOW_IT_WORKS = [
  {
    step: "1",
    heading: "Official data, normalized",
    body: "Every bill, hearing, vote, and timeline action is collected from the official Massachusetts Legislature website and standardized into a consistent format.",
  },
  {
    step: "2",
    heading: "Search everything at once",
    body: "Search by bill number, title, committee, legislator name, or keywords from any document—the same box finds it all, with no need to know which tab to look under.",
  },
  {
    step: "3",
    heading: "Full traceability",
    body: "Every normalized data point links back to the original source document or URL so you can always verify what you see against the official record.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-navy-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 text-center">
          <div className="inline-flex items-center gap-2 bg-gold-500/15 text-gold-300 text-xs font-medium px-3 py-1 rounded-full mb-5 border border-gold-500/25">
            Massachusetts · Session 194
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-4">
            The Massachusetts Legislature,{" "}
            <span className="text-gold-400">made readable.</span>
          </h1>
          <p className="text-white/65 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
            Bills, hearings, votes, and deadlines—all in one place, clearly
            labeled, and linked back to the original official documents.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto">
            <SearchBar />
          </div>

        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5">
        <StatsBar />
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-xl font-semibold text-navy-900 mb-8 text-center">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="bg-white border border-navy-100 rounded-xl p-5 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-navy-900 text-gold-400 text-sm font-bold flex items-center justify-center mb-3">
                {item.step}
              </div>
              <h3 className="font-semibold text-navy-900 mb-1.5">{item.heading}</h3>
              <p className="text-sm text-navy-500 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-navy-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-xl font-semibold text-navy-900 mb-3">
            Ready to explore?
          </h2>
          <p className="text-navy-500 text-sm mb-6">
            Browse all {" "}
            <strong className="text-navy-700">9,489 bills</strong> from the current
            session, with full timeline, hearing, and compliance data.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 bg-navy-800 text-white rounded-md px-5 py-2.5 text-sm font-medium hover:bg-navy-700 transition-colors shadow-sm"
          >
            Browse all bills
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}

