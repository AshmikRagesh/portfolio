// ── Play ──────────────────────────────────────────────────────────────────────
// The pieces on the Play page (/play): visuals, interactions, motion and side projects.
// Each sits in an endless grid you can drag around; tapping one opens it large.
//
// These are grey placeholders until the real pieces are added. For each one, set `src`
// (an image in /public/play/…) or `video` (an .mp4/.webm), and its real `title`, `year`
// and `aspect` (width ÷ height of the original, used when it opens large).
// Keep the total a multiple of 6: the grid is six columns wide.

export const PLAY_KINDS = ["Visuals", "Interactions", "Motion", "Side projects"] as const;
export type PlayKind = (typeof PLAY_KINDS)[number];

export interface PlayItem {
  id: string;
  title: string;
  kind: PlayKind;
  year: string;
  /** Width ÷ height of the original. */
  aspect: number;
  src?: string;
  video?: string;
  /** Placeholder grey, until src or video is set. */
  tone: string;
}

const GREYS = ["#e9e8ea", "#dedcdf", "#d3d0d4", "#c8c4c9", "#e3e1e4", "#d8d5d9"];
const ASPECTS = [1, 4 / 5, 3 / 2, 1, 9 / 16, 16 / 10];

const placeholders = (kind: PlayKind, title: string, offset: number): PlayItem[] =>
  Array.from({ length: 6 }, (_, i) => ({
    id: `${kind.toLowerCase().replace(/\s+/g, "-")}-${i + 1}`,
    title: `${title} ${String(i + 1).padStart(2, "0")}`,
    kind,
    year: "2026",
    aspect: ASPECTS[(i + offset) % ASPECTS.length],
    tone: GREYS[(i + offset) % GREYS.length],
  }));

export const playItems: PlayItem[] = [
  ...placeholders("Visuals", "Visual", 0),
  ...placeholders("Interactions", "Interaction", 1),
  ...placeholders("Motion", "Motion study", 2),
  ...placeholders("Side projects", "Side project", 3),
];
