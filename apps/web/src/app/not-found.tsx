import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl font-bold text-navy-200 mb-4">404</p>
      <h1 className="text-xl font-semibold text-navy-900 mb-2">
        Page not found
      </h1>
      <p className="text-navy-500 text-sm mb-8">
        The bill or page you&apos;re looking for doesn&apos;t exist in this
        archive. It may have been entered with a different bill number format.
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 bg-navy-800 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-navy-700 transition-colors"
        >
          Search bills
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 border border-navy-200 text-navy-700 rounded-md px-4 py-2 text-sm font-medium hover:bg-navy-50 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
