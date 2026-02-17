import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-navy-900 text-white/60 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
          <div>
            <p className="font-semibold text-white mb-2">Beacon Hill Archive</p>
            <p className="text-white/50 leading-relaxed">
              A normalized record of Massachusetts legislative activity. Data is
              sourced from official legislative publications and processed by the
              Beacon Hill Compliance Tracker pipeline.
            </p>
          </div>
          <div>
            <p className="font-semibold text-white mb-2">Explore</p>
            <ul className="space-y-1">
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  Browse Bills
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About This Project
                </Link>
              </li>
              <li>
                <a
                  href="https://beaconhilltracker.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Compliance Tracker ↗
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-2">Transparency</p>
            <p className="text-white/50 leading-relaxed">
              All data links back to original source documents. Source URLs and
              provenance metadata are displayed on every bill page.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/10 text-xs text-white/40 text-center space-y-1">
          <p>
            Data sourced from official Massachusetts Legislature publications.
            Not affiliated with the Commonwealth of Massachusetts.
          </p>
          <p>
            See an error?{" "}
            <a
              href="mailto:info@beaconhilltracker.org"
              className="underline hover:text-white/70 transition-colors"
            >
              info@beaconhilltracker.org
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
