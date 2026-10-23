// ── Curiosity: milestones ─────────────────────────────────────────────────────
// Moments the host speaks up as active time climbs. Each fires once per visit, as
// a tooltip under the logo. Edit the copy freely — that's what this file is for.
//
// Voice: the way a person at a front desk would actually say it. Short, plain,
// factual. One thought per line, ordinary words, no dashes, no setup-and-punchline,
// no visit counts.
//
// A milestone can have a few lines, and one is picked at random. `{p}` is the
// percentile out-stayed and `{top}` the matching "top N%". Rank lines need a
// `fallback` for when there aren't enough visitors yet to give a percentile.

export interface MilestoneContext {
  /** Percentile out-stayed, or null if not asked for / not enough data yet. */
  percentile: number | null;
  /** On a touch screen there's no hover, so lines that say "hover" say "tap" instead. */
  touch?: boolean;
}

export interface Milestone {
  id: string;
  at: number;
  rank?: boolean;
  say: (c: MilestoneContext) => string;
}

const pick = (lines: string[]) => lines[Math.floor(Math.random() * lines.length)];

function fill(line: string, { percentile }: MilestoneContext) {
  const p = percentile ?? 0;
  return line.replace("{p}", String(p)).replace("{top}", String(Math.max(1, 100 - p)));
}

const LINES = {
  thirtySeconds: ["You've been here 30 seconds. Hover over me to see your time."],
  thirtySecondsTouch: ["You've been here 30 seconds. Tap me to see your time."],
  twoMinutes: ["2 minutes. You've stayed longer than {p}% of people."],
  twoMinutesFallback: ["You've been here 2 minutes now."],
  fiveMinutes: ["5 minutes. Only {top}% of people stay this long."],
  fiveMinutesFallback: ["5 minutes now. Thanks for reading."],
};

/** Said once, the moment this visit becomes the longest anyone has ever stayed. */
export const RECORD_LINES = ["No one has stayed here longer than you. You're number one."];
export const sayRecord = () => pick(RECORD_LINES);

export const MILESTONES: Milestone[] = [
  {
    id: "30s",
    at: 30,
    say: (c) => fill(pick(c.touch ? LINES.thirtySecondsTouch : LINES.thirtySeconds), c),
  },
  {
    id: "2m",
    at: 120,
    rank: true,
    say: (c) => fill(pick(c.percentile !== null ? LINES.twoMinutes : LINES.twoMinutesFallback), c),
  },
  {
    id: "5m",
    at: 300,
    rank: true,
    say: (c) => fill(pick(c.percentile !== null ? LINES.fiveMinutes : LINES.fiveMinutesFallback), c),
  },
];

/** Typing pace for a bubble — roughly a brisk speaking voice. */
export const TYPE_MS_PER_CHAR = 32;
/** Extra beat after , . ? ! and em dashes, so lines land like sentences. */
export const TYPE_PAUSE_MS = 220;
/** Once fully typed, a bubble stays up long enough to read: a base plus a little per character. */
export const HOLD_BASE_MS = 2_400;
export const HOLD_PER_CHAR_MS = 40;
