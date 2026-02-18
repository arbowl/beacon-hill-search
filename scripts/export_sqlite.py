"""
export_sqlite.py
----------------
Reads from bill_artifacts.db (DuckDB) and writes a normalized SQLite file
at data/archive.db, which the Next.js app serves.

Run from repository root:
    python scripts/export_sqlite.py
"""

import duckdb
import sqlite3
import json
import os
import sys
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DUCKDB_PATH = ROOT / "bill_artifacts.db"
SQLITE_PATH = ROOT / "data" / "archive.db"


# ── helpers ──────────────────────────────────────────────────────────────────

def jget(raw: str | None, key: str, default=None):
    """Safely parse a JSON string and get a key."""
    if not raw:
        return default
    try:
        return json.loads(raw).get(key, default)
    except Exception:
        return default


def jload(raw: str | None) -> dict:
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except Exception:
        return {}


def normalise_bill_id(bid: str) -> str:
    """H491 -> H.491, S296 -> S.296, etc."""
    if not bid:
        return bid
    m = re.match(r'^([A-Za-z]+)(\d+)$', bid)
    if m:
        return f"{m.group(1)}.{m.group(2)}"
    return bid


ACTION_TYPE_LABELS = {
    "REFERRED": "Referred to Committee",
    "CONCURRED": "Senate Concurred",
    "HEARING_SCHEDULED": "Hearing Scheduled",
    "HEARING_RESCHEDULED": "Hearing Rescheduled",
    "HEARING_LOCATION_CHANGED": "Hearing Location Changed",
    "HEARING_TIME_CHANGED": "Hearing Time Changed",
    "REPORTED": "Reported Out",
    "READ": "First Reading",
    "READ_SECOND": "Second Reading",
    "READ_THIRD": "Third Reading",
    "PASSED_TO_BE_ENGROSSED": "Passed to Be Engrossed",
    "PLACED_IN_ORDERS": "Placed in Orders of the Day",
    "ENACTED": "Enacted",
    "SIGNED": "Signed by Governor",
    "AMENDED": "Amended",
    "ACCOMPANIED": "Accompanied",
    "DISCHARGED": "Discharged",
    "EMERGENCY_PREAMBLE": "Emergency Preamble",
    "REPORTING_EXTENDED": "Reporting Deadline Extended",
    "RULES_SUSPENDED": "Rules Suspended",
    "STEERING_REFERRAL": "Referred by Steering Committee",
    "STUDY_ORDER": "Study Order",
    "TITLE_CHANGED": "Title Changed",
    "REFERRED_TO_BILLS_IN_THIRD_READING": "Referred to Bills in Third Reading",
    "UNKNOWN": "Legislative Action",
}

CATEGORY_ORDER = {
    "referral-committee": 1,
    "hearing-scheduled": 2,
    "hearing-rescheduled": 3,
    "hearing-updated": 4,
    "reading-1": 5,
    "reading-2": 6,
    "reading-3": 7,
    "committee-passage": 8,
    "committee-passage-unfavorable": 9,
    "passage": 10,
    "amendment-passage": 11,
    "deadline-extension": 12,
    "executive-signature": 13,
    "other": 99,
}


# ── main ─────────────────────────────────────────────────────────────────────

