# CLAUDE.md — Beacon Hill Archive

This file gives an LLM enough context to work on this project without reading every file.

---

## What this project is

**Beacon Hill Archive** is a public-facing web app that presents Massachusetts legislative bills in a normalized, searchable format. Data originates from the official Legislature website, is collected and normalized by the **Beacon Hill Compliance Tracker** pipeline (`beaconhilltracker.org`), and stored in a DuckDB database. This app is the read-only presentation layer on top of that data.

---

## Repository layout

```
beacon-hill-archive/
├── bill_artifacts.db          ← DuckDB source-of-truth (from Compliance Tracker; large, not in git)
├── data/
│   └── archive.db             ← SQLite presentation DB (generated; not in git)
├── scripts/
│   ├── export_sqlite.py       ← Converts DuckDB → SQLite (~8s, run after pipeline updates)
│   └── refresh.ps1            ← PowerShell helper: re-export + optional server restart
├── apps/
│   └── web/                   ← Next.js 16 app (App Router, TypeScript, Tailwind)
│       ├── src/
│       │   ├── app/           ← Pages and API routes
│       │   ├── components/    ← React components
│       │   └── lib/           ← Data access, models, utilities
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       └── package.json
└── CLAUDE.md                  ← This file
```

---

## Data pipeline

```
malegislature.gov
      ↓
Compliance Tracker pipeline
      ↓
bill_artifacts.db  (DuckDB, ~3.2 GB)
      ↓  scripts/export_sqlite.py
data/archive.db    (SQLite, ~54 MB)
      ↓  apps/web/src/lib/db/
Next.js API routes → React pages
```

**Never edit `archive.db` directly.** Always regenerate it:
```powershell
python scripts/export_sqlite.py
```

---

## SQLite schema (`data/archive.db`)

| Table | Key columns | Notes |
|-------|-------------|-------|
| `bills` | `artifact_id` (PK), `bill_id`, `bill_label`, `session`, `committee_id`, `title`, `bill_url`, `computed_state`, `computed_reason`, `effective_deadline`, `reported_out`, `reported_date` | One row per bill. `computed_state` values: `Compliant`, `Non-Compliant`, `Unknown` |
| `timeline_actions` | `action_id`, `artifact_id`, `action_date`, `branch`, `action_type`, `action_label`, `category`, `raw_text`, `extracted_data` (JSON) | Up to ~50+ actions per bill |
| `hearing_records` | `record_id`, `artifact_id`, `hearing_date`, `hearing_url`, `announcement_date`, `notice_gap_days` | |
| `documents` | `document_id`, `artifact_id`, `bill_id`, `document_type` (`summary`\|`votes`), `source_url`, `preview`, `full_text`, `content_hash` | |
| `search_index` | FTS5 virtual table | `artifact_id`, `bill_id`, `bill_label`, `title`, `committee_id`, `action_text`, `document_text` |

`bill_id` format: `H491`, `S296` (no dot). `bill_label` is the display form: `H.491`, `S.296`.

`computed_state = 'Unknown'` is displayed to users as **"In Progress"** — do not change the DB value, only the display label.

---

## Web app — key files

### Data access (`src/lib/`)

- **`lib/db/db.ts`** — singleton `better-sqlite3` connection to `../../data/archive.db` (relative to `apps/web/`). Read-only.
- **`lib/db/queries.ts`** — all SQL. Key functions:
  - `getBillByBillId(billId)` → `BillDetail` (merged bill + timeline + hearings + documents)
  - `searchBills({ q, page, committeeId, session, computedState })` → `SearchResponse` (FTS5 + filters, page size 20)
  - `getStats()` → counts for landing page
  - `getDistinctCommittees()` → sorted by bill count, used for filter dropdown
- **`lib/models/bill.ts`** — TypeScript types (`BillDetail`, `BillSummary`, `SearchResult`, etc.) and row mapper functions.
- **`lib/committees.ts`** — **single source of truth for committee ID → name**. Three prefixes:
  - `J__` = Joint Committee on …
  - `S__` = Senate Committee on …
  - `H__` = House Committee on …
  - Helper: `getCommitteeName(id)` → full name with chamber prefix
  - Helper: `getCommitteeShortName(id)` → name only, no prefix
- **`lib/utils.ts`** — `cn()` (clsx + tailwind-merge), `formatDate()`, `formatDateShort()`, `isPast()`, `truncate()`

### Pages (`src/app/`)

