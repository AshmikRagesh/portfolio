import type { ProjectType, Discipline } from "@/components/Tag";

// ── Featured works data ───────────────────────────────────────────────────────
// Cards render in order: the two main works as "flagship" rows, then the "standard" pair
// (604px each, equal height). Flagships are horizontal from lg up: the text column is
// min(640px, 62.5% − 136px) — 640px at the 1240px max width, giving way to the image on
// narrower desktops (≈380px text / 440px image at a 1024px window). Below lg they stack
// with a 224px (phone) / 400px (tablet) image. Values are multiples of 2/4px.
export type FeaturedLayout = "flagship" | "standard";

export interface FeaturedWork {
  type: ProjectType;
  discipline: Discipline;
  nda?: boolean; // case study is under NDA: hover shows an NDA stamp instead of the room key
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  imagePosition?: string;
  href: string;
  layout: FeaturedLayout;
}

// Helix, search and Find a Trip as flagships, then Bella and the NDA project as the
// smaller pair. The Artemis case studies stay live at their URLs but are off the list.
export const featuredWorks: FeaturedWork[] = [
  {
    type: "Case study",
    discipline: "Design systems",
    title: "Shipping designs in half the time with Helix",
    description:
      "A design-system skill for Claude Code that lets designers build straight from our components and tokens, so what we design is what developers ship.",
    image: "/images/helix/cover.webp",
    imageAlt: "An expedition card built from Helix components, with the component list beside it",
    href: "/works/helix",
    layout: "flagship",
  },
  {
    type: "Case study",
    discipline: "Product design",
    title: "From every trip at once to the few that fit: filters for TCS search",
    description:
      "Redesigned the TCS World Travel search page with filters, a result count and a no-results page that always leads somewhere. Live since July 2026.",
    image: "/images/tcs-search/cover.webp",
    imageAlt: "TCS World Travel search results for Japan, with a result count and tabs for expeditions, destinations and guides",
    href: "/works/tcs-search",
    layout: "flagship",
  },
  {
    type: "Case study",
    discipline: "Product design",
    title: "Letting TCS travellers explore a destination before they browse trips",
    description:
      "Designed and built a two-path choice in the Find a Trip menu, so travellers still exploring can learn about a place first. Both variants are built for an A/B/C test.",
    image: "/images/tcs-find-a-trip/cover.webp",
    imageAlt: "The TCS World Travel Find a Trip menu, with Africa open to Explore Trips and Explore Destination",
    href: "/works/tcs-find-a-trip",
    layout: "flagship",
  },
  {
    type: "Side project",
    discipline: "Interaction design",
    title: "Designing Bella, the desk bell that hosts this portfolio, in Claude Code",
    description:
      "A front-desk bell in the navbar that keeps track of how long you actually spend here, and rings when it has something to say.",
    image: "/images/bella/cover.png",
    imageAlt: "Bella the desk bell in eight moods: idle, ringing, reading, watching, dozing, celebrating, surprised and champion",
    href: "/works/bella",
    layout: "standard",
  },
  {
    type: "Side project",
    nda: true, // TODO: confirm which works are under NDA
    discipline: "AI",
    title: "Designing an AI-powered itinerary builder for modern travellers",
    description:
      "Lets travelers create fully personalised trips in under 2 minutes—combining real-time availability, smart suggestions, and a zero-friction booking flow.",
    image: "/images/works-cover.png",
    imageAlt: "AI Trip Planning preview",
    href: "#",
    layout: "standard",
  },
];

// The Artemis case studies stay live at their URLs but are off the homepage list
export const artemisReservations: FeaturedWork = {
  type: "Case study",
  discipline: "Product design",
  title: "Streamlining the reservations module in Artemis 3.0",
  description:
    "Introducing auto‑save, in‑app notifications, and categorised flights—reducing booking errors and cutting task completion time by 35%.",
  image: "/images/works-cover.png",
  imageAlt: "Artemis Reservations preview",
  href: "/works/artemis-reservations",
  layout: "flagship",
};

export const artemisInsurance: FeaturedWork = {
  type: "Case study",
  discipline: "Product design",
  title: "Integrating travel insurance into the Artemis booking flow",
  description:
    "Designed and shipped in 4 weeks — drove insurance adoption from 7% to 52% and generated $125K in Q1 revenue by embedding coverage directly into checkout.",
  image: "/images/works-cover.png",
  imageAlt: "Artemis insurance integration preview",
  href: "/works/artemis-insurance",
  layout: "standard",
};

export const artemisDesignSystem: FeaturedWork = {
  type: "Case study",
  discipline: "Design systems",
  title: "Creating and maintaining the Artemis Design System for Enchanting Travels",
  description:
    "Building accessible digital products is tough. It requires product designers to dive deep into guidelines, run extensive user testing, and manually audit every component. We fixed that.",
  image: "/images/works-cover.png",
  imageAlt: "Artemis Design System preview",
  href: "/works/artemis-design-system",
  layout: "flagship",
};

// Each card's room number on its key tag (101, 102, …), by its place in the list
export const roomFor = (work: FeaturedWork) => String(101 + Math.max(0, featuredWorks.indexOf(work)));

// The case studies that come after this one on the homepage — skipping works without a
// page and wrapping round to the start; a page that isn't listed leads to the first ones
export function nextWorks(href: string, count = 2): FeaturedWork[] {
  const pages = featuredWorks.filter((w) => w.href !== "#");
  const i = pages.findIndex((w) => w.href === href);
  const others = [...pages.slice(i + 1), ...pages.slice(0, Math.max(i, 0))];
  return others.slice(0, count);
}
