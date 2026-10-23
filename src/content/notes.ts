// ── Taste notes ───────────────────────────────────────────────────────────────
// The notes themselves, kept apart from how they're shown. TasteNotes posts each
// one in a mailer on the home page; /notes/[slug] is where it's read in full.
//
// A note is written here, not on Medium: `href` is only for a note that also lives
// somewhere else, and nothing links out when it's absent.

import type { ProjectType, Discipline } from "@/components/Tag";
import type { Tone } from "@/components/Mailer";

export interface Note {
  slug: string;
  title: string;
  /** One line on the mailer's front. */
  summary: string;
  date: string;
  readTime: string;
  /** Which mailer it's posted in. */
  tone: Tone;
  type: ProjectType;
  discipline: Discipline;
  /** The opening, shown on the sheet that comes out of the mailer. */
  excerpt: string;
  /** The rest of it, a paragraph per entry, read on /notes/[slug]. */
  body: string[];
  /** Set only when the note is also published elsewhere. */
  href?: string;
}

// TODO: DUMMY CONTENT — placeholder notes, written to size the layout. Replace every
// title, summary, excerpt and body below with real writing before publishing.
export const notes: Note[] = [
  {
    slug: "restraint-is-a-feature",
    title: "Restraint is a feature",
    summary: "Why the best interfaces I know feel like they left things out on purpose.",
    date: "Sep 2026",
    readTime: "8 min read",
    tone: "yellow",
    type: "Taste note",
    discipline: "Product design",
    excerpt:
      "Every product I admire has a moment where someone said no — not to a bad idea, but to a good one that didn't belong. In data-heavy tools the temptation is always to show more: another column, another filter, another chart. The work is figuring out which three numbers someone actually needs before their coffee goes cold.",
    body: [
      "Adding is easy to justify. Every extra control answers a real request from a real person, and each one on its own costs almost nothing. The cost shows up later, spread across everyone else: a screen that takes longer to read, a decision that takes longer to make.",
      "So the question I keep asking is not whether something is useful, but whether it earns the attention it takes. A filter used by four people a quarter is useful. Put it on the default view and it taxes everyone, every day.",
      "What restraint looks like in practice is boring. A settings page instead of a toolbar button. A sensible default instead of a choice. One number large enough to read across a room, with the other eleven a click away for the person who needs them.",
      "The result reads as confidence. An interface that shows you three things is claiming those three things matter, and that claim is only credible if someone did the work of ruling out the rest.",
    ],
  },
  {
    slug: "prototype-in-the-real-material",
    title: "Prototype in the real material",
    summary: "Figma shows what it looks like. Code shows what it's like to use.",
    date: "Jun 2026",
    readTime: "8 min read",
    tone: "red",
    type: "Taste note",
    discipline: "Interaction design",
    excerpt:
      "Static mocks are great at answering 'what does it look like?' and terrible at 'what does it feel like?'. Timing, loading, real data that's longer than the placeholder — none of it shows up until you build it. So I build early, with production-aware prototypes, and teams get to feel an idea before they commit to it.",
    body: [
      "A mock is a photograph of a product on its best day: the network is instant, every name fits on one line, and no list is empty. The moments a design actually has to survive are the ones a still frame can't hold.",
      "Building the idea in the real material surfaces them in an afternoon. A transition that read as elegant turns out to be half a second too slow on the fourth repeat. A card that looked balanced breaks as soon as a title runs to three lines.",
      "It also changes the conversation. Opinions about a picture stay opinions; once there's something to click, the room starts talking about what happened to them instead of what they think.",
      "None of this means designing in code. It means getting to the material early enough that what you learn there can still change the design, rather than arriving as a list of things engineering has to fix.",
    ],
  },
];

export const noteBySlug = (slug: string) => notes.find((n) => n.slug === slug);
