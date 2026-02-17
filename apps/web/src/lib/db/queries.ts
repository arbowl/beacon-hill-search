/**
 * queries.ts — all SQL queries for the app
 * All functions are synchronous (better-sqlite3).
 */
import { getDb } from "./db";
import {
  BillDetail,
  BillDocument,
  BillSummary,
  HearingRecord,
  SearchResponse,
  SearchResult,
  TimelineAction,
  mapBillRow,
  mapDocumentRow,
  mapHearingRow,
  mapTimelineRow,
} from "../models/bill";

// ─── Bills ────────────────────────────────────────────────────────────────────

export function getBillByBillId(billId: string): BillDetail | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT artifact_id, bill_id, bill_label, session, committee_id, title, bill_url,
              created_at, computed_state, computed_reason,
              deadline_60, deadline_90, effective_deadline,
              reported_out, reported_date
       FROM bills WHERE bill_id = ? LIMIT 1`
    )
    .get(billId) as Record<string, unknown> | undefined;

  if (!row) return null;

  const summary = mapBillRow(row);
  const timeline = getTimeline(row.artifact_id as string);
  const hearings = getHearings(row.artifact_id as string);
  const documents = getDocuments(row.artifact_id as string, billId);

  return {
    ...summary,
    deadline60: (row.deadline_60 as string) || null,
    deadline90: (row.deadline_90 as string) || null,
    createdAt: row.created_at as string,
    timeline,
    hearings,
    documents,
  };
}

export function getBillByArtifactId(artifactId: string): BillDetail | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT artifact_id, bill_id, bill_label, session, committee_id, title, bill_url,
              created_at, computed_state, computed_reason,
              deadline_60, deadline_90, effective_deadline,
              reported_out, reported_date
       FROM bills WHERE artifact_id = ? LIMIT 1`
    )
    .get(artifactId) as Record<string, unknown> | undefined;

  if (!row) return null;
  return getBillByBillId(row.bill_id as string);
}

export function getRelatedBills(
  committeeId: string,
  excludeArtifactId: string,
  limit = 5
): BillSummary[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT artifact_id, bill_id, bill_label, session, committee_id, title, bill_url,
              computed_state, computed_reason, effective_deadline,
              reported_out, reported_date
       FROM bills
       WHERE committee_id = ? AND artifact_id != ?
       LIMIT ?`
    )
    .all(committeeId, excludeArtifactId, limit) as Record<string, unknown>[];
  return rows.map(mapBillRow);
}

// ─── Timeline ────────────────────────────────────────────────────────────────

export function getTimeline(artifactId: string): TimelineAction[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT action_id, artifact_id, action_date, branch, action_type, action_label,
              category, category_order, raw_text, extracted_data, confidence
       FROM timeline_actions WHERE artifact_id = ?
       ORDER BY action_date ASC, category_order ASC`
    )
    .all(artifactId) as Record<string, unknown>[];
  return rows.map(mapTimelineRow);
}

// ─── Hearings ────────────────────────────────────────────────────────────────

