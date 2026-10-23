// ── Curiosity: visitor identity ───────────────────────────────────────────────
// Two records, both anonymous random IDs — no name, no IP, no cookie:
//
//   visitor   localStorage. One per browser. Remembers the first visit, how many
//             visits there have been and the lifetime active time across them.
//   visit     sessionStorage. One per tab session. A reload resumes it; closing
//             the tab ends it, and the next session counts as a new visit.
//
// Storage can be blocked (private mode, strict settings), so every read and write
// is guarded — the clock still runs, it just forgets on reload.

import { VISITOR_KEY, VISIT_KEY } from "./config";

export interface VisitorRecord {
  id: string;
  firstSeen: number;
  visits: number;
  lifetimeMs: number;
}

export interface VisitRecord {
  id: string;
  startedAt: number;
  activeMs: number;
}

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function read<T>(storage: Storage, key: string): T | null {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(storage: Storage, key: string, value: unknown) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked — the in-memory clock carries on regardless
  }
}

/**
 * Loads (or starts) this tab's visit, and the browser's visitor record alongside it.
 * A visit that's new to this session bumps the visitor's visit count exactly once,
 * so reloading the page never inflates it.
 */
export function loadSession(): { visitor: VisitorRecord; visit: VisitRecord } {
  const now = Date.now();
  const existingVisit = read<VisitRecord>(sessionStorage, VISIT_KEY);
  const storedVisitor = read<VisitorRecord>(localStorage, VISITOR_KEY);

  const visitor: VisitorRecord = storedVisitor ?? { id: newId(), firstSeen: now, visits: 0, lifetimeMs: 0 };
  const visit: VisitRecord = existingVisit ?? { id: newId(), startedAt: now, activeMs: 0 };

  if (!existingVisit) {
    visitor.visits += 1;
    write(sessionStorage, VISIT_KEY, visit);
  }
  write(localStorage, VISITOR_KEY, visitor);

  return { visitor, visit };
}

export function saveSession(visitor: VisitorRecord, visit: VisitRecord) {
  write(sessionStorage, VISIT_KEY, visit);
  write(localStorage, VISITOR_KEY, visitor);
}
