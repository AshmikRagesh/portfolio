// Walkthrough videos for each case study. The home page plays them in this order;
// each case study plays its own. Titles and descriptions reuse the Works cards and
// case study overviews.

export interface Reel {
  youtubeId: string;
  title: string;
  description: string;
  href: string;
}

// Placeholder video until each case study has its own cut
const PLACEHOLDER = "2rs_wDV_0Ww";

export const reels = {
  helix: {
    youtubeId: PLACEHOLDER,
    title: "Helix: keeping the TCS design system in code",
    description:
      "A design-system skill for Claude Code that lets designers build straight from our components and tokens, so what we design is what developers ship.",
    href: "/works/helix",
  },
  "tcs-find-a-trip": {
    youtubeId: PLACEHOLDER,
    title: "Letting TCS travellers explore a destination before they browse trips",
    description:
      "Designed and built a two-path choice in the Find a Trip menu, so travellers still exploring can learn about a place first. Both variants are built for an A/B/C test.",
    href: "/works/tcs-find-a-trip",
  },
  "artemis-reservations": {
    youtubeId: PLACEHOLDER,
    title: "Streamlining the reservations module in Artemis 3.0",
    description:
      "Introducing auto‑save, in‑app notifications, and categorised flights—reducing booking errors and cutting task completion time by 35%.",
    href: "/works/artemis-reservations",
  },
  "artemis-insurance": {
    youtubeId: PLACEHOLDER,
    title: "Integrating travel insurance into the Artemis booking flow",
    description:
      "Designed and shipped in 4 weeks — drove insurance adoption from 7% to 52% and generated $125K in Q1 revenue by embedding coverage directly into checkout.",
    href: "/works/artemis-insurance",
  },
  "artemis-design-system": {
    youtubeId: PLACEHOLDER,
    title: "Creating and maintaining the Artemis Design System for Enchanting Travels",
    description:
      "Building accessible digital products is tough. It requires product designers to dive deep into guidelines, run extensive user testing, and manually audit every component. We fixed that.",
    href: "/works/artemis-design-system",
  },
} satisfies Record<string, Reel>;

// The homepage plays the reels of the listed works, in homepage order
export const reelOrder: Reel[] = [reels.helix, reels["tcs-find-a-trip"], reels["artemis-reservations"], reels["artemis-insurance"]];
