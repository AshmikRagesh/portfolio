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
    title: "Shipping designs in half the time with Helix on Claude Code",
    description:
      "A design-system skill for Claude Code that lets designers build straight from our components and tokens, so what we design is what developers ship.",
    href: "/works/helix",
  },
  "tcs-search": {
    youtubeId: PLACEHOLDER,
    title: "From every trip at once to the few that fit: filters for TCS search",
    description: "Filters, a result count and a no-results page that always leads somewhere. Live since July 2026.",
    href: "/works/tcs-search",
  },
  bella: {
    youtubeId: PLACEHOLDER,
    title: "Designing Bella, the desk bell that hosts this portfolio, in Claude Code",
    description: "A front-desk bell in the navbar that tracks how long you actually spend here.",
    href: "/works/bella",
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
    title: "Letting Enchanting Travels guests add travel insurance while they book",
    description:
      "A travel protection section in the Artemis traveller details step, designed in 1.5 weeks. Guests now add cover while they book, and adoption went from 7% to 52%.",
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

// Reels are switched off until the walkthrough videos are recorded (17 Nov 2026).
// Set this to true to bring back the floating reel on the home page and the case studies.
export const reelsEnabled = false;
