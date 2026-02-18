import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn how the Beacon Hill Search works, where the data comes from, and how to interpret what you see.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <nav className="flex items-center gap-1.5 text-xs text-navy-400 mb-7" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-navy-600">Home</Link>
        <span>/</span>
        <span className="text-navy-700" aria-current="page">About</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-2">
        About Beacon Hill Search
      </h1>
      <p className="text-navy-500 text-base mb-10 leading-relaxed">
        A plain-language guide to what this site is, where the data comes from,
        and how to use it.
      </p>

      <div className="space-y-10 text-navy-700 text-sm sm:text-base leading-relaxed">
        <Section heading="What is this?">
          <p>
            Beacon Hill Search is a public reference tool that presents
            Massachusetts legislative bills in a clear, consistent format.
            The official Legislature website publishes this information, but
            it&apos;s scattered across many pages, inconsistently labeled, and
            difficult to search. This site normalizes that data so anyone—
            advocates, journalists, constituents, researchers—can quickly find
            what they need without prior knowledge of how the Legislature
            organizes its records.
          </p>
        </Section>

        <Section heading="Where does the data come from?">
          <p>
            All data originates from the official{" "}
            <a
              href="https://malegislature.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-800 underline hover:text-navy-600"
            >
              Massachusetts Legislature website ↗
            </a>
            . It is collected and normalized by the{" "}
            <a
              href="https://beaconhilltracker.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-800 underline hover:text-navy-600"
            >
              Beacon Hill Compliance Tracker ↗
            </a>
            , an automated pipeline that gathers bill metadata, committee
            actions, hearing records, votes, and documents. The Compliance
            Tracker standardizes event names, calculates deadlines, and flags
            potential non-compliance with legislative rules.
          </p>
          <p className="mt-3">
            Every item in this archive includes a link back to the original
            source document or URL, so you can always verify what you see
            against the official record.
          </p>
        </Section>

        <Section heading="What do the compliance labels mean?">
          <p>
            Massachusetts legislative rules (Joint Rules) require committees
            to act on referred bills within set time limits—typically 60 or 90
            days. The Compliance Tracker computes a deadline for each bill and
            determines whether the committee met it.
          </p>
          <ul className="mt-3 space-y-2 list-none">
            {[
              {
                badge: "badge-compliant",
                label: "Compliant",
                desc: "The committee acted on the bill before the deadline.",
              },
              {
                badge: "badge-non-compliant",
                label: "Non-Compliant",
                desc: "The committee did not act before the deadline, or took action that violates the rules.",
              },
              {
                badge: "badge-in-progress",
                label: "In Progress",
                desc: "The deadline has not yet passed, or the committee's status is still being determined.",
              },
            ].map((item) => (
              <li key={item.label} className="flex items-start gap-2.5">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium shrink-0 mt-0.5 ${item.badge}`}
                >
                  {item.label}
                </span>
                <span>{item.desc}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3">
            These determinations are based on publicly available information
            and the methodology described in detail at{" "}
            <a
              href="https://beaconhilltracker.org/about"
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-800 underline hover:text-navy-600"
            >
              beaconhilltracker.org/about ↗
            </a>
            .
          </p>
        </Section>

        <Section heading="How do I search?">
          <p>
            The search bar on the home page and browse page accepts any
            combination of:
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1 text-navy-600">
            <li>Bill number (e.g., H.491, S.296)</li>
            <li>Bill title keywords</li>
            <li>Committee ID</li>
            <li>Keywords from vote records or committee actions</li>
          </ul>
          <p className="mt-3">
            You can also use the filter chips on the Browse page to narrow by
            compliance status or committee without any typing.
          </p>
        </Section>

        <Section heading="Is this data complete?">
          <p>
            The archive reflects what has been collected by the Compliance
            Tracker pipeline. Some documents may not have extracted text if
            they were in formats the parser could not process (e.g., certain
            PDFs).
          </p>
          <p className="mt-3">
            This site covers Session 194 (the current two-year session). Prior
            sessions are not yet included.
          </p>
        </Section>

        <Section heading="How we count things">
          <p>
            A few numbers on this site may look higher than you'd expect, and
            it's worth explaining why.
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-navy-600">
            <li>
              <strong className="text-navy-800">Bills:</strong> If the same
              legislation is referred to two different committees, that counts
              as two tracked items—one compliance record per committee
              referral, not per piece of legislation.
            </li>
            <li>
              <strong className="text-navy-800">Hearings:</strong> A single
              hearing that covers thirteen bills is recorded as thirteen
              hearing entries, one for each bill in the batch.
            </li>
          </ul>
          <p className="mt-3">
            This reflects how compliance is actually evaluated: each
            committee referral has its own deadline and its own obligations,
            regardless of whether the underlying legislation is shared.
          </p>
        </Section>

        <Section heading="Raw text and document preservation">
          <p>
            Where available, this archive stores a copy of the raw text
            extracted from official documents—bill summaries, committee vote
            records, and similar materials. This text is shown on bill pages
            under <em>Raw text (archived)</em> and is collapsed by default.
          </p>
          <p className="mt-3">
            This is done purely for preservation and reference. Government
            websites routinely remove or restructure documents over time, and
            having an indexed copy ensures the record remains accessible even
            if the original link goes dead.
          </p>
          <p className="mt-3">
            The authoritative, official version of every document lives on the{" "}
            <a
              href="https://malegislature.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-800 underline hover:text-navy-600"
            >
              Massachusetts Legislature website ↗
            </a>{" "}
            for as long as the government chooses to host it. Every document
            entry here includes a direct link to that source. When in doubt,
            consult the original.
          </p>
        </Section>

        <Section heading="About the author">
          <p>
            My name is Drew Bowler. I&apos;m an independent engineer and civic
            technologist focused on improving public access to legislative data
            and government accountability.
          </p>
          <p className="mt-3">
            Beacon Hill Search is an independent project. It is not affiliated
            with any political party or organization. The only goal is to make
            Massachusetts legislative information easier to find and understand.
          </p>
          <p className="mt-3">
            You can reach me at{" "}
            <a
              href="mailto:info@beaconhilltracker.org"
              className="text-navy-800 underline hover:text-navy-600"
            >
              info@beaconhilltracker.org
            </a>
            .
          </p>
        </Section>

        <div className="pt-6 border-t border-navy-100">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 bg-navy-800 text-white rounded-md px-4 py-2.5 text-sm font-medium hover:bg-navy-700 transition-colors"
          >
            Browse bills
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base sm:text-lg font-semibold text-navy-900 mb-3 pb-2 border-b border-navy-100">
        {heading}
      </h2>
      {children}
    </section>
  );
}
