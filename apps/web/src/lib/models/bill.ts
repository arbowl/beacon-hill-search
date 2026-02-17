// ─── Core bill types ────────────────────────────────────────────────────────

export interface BillSummary {
  artifactId: string;
  billId: string;
  billLabel: string;
  session: string;
  committeeId: string;
  title: string;
  billUrl: string | null;
  computedState: ComplianceState | null;
  computedReason: string | null;
  effectiveDeadline: string | null;
  reportedOut: boolean;
  reportedDate: string | null;
}

export interface BillDetail extends BillSummary {
  deadline60: string | null;
  deadline90: string | null;
  createdAt: string;
  timeline: TimelineAction[];
  hearings: HearingRecord[];
  documents: BillDocument[];
}

export type ComplianceState = "Compliant" | "Non-Compliant" | "Pending" | "Exempt";

// ─── Timeline ────────────────────────────────────────────────────────────────

export interface TimelineAction {
  actionId: string;
  artifactId: string;
  actionDate: string;
  branch: Branch;
  actionType: string;
  actionLabel: string;
  category: string;
  categoryOrder: number;
  rawText: string;
  extractedData: Record<string, unknown>;
  confidence: number;
  /** traceability: the raw_text is the original source text */
  source: ActionSource;
}

export type Branch = "House" | "Senate" | "Joint" | "Governor" | string;

export interface ActionSource {
  type: "timeline_action";
  rawText: string;
  confidence: number;
}

// ─── Hearings ────────────────────────────────────────────────────────────────

export interface HearingRecord {
  recordId: string;
  artifactId: string;
  hearingId: string;
  hearingDate: string;
  hearingUrl: string | null;
  announcementDate: string | null;
  scheduledHearingDate: string | null;
  noticeGapDays: number | null;
  /** derived: was hearing announced with adequate notice? */
  adequateNotice: boolean | null;
}

// ─── Documents ───────────────────────────────────────────────────────────────

export interface BillDocument {
  documentId: string;
  artifactId: string | null;
  billId: string | null;
  documentType: DocumentType;
  documentTypeLabel: string;
  sourceUrl: string | null;
  preview: string | null;
  fullText: string | null;
  contentHash: string | null;
  parserModule: string | null;
  parserVersion: string | null;
  confidence: number | null;
  needsReview: boolean;
}

export type DocumentType = "summary" | "votes" | string;

// ─── Search ──────────────────────────────────────────────────────────────────

export interface SearchResult {
  artifactId: string;
  billId: string;
  billLabel: string;
  title: string;
  committeeId: string;
  session: string;
  computedState: ComplianceState | null;
  /** snippet of matching text */
  snippet: string | null;
  /**
   * Additional committee referrals for the same bill (same bill_id, different
   * committee_id / computed_state). Populated when a bill was referred to more
   * than one committee.
   */
  companions: CompanionEntry[];
}

/** A sibling committee referral for the same bill */
export interface CompanionEntry {
  artifactId: string;
  committeeId: string;
  computedState: ComplianceState | null;
}

export interface SearchResponse {
  query: string;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  results: SearchResult[];
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

export function mapBillRow(row: Record<string, unknown>): BillSummary {
  return {
    artifactId: row.artifact_id as string,
    billId: row.bill_id as string,
    billLabel: (row.bill_label as string) || (row.bill_id as string),
    session: row.session as string,
    committeeId: row.committee_id as string,
    title: (row.title as string) || "",
    billUrl: (row.bill_url as string) || null,
    computedState: (row.computed_state as ComplianceState) || null,
    computedReason: (row.computed_reason as string) || null,
    effectiveDeadline: (row.effective_deadline as string) || null,
    reportedOut: Boolean(row.reported_out),
    reportedDate: (row.reported_date as string) || null,
  };
}

export function mapTimelineRow(row: Record<string, unknown>): TimelineAction {
  let extractedData: Record<string, unknown> = {};
  try {
    if (row.extracted_data) {
      extractedData = JSON.parse(row.extracted_data as string);
    }
  } catch {
    // ignore
  }
  return {
    actionId: row.action_id as string,
    artifactId: row.artifact_id as string,
    actionDate: row.action_date as string,
    branch: (row.branch as Branch) || "Unknown",
    actionType: row.action_type as string,
    actionLabel: (row.action_label as string) || (row.action_type as string),
    category: row.category as string,
    categoryOrder: (row.category_order as number) || 99,
    rawText: (row.raw_text as string) || "",
    extractedData,
    confidence: (row.confidence as number) || 0,
    source: {
      type: "timeline_action",
      rawText: (row.raw_text as string) || "",
      confidence: (row.confidence as number) || 0,
    },
  };
}

export function mapHearingRow(row: Record<string, unknown>): HearingRecord {
  const noticeGap = row.notice_gap_days as number | null;
  return {
    recordId: row.record_id as string,
    artifactId: row.artifact_id as string,
    hearingId: row.hearing_id as string,
    hearingDate: row.hearing_date as string,
    hearingUrl: (row.hearing_url as string) || null,
    announcementDate: (row.announcement_date as string) || null,
    scheduledHearingDate: (row.scheduled_hearing_date as string) || null,
    noticeGapDays: noticeGap ?? null,
    adequateNotice: noticeGap === null ? null : noticeGap >= 5,
  };
}

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  summary: "Bill Summary",
  votes: "Vote Record",
};

export function mapDocumentRow(row: Record<string, unknown>): BillDocument {
  const docType = (row.document_type as string) || "other";
  return {
    documentId: row.document_id as string,
    artifactId: (row.artifact_id as string) || null,
    billId: (row.bill_id as string) || null,
    documentType: docType,
    documentTypeLabel: DOCUMENT_TYPE_LABELS[docType] || docType,
    sourceUrl: (row.source_url as string) || null,
    preview: (row.preview as string) || null,
    fullText: (row.full_text as string) || null,
    contentHash: (row.content_hash as string) || null,
    parserModule: (row.parser_module as string) || null,
    parserVersion: (row.parser_version as string) || null,
    confidence: (row.confidence as number) || null,
    needsReview: Boolean(row.needs_review),
  };
}