| Route | File | Type |
|-------|------|------|
| `/` | `app/page.tsx` | Server component |
| `/search` | `app/search/page.tsx` | Server component (reads `searchParams`) |
| `/bills/[billId]` | `app/bills/[billId]/page.tsx` | Server component (reads `params.billId`) |
| `/about` | `app/about/page.tsx` | Server component |
| `GET /api/search` | `app/api/search/route.ts` | Node.js route |
| `GET /api/bills/[billId]` | `app/api/bills/[billId]/route.ts` | Node.js route |
| `GET /api/stats` | `app/api/stats/route.ts` | Node.js route |

All API routes use `export const runtime = "nodejs"`.

### Components (`src/components/`)

**Layout**
- `layout/SiteHeader.tsx` — sticky nav, compact inline search (hidden on `/`), mobile hamburger menu. Client component.
- `layout/SiteFooter.tsx` — links, data attribution. Server component.

**UI primitives**
- `ui/SearchBar.tsx` — controlled input, navigates to `/search?q=…` on submit. Client component. Accepts `defaultValue` prop (pass from server).
- `ui/BillCard.tsx` — search result card: bill label badge, compliance badge, title, committee name. Server component.
- `ui/ComplianceBadge.tsx` — colored badge. Maps `Unknown` → "In Progress". Server component.
- `ui/Accordion.tsx` — accessible expand/collapse. Client component (`useState`).
- `ui/Pagination.tsx` — page range links. **Server component** (no hooks — do not add `"use client"`).

**Bill page sections** (all server components, used in `/bills/[billId]/page.tsx`)
- `bill/BillSummaryCard.tsx` — top card: label, compliance badge, key facts grid (session, committee, reported out, expected deadline), compliance reason box.
- `bill/DeadlinesSection.tsx` — accordion: expected deadline + reported date.
- `bill/HearingsSection.tsx` — accordion: hearing date, announcement date, notice gap, link to official hearing page.
- `bill/TimelineSection.tsx` — accordion: ordered timeline with branch color-coding, collapsible original text per action.
- `bill/DocumentsSection.tsx` — accordion: document type, preview text (collapsible), source URL, content hash.

**Search page**
- `app/search/FilterChips.tsx` — status chips (Compliant / Non-Compliant) + committee dropdown. Client component (uses `useRouter` for committee select onChange).

---

## Design system

**Colors** (defined in `tailwind.config.ts` and `globals.css` CSS variables):
- Primary: `navy-900` (`#0e2849`) — backgrounds, text
- Accent: `gold-400`/`gold-500` (`#f2cc68`/`#d99f1a`) — highlights, CTA
- Surface: `offwhite` (`#f7f5f0`) — page background

**Compliance badge CSS classes** (in `globals.css`):
- `.badge-compliant` — green
- `.badge-non-compliant` — red
- `.badge-pending` — amber
- `.badge-in-progress` — grey (used for `Unknown` DB state)

---

## Common tasks

### Add a new committee ID
Edit `src/lib/committees.ts` — add one line to the appropriate block (J/S/H). The `getCommitteeName` and `getCommitteeShortName` helpers pick it up automatically everywhere.

### Change how a compliance state is displayed
Edit `src/components/ui/ComplianceBadge.tsx` — the `LABELS` map controls display text, the `cls` logic controls badge color.

### Add a new bill page section
1. Create `src/components/bill/YourSection.tsx`, wrap content in `<Accordion>`.
2. Import and render it in `src/app/bills/[billId]/page.tsx`.
3. If it needs data not already on `BillDetail`, add a query in `lib/db/queries.ts` and extend the `BillDetail` type in `lib/models/bill.ts`.

### Refresh data after pipeline update
```powershell
# From repo root
python scripts/export_sqlite.py
# Then restart the Next.js process
```

### Run dev server
```powershell
cd apps/web
npm run dev      # http://localhost:3000
```

### Type check
```powershell
cd apps/web
npx tsc --noEmit
```

---

## Key constraints / gotchas

- **`Pagination` must remain a server component.** Passing a `buildHref` function to a client component causes a Next.js serialization error.
- **`SearchBar` must not use `useSearchParams()`.** It causes prerender failures on static pages (404, etc.). Pass `defaultValue` from the server component instead.
- **`better-sqlite3` is a native module.** It is listed in `serverExternalPackages` in `next.config.ts` so webpack doesn't try to bundle it.
- **`archive.db` path** is resolved relative to `process.cwd()` as `../../data/archive.db`. The dev server runs from `apps/web/`, so this resolves to the repo root `data/` directory.
- **`computed_state = 'Unknown'`** is a real value in the DB (3,074 bills). It is displayed as "In Progress" — do not rename it in the DB or export script.
- **`Hxx`** is a real, malformed committee ID that exists in the source data. It is mapped to "House Committee on Intergovernmental Affairs" in `committees.ts`.
- The export script deduplicates documents by `source_url` to avoid showing the same PDF twice.