export function getHearings(artifactId: string): HearingRecord[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT record_id, artifact_id, hearing_id, hearing_date, hearing_url,
              announcement_date, scheduled_hearing_date, notice_gap_days
       FROM hearing_records WHERE artifact_id = ?
       ORDER BY hearing_date ASC`
    )
    .all(artifactId) as Record<string, unknown>[];
  return rows.map(mapHearingRow);
}

// ─── Documents ───────────────────────────────────────────────────────────────

export function getDocuments(
  artifactId: string,
  billId: string
): BillDocument[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT document_id, artifact_id, bill_id, document_type, source_url,
              preview, full_text, content_hash, parser_module, parser_version,
              confidence, needs_review
       FROM documents
       WHERE artifact_id = ? OR bill_id = ?
       ORDER BY document_type,
         -- prefer rows with a human-readable preview first,
         -- then non-JSON full_text, then anything else
         CASE
           WHEN preview IS NOT NULL AND LENGTH(TRIM(preview)) > 10 THEN 0
           WHEN full_text IS NOT NULL AND LENGTH(TRIM(full_text)) > 10
                AND full_text NOT LIKE '{%' THEN 1
           WHEN full_text IS NOT NULL AND LENGTH(TRIM(full_text)) > 10 THEN 2
           ELSE 3
         END`
    )
    .all(artifactId, billId) as Record<string, unknown>[];
  // Deduplicate by source_url
  const seen = new Set<string>();
  return rows
    .filter((r) => {
      const key = (r.source_url as string) || (r.document_id as string);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(mapDocumentRow);
}

// ─── Search ───────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export function searchBills(params: {
  q: string;
  page?: number;
  committeeId?: string;
  session?: string;
  computedState?: string;
}): SearchResponse {
  const db = getDb();
  const { q, page = 1, committeeId, session, computedState } = params;
  const offset = (page - 1) * PAGE_SIZE;

  // Build FTS query: sanitize and construct
  const ftsQuery = buildFtsQuery(q);

  // Count total first
  let total = 0;
  let resultRows: Record<string, unknown>[] = [];

  if (!ftsQuery) {
    // Empty search: return all, filtered
    const whereParts: string[] = [];
    const whereArgs: unknown[] = [];

    if (committeeId) {
      whereParts.push("committee_id = ?");
      whereArgs.push(committeeId);
    }
    if (session) {
      whereParts.push("session = ?");
      whereArgs.push(session);
    }
    if (computedState) {
      whereParts.push("computed_state = ?");
      whereArgs.push(computedState);
    }

    const where = whereParts.length > 0 ? `WHERE ${whereParts.join(" AND ")}` : "";

    total = (
      db.prepare(`SELECT COUNT(*) as n FROM bills ${where}`).get(...whereArgs) as {
        n: number;
      }
    ).n;

    resultRows = db
      .prepare(
        `SELECT artifact_id, bill_id, bill_label, title, committee_id, session,
                computed_state, NULL as snippet
         FROM bills ${where}
         ORDER BY bill_id
         LIMIT ${PAGE_SIZE} OFFSET ${offset}`
      )
      .all(...whereArgs) as Record<string, unknown>[];
  } else {
    // FTS search
    const filterParts: string[] = [];
    const filterArgs: unknown[] = [];

    if (committeeId) {
      filterParts.push("b.committee_id = ?");
      filterArgs.push(committeeId);
    }
    if (session) {
      filterParts.push("b.session = ?");
      filterArgs.push(session);
    }
    if (computedState) {
      filterParts.push("b.computed_state = ?");
      filterArgs.push(computedState);
    }

    const filterJoin =
      filterParts.length > 0 ? `AND ${filterParts.join(" AND ")}` : "";

    // Count
    const countRow = db
      .prepare(
        `SELECT COUNT(*) as n
         FROM search_index si
         JOIN bills b ON si.artifact_id = b.artifact_id
         WHERE search_index MATCH ?
         ${filterJoin}`
      )
      .get(ftsQuery, ...filterArgs) as { n: number } | undefined;
    total = countRow?.n ?? 0;

    // Results with snippet
    resultRows = db
      .prepare(
        `SELECT b.artifact_id, b.bill_id, b.bill_label, b.title,
                b.committee_id, b.session, b.computed_state,
                snippet(search_index, 3, '<mark>', '</mark>', '…', 24) as snippet
         FROM search_index si
         JOIN bills b ON si.artifact_id = b.artifact_id
         WHERE search_index MATCH ?
         ${filterJoin}
         ORDER BY rank
         LIMIT ${PAGE_SIZE} OFFSET ${offset}`
      )
      .all(ftsQuery, ...filterArgs) as Record<string, unknown>[];
  }

  const results: SearchResult[] = resultRows.map((r) => ({
    artifactId: r.artifact_id as string,
    billId: r.bill_id as string,
    billLabel: (r.bill_label as string) || (r.bill_id as string),
    title: (r.title as string) || "",
    committeeId: (r.committee_id as string) || "",
    session: (r.session as string) || "",
    computedState: (r.computed_state as SearchResult["computedState"]) || null,
    snippet: (r.snippet as string) || null,
  }));

  return {
    query: q,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
    results,
  };
}

function buildFtsQuery(q: string): string {
  if (!q || !q.trim()) return "";
  // Escape FTS special chars, then wrap terms with prefix matching
  const sanitized = q
    .trim()
    .replace(/['"*^()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!sanitized) return "";
  // Each word becomes a prefix match term
  const terms = sanitized
    .split(" ")
    .filter(Boolean)
    .map((t) => `"${t}"*`)
    .join(" ");
  return terms;
}

// ─── Committees ──────────────────────────────────────────────────────────────

export function getDistinctCommittees(): { id: string; count: number }[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT committee_id as id, COUNT(*) as count
       FROM bills WHERE committee_id IS NOT NULL
       GROUP BY committee_id ORDER BY count DESC`
    )
    .all() as { id: string; count: number }[];
}

export function getDistinctSessions(): string[] {
  const db = getDb();
  return (
    db
      .prepare(`SELECT DISTINCT session FROM bills ORDER BY session DESC`)
      .all() as { session: string }[]
  ).map((r) => r.session);
}

export function getStats(): {
  totalBills: number;
  totalActions: number;
  totalHearings: number;
  totalDocuments: number;
  compliant: number;
  nonCompliant: number;
} {
  const db = getDb();
  const bills = (
    db.prepare("SELECT COUNT(*) as n FROM bills").get() as { n: number }
  ).n;
  const actions = (
    db.prepare("SELECT COUNT(*) as n FROM timeline_actions").get() as { n: number }
  ).n;
  const hearings = (
    db.prepare("SELECT COUNT(*) as n FROM hearing_records").get() as { n: number }
  ).n;
  const documents = (
    db.prepare("SELECT COUNT(*) as n FROM documents").get() as { n: number }
  ).n;
  const compliant = (
    db
      .prepare(
        "SELECT COUNT(*) as n FROM bills WHERE computed_state = 'Compliant'"
      )
      .get() as { n: number }
  ).n;
  const nonCompliant = (
    db
      .prepare(
        "SELECT COUNT(*) as n FROM bills WHERE computed_state = 'Non-Compliant'"
      )
      .get() as { n: number }
  ).n;
  return {
    totalBills: bills,
    totalActions: actions,
    totalHearings: hearings,
    totalDocuments: documents,
    compliant,
    nonCompliant,
  };
}
