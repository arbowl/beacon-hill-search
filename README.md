# Beacon Hill Archive

A normalized, searchable viewer for Massachusetts legislative bills.  
Powered by data from the [Beacon Hill Compliance Tracker](https://beaconhilltracker.org) pipeline.

---

## Repository structure

```
beacon-hill-archive/
├── bill_artifacts.db         ← DuckDB source-of-truth (from Compliance Tracker pipeline)
├── data/
│   └── archive.db            ← SQLite presentation layer (generated, do not edit)
├── scripts/
│   └── export_sqlite.py      ← Converts DuckDB → SQLite (run after each pipeline update)
└── apps/
    └── web/                  ← Next.js web application
```

---

## Quick start

### 1. Generate the SQLite presentation database

Run this once, and again whenever `bill_artifacts.db` is updated:

```powershell
python scripts/export_sqlite.py
```

This reads `bill_artifacts.db` (DuckDB), normalizes everything, and writes `data/archive.db` (SQLite, ~54 MB).

### 2. Install web app dependencies

```powershell
cd apps/web
npm install
```

### 3. Start the development server

```powershell
cd apps/web
npm run dev
```

Open http://localhost:3000.

---

## Refreshing data

When the Compliance Tracker pipeline produces a new `bill_artifacts.db`:

1. Replace `bill_artifacts.db` in the repo root with the new file.
2. Run `python scripts/export_sqlite.py` to regenerate `data/archive.db`.
3. Restart the Next.js server (in dev: it picks up changes automatically on the next request; in production: restart the process).

The SQLite file is derived entirely from DuckDB, so it can always be regenerated safely.

---

## Architecture

```
bill_artifacts.db (DuckDB)
       │
       ▼  scripts/export_sqlite.py
data/archive.db (SQLite)
       │
       ▼  apps/web/src/lib/db/
Next.js API routes (Node.js, better-sqlite3)
       │
       ▼
Next.js pages (React, Tailwind, App Router)
       │
       ▼
http://localhost:3000
```

### Key design decisions

- **DuckDB → SQLite export** instead of querying DuckDB directly from Node.js.  
  DuckDB has reliable Node.js bindings but they add complexity. The export step produces a lean, fast SQLite file with pre-computed normalized fields and a full-text search index. Regeneration takes ~8 seconds.

- **Full-text search via SQLite FTS5**.  
  Each bill gets a single denormalized search document containing bill ID, title, committee, action text, and document previews. FTS5 prefix matching means partial queries work naturally.

- **All source URLs preserved**.  
  Every bill page includes a collapsible "Source & Provenance" panel with direct links to every original document used to construct the page. Artifact IDs and content hashes are shown for full traceability.

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with search bar and stats |
| `/search?q=...` | Paginated search results with committee/status filters |
| `/bills/[billId]` | Full bill detail: summary, deadlines, hearings, timeline, documents, sources |
| `/about` | Plain-language explanation of the data and methodology |

---

## Data sources in `archive.db`

| Table | Rows | Contents |
|-------|------|----------|
| `bills` | 9,489 | Merged bill_artifacts + snapshot (deadlines, compliance state) |
| `timeline_actions` | 55,962 | All legislative actions, normalized labels |
| `hearing_records` | 6,613 | Hearings with notice gap calculation |
| `documents` | 10,069+ | Bill summaries, vote records with source URLs |
| `search_index` | 9,489 | FTS5 denormalized search index |

---

## Environment

- Node.js 22+
- Python 3.10+ with `duckdb` installed (`pip install duckdb`)
- No external API keys, cloud services, or network access required at runtime
