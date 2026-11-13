// ── Feedback: shared shapes and limits ────────────────────────────────────────
// Used by the case study feedback mode (client), the API route and the private
// /feedback inbox (server). Nothing here touches storage.

export const FEEDBACK_PATH = "/api/feedback";

/** This browser's anonymous feedback author ID (localStorage). Not a person, not a cookie. */
export const AUTHOR_KEY = "ash.feedback.author";
/** The optional name, remembered so a reviewer types it once. */
export const NAME_KEY = "ash.feedback.name";

export const LIMITS = {
  text: 500,
  name: 40,
  label: 80,
  snippet: 160,
  anchor: 120,
  section: 40,
} as const;

export type FeedbackStatus = "open" | "done" | "wontdo";
export const STATUSES: FeedbackStatus[] = ["open", "done", "wontdo"];

export interface FeedbackItem {
  id: string;
  /** Case study path, e.g. /works/helix */
  page: string;
  /** Section id from the page's SECTIONS, or "top" above the first chapter */
  section: string;
  /** Section label, e.g. "The Problem" */
  sectionLabel: string;
  /** Where the block is: "<section>|<tag>|<index>" — see lib/feedback/anchor.ts */
  anchor: string;
  /** What was clicked, e.g. "Paragraph" */
  label: string;
  /** The start of the block's text (or its image alt) when the comment was left */
  snippet: string;
  text: string;
  name: string;
  author: string;
  createdAt: number;
  status: FeedbackStatus;
}

/** What the browser sends. The server adds id, createdAt and status. */
export type FeedbackInput = Omit<FeedbackItem, "id" | "createdAt" | "status">;

export const PAGE_RE = /^\/works\/[a-z0-9-]{1,60}$/;
export const AUTHOR_RE = /^[a-z0-9-]{8,64}$/i;
export const ANCHOR_RE = /^[a-z0-9-]{1,40}\|[a-z0-9]{1,12}\|\d{1,4}$/i;
