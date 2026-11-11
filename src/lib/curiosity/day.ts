// ── Curiosity: days in India time ─────────────────────────────────────────────
// Days and months are counted in IST (UTC+5:30, no daylight saving), so a visit at
// 2am in India counts for that day, not the one before. Days stored before v1.2
// were counted in UTC; they stay as they are.

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 86_400_000;

/** YYYY-MM-DD for the IST day containing `ms`. */
export function istDay(ms = Date.now()) {
  return new Date(ms + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** YYYY-MM for the IST month containing `ms`. */
export function istMonth(ms = Date.now()) {
  return istDay(ms).slice(0, 7);
}

/** The IST day `n` days before `day` (YYYY-MM-DD). */
export function dayBefore(day: string, n = 1) {
  return new Date(Date.parse(`${day}T00:00:00Z`) - n * DAY_MS).toISOString().slice(0, 10);
}
