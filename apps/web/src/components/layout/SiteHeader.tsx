"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SearchBar } from "@/components/ui/SearchBar";

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-navy-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 group"
            aria-label="Beacon Hill Search home"
          >
            <span className="text-gold-400 font-bold text-lg tracking-tight leading-none">
              Beacon Hill
            </span>
            <span className="text-white/70 text-lg font-light leading-none">
              Search
            </span>
          </Link>

          {/* Inline search (hidden on home—landing has its own) */}
          {!isHome && (
            <div className="flex-1 max-w-xl hidden md:block">
              <SearchBar compact />
            </div>
          )}

          {/* Nav links */}
          <nav
            className="hidden md:flex items-center gap-6 text-sm"
            aria-label="Main navigation"
          >
            <Link
              href="/search"
              className="text-white/70 hover:text-white transition-colors"
            >
              Browse Bills
            </Link>
            <Link
              href="/about"
              className="text-white/70 hover:text-white transition-colors"
            >
              About
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-1.5 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 py-3 space-y-1 pb-4">
            {!isHome && (
              <div className="px-1 pb-3">
                <SearchBar compact />
              </div>
            )}
            <Link
              href="/search"
              className="block px-1 py-2 text-sm text-white/80 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              Browse Bills
            </Link>
            <Link
              href="/about"
              className="block px-1 py-2 text-sm text-white/80 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