def main():
    print(f"Reading DuckDB from {DUCKDB_PATH}")
    duck = duckdb.connect(str(DUCKDB_PATH), read_only=True)

    SQLITE_PATH.parent.mkdir(exist_ok=True)
    if SQLITE_PATH.exists():
        SQLITE_PATH.unlink()

    print(f"Writing SQLite to {SQLITE_PATH}")
    lite = sqlite3.connect(str(SQLITE_PATH))
    lite.execute("PRAGMA journal_mode=WAL")
    lite.execute("PRAGMA foreign_keys=ON")

    # ── bills ────────────────────────────────────────────────────────────────
    lite.execute("""
        CREATE TABLE bills (
            artifact_id     TEXT PRIMARY KEY,
            bill_id         TEXT NOT NULL,
            bill_label      TEXT,
            session         TEXT,
            committee_id    TEXT,
            title           TEXT,
            bill_url        TEXT,
            created_at      TEXT,
            computed_state  TEXT,
            computed_reason TEXT,
            deadline_60     TEXT,
            deadline_90     TEXT,
            effective_deadline TEXT,
            reported_out    INTEGER,
            reported_date   TEXT
        )
    """)

    rows = duck.execute("""
        SELECT
            ba.artifact_id,
            ba.bill_id,
            ba.session,
            ba.committee_id,
            ba.created_at,
            ba.bill_metadata,
            s.computed_state,
            s.computed_reason,
            s.computation_metadata
        FROM bill_artifacts ba
        LEFT JOIN artifact_snapshots s USING (artifact_id)
    """).fetchall()

    bill_rows = []
    for row in rows:
        (artifact_id, bill_id, session, committee_id, created_at,
         bill_metadata, computed_state, computed_reason, computation_metadata) = row
        meta = jload(bill_metadata)
        comp = jload(computation_metadata)
        bill_rows.append((
            artifact_id,
            bill_id,
            meta.get("bill_label") or normalise_bill_id(bill_id),
            session,
            committee_id,
            meta.get("title"),
            meta.get("bill_url"),
            created_at,
            computed_state,
            computed_reason,
            comp.get("deadline_60"),
            comp.get("deadline_90"),
            comp.get("effective_deadline"),
            1 if comp.get("reported_out") else 0,
            comp.get("reported_date"),
        ))

    lite.executemany("""
        INSERT INTO bills VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, bill_rows)
    print(f"  bills: {len(bill_rows)} rows")

    # ── timeline_actions ──────────────────────────────────────────────────────
    lite.execute("""
        CREATE TABLE timeline_actions (
            action_id       TEXT PRIMARY KEY,
            artifact_id     TEXT,
            action_date     TEXT,
            branch          TEXT,
            action_type     TEXT,
            action_label    TEXT,
            category        TEXT,
            category_order  INTEGER,
            raw_text        TEXT,
            extracted_data  TEXT,
            confidence      REAL
        )
    """)

    ta_rows = duck.execute("""
        SELECT action_id, artifact_id, action_date, branch,
               action_type, category, raw_text, extracted_data, confidence
        FROM timeline_actions
        ORDER BY action_date
    """).fetchall()

    lite.executemany("""
        INSERT INTO timeline_actions VALUES (?,?,?,?,?,?,?,?,?,?,?)
    """, [
        (
            r[0], r[1], r[2], r[3], r[4],
            ACTION_TYPE_LABELS.get(r[4], r[4]),
            r[5],
            CATEGORY_ORDER.get(r[5], 99),
            r[6], r[7], r[8],
        )
        for r in ta_rows
    ])
    print(f"  timeline_actions: {len(ta_rows)} rows")

    # ── hearing_records ───────────────────────────────────────────────────────
    lite.execute("""
        CREATE TABLE hearing_records (
            record_id               TEXT PRIMARY KEY,
            artifact_id             TEXT,
            hearing_id              TEXT,
            hearing_date            TEXT,
            hearing_url             TEXT,
            announcement_date       TEXT,
            scheduled_hearing_date  TEXT,
            notice_gap_days         INTEGER
        )
    """)

    hr_rows = duck.execute("""
        SELECT record_id, artifact_id, hearing_id, hearing_date,
               hearing_url, announcement_date, scheduled_hearing_date
        FROM hearing_records
    """).fetchall()

    # join with snapshot notice_gap_days
    notice_map = {}
    for row in duck.execute("""
        SELECT artifact_id, computation_metadata FROM artifact_snapshots
    """).fetchall():
        notice_map[row[0]] = jload(row[1]).get("notice_gap_days")

    lite.executemany("""
        INSERT INTO hearing_records VALUES (?,?,?,?,?,?,?,?)
    """, [
        (r[0], r[1], r[2], r[3], r[4], r[5], r[6],
         notice_map.get(r[1]))
        for r in hr_rows
    ])
    print(f"  hearing_records: {len(hr_rows)} rows")

    # ── documents ─────────────────────────────────────────────────────────────
    # Merge document_artifacts + document_index for the richest record
    lite.execute("""
        CREATE TABLE documents (
            document_id     TEXT PRIMARY KEY,
            artifact_id     TEXT,
            bill_id         TEXT,
            document_type   TEXT,
            source_url      TEXT,
            preview         TEXT,
            full_text       TEXT,
            content_hash    TEXT,
            parser_module   TEXT,
            parser_version  TEXT,
            confidence      REAL,
            needs_review    INTEGER
        )
    """)

    # document_artifacts (linked by artifact_id)
    da_rows = duck.execute("""
        SELECT da.document_id, da.artifact_id, ba.bill_id,
               da.document_type, da.source_url,
               da.content_preview, da.full_content,
               da.content_hash, da.parser_module, da.parser_version,
               da.confidence, da.needs_review
        FROM document_artifacts da
        JOIN bill_artifacts ba USING (artifact_id)
    """).fetchall()

    lite.executemany("""
        INSERT OR IGNORE INTO documents VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    """, da_rows)
    print(f"  documents (from document_artifacts): {len(da_rows)} rows")

    # document_index (additional records, may overlap)
    di_rows = duck.execute("""
        SELECT reference_id, NULL, bill_id,
               document_type, source_url,
               preview, full_text,
               content_hash, parser_module, NULL,
               confidence, needs_review
        FROM document_index
    """).fetchall()

    # Only insert those not already inserted (different reference scheme)
    # Mark artifact_id as NULL for document_index entries
    for r in di_rows:
        try:
            lite.execute("""
                INSERT OR IGNORE INTO documents VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
            """, r)
        except Exception:
            pass
    print(f"  documents (from document_index, additional): merged")

    # ── search_index ──────────────────────────────────────────────────────────
    # Denormalized FTS table for fast broad search
    lite.execute("""
        CREATE VIRTUAL TABLE search_index USING fts5(
            artifact_id UNINDEXED,
            bill_id,
            bill_label,
            title,
            committee_id,
            session UNINDEXED,
            computed_state UNINDEXED,
            action_text,
            document_text,
            tokenize="unicode61 remove_diacritics 1"
        )
    """)

    # Build one search doc per bill
    search_rows = {}
    for row in bill_rows:
        artifact_id = row[0]
        search_rows[artifact_id] = {
            "artifact_id": artifact_id,
            "bill_id": row[1],
            "bill_label": row[2],
            "title": row[5] or "",       # index 5 = title
            "committee_id": row[4] or "", # index 4 = committee_id
            "session": row[3] or "",      # index 3 = session
            "computed_state": row[8] or "",
            "action_texts": [],
            "doc_texts": [],
        }

    for r in ta_rows:
        aid = r[1]
        if aid in search_rows:
            search_rows[aid]["action_texts"].append(r[6] or "")  # raw_text

    for r in da_rows:
        aid = r[1]
        if aid in search_rows:
            search_rows[aid]["doc_texts"].append((r[5] or "")[:500])

    lite.executemany("""
        INSERT INTO search_index
        (artifact_id, bill_id, bill_label, title, committee_id, session,
         computed_state, action_text, document_text)
        VALUES (?,?,?,?,?,?,?,?,?)
    """, [
        (
            v["artifact_id"],
            v["bill_id"],
            v["bill_label"],
            v["title"],
            v["committee_id"],
            v["session"],
            v["computed_state"],
            " ".join(v["action_texts"])[:4000],
            " ".join(v["doc_texts"])[:4000],
        )
        for v in search_rows.values()
    ])
    print(f"  search_index: {len(search_rows)} documents")

    # ── indexes ───────────────────────────────────────────────────────────────
    lite.execute("CREATE INDEX idx_bills_bill_id ON bills(bill_id)")
    lite.execute("CREATE INDEX idx_bills_committee ON bills(committee_id)")
    lite.execute("CREATE INDEX idx_ta_artifact ON timeline_actions(artifact_id)")
    lite.execute("CREATE INDEX idx_hr_artifact ON hearing_records(artifact_id)")
    lite.execute("CREATE INDEX idx_docs_artifact ON documents(artifact_id)")
    lite.execute("CREATE INDEX idx_docs_bill ON documents(bill_id)")

    lite.commit()
    lite.close()
    duck.close()

    size_mb = SQLITE_PATH.stat().st_size / 1_048_576
    print(f"\nDone. {SQLITE_PATH} ({size_mb:.1f} MB)")


if __name__ == "__main__":
    main()
