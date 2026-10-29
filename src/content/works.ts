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

export const featuredWorks: FeaturedWork[] = [
  {
    type: "Case study",
    discipline: "Design systems",
    title: "Shipping designs in half the time with Helix",
    description:
      "A design-system skill for Claude Code that lets designers build straight from our components and tokens, so what we design is what developers ship.",
    image: "/images/works-cover.png",
    imageAlt: "Helix preview",
    href: "/works/helix",
    layout: "flagship",
  },
  {
    type: "Case study",
    discipline: "Product design",
    title: "Letting TCS travellers explore a destination before they browse trips",
    description:
      "Designed and built a two-path choice in the Find a Trip menu, so travellers still exploring can learn about a place first. Both variants are built for an A/B/C test.",
    image: "/images/tcs-find-a-trip/hero.webp",
    imageAlt: "TCS World Travel Find a Trip menu preview",
    imagePosition: "center 58%",
    href: "/works/tcs-find-a-trip",
    layout: "flagship",
  },
  {
    type: "Case study",
    discipline: "Product design",
    title: "Streamlining the reservations module in Artemis 3.0",
    description:
      "Introducing auto‑save, in‑app notifications, and categorised flights—reducing booking errors and cutting task completion time by 35%.",
    image: "/images/works-cover.png",
    imageAlt: "Artemis Reservations preview",
    href: "/works/artemis-reservations",
    layout: "flagship",
  },
  {
    type: "Case study",
    discipline: "Product design",
    title: "Integrating travel insurance into the Artemis booking flow",
    description:
      "Designed and shipped in 4 weeks — drove insurance adoption from 7% to 52% and generated $125K in Q1 revenue by embedding coverage directly into checkout.",
    image: "/images/works-cover.png",
    imageAlt: "Artemis insurance integration preview",
    href: "/works/artemis-insurance",
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

// The Artemis Design System case study stays live at its URL but is off the homepage list
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
