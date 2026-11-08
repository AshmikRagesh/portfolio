// ── Taste notes ───────────────────────────────────────────────────────────────
// Ashmik's articles on Medium. TasteNotes posts each one in a mailer on the home
// page, and clicking the mailer opens the article on Medium in a new tab.

import type { Tone } from "@/components/Mailer";

export interface Note {
  title: string;
  /** One line on the mailer's front. */
  summary: string;
  date: string;
  readTime: string;
  /** Which mailer it's posted in. */
  tone: Tone;
  /** The article on Medium. */
  href: string;
}

export const notes: Note[] = [
  {
    title: "PagePilot, a Figma plugin",
    summary: "A plugin that sets up and orders the pages in a Figma file for handoff, built with ChatGPT and no coding background.",
    date: "May 2023",
    readTime: "8 min read",
    tone: "vanilla",
    href: "https://medium.com/design-bootcamp/pagepilot-a-figma-plugin-built-with-the-support-of-chatgpt-2fdc4946f767",
  },
  {
    title: "5 design systems to steal from",
    summary: "Material, Apple's HIG, Fluent, Atlassian and Carbon, and what a UX designer can learn from each.",
    date: "Sep 2022",
    readTime: "3 min read",
    tone: "vanilla",
    href: "https://medium.com/@rageshashmik/5-design-systems-to-learn-and-steal-from-in-2022-for-ux-designers-2ae34fb991e6",
  },
];
