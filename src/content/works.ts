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
    title: "Creating and maintaining the Artemis Design System for Enchanting Travels",
    description:
      "Building accessible digital products is tough. It requires product designers to dive deep into guidelines, run extensive user testing, and manually audit every component. We fixed that.",
    image: "/images/works-cover.png",
    imageAlt: "Artemis Design System preview",
    href: "/works/artemis-design-system",
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

// Each card's room number on its key tag (101, 102, …), by its place in the list
export const roomFor = (work: FeaturedWork) => String(101 + featuredWorks.indexOf(work));
