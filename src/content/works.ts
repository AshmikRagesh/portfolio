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
  /** A 10s muted loop over the image (cards on the home page); `poster` is its first frame */
  video?: string;
  poster?: string;
  href: string;
  layout: FeaturedLayout;
}

// Order (Ashmik, 27 Nov): Helix, insurance and Find a Trip as flagships, then Bella and the
// locked TCS search as the smaller pair. Each description is one line: what changed for whom,
// and why it matters; no build details.
export const artemisInsurance: FeaturedWork = {
  type: "Case study",
  discipline: "Product design",
  title: "Letting Enchanting Travels guests add travel insurance while they book",
  description:
    "Travel protection built into the booking flow, so guests can cover their trip themselves instead of asking a consultant.",
  image: "/images/artemis-insurance/hero.webp",
  video: "/videos/artemis-insurance/card.mp4",
  poster: "/images/artemis-insurance/card-poster.webp",
  imageAlt: "The Enchanting Travels traveller details step with the travel protection section: a dark green banner above two plans, Trip Cancellation (CFAR) and the Travel Protection Plan",
  href: "/works/artemis-insurance",
  layout: "flagship",
};

export const featuredWorks: FeaturedWork[] = [
  {
    type: "Case study",
    discipline: "Design systems",
    title: "Shipping designs in half the time with Helix on Claude Code",
    description:
      "Our design systems inside Claude Code, so designers build with real components and what they design is what ships.",
    image: "/images/helix/cover.webp",
    video: "/videos/helix/card.mp4",
    poster: "/images/helix/card-poster.webp",
    imageAlt: "An expedition card built from Helix components, with the component list beside it",
    href: "/works/helix",
    layout: "flagship",
  },
  artemisInsurance,
  {
    type: "Case study",
    discipline: "Product design",
    title: "Letting TCS travellers explore a destination before they book",
    description:
      "A choice in the Find a Trip menu, so travellers still deciding where to go can explore a destination before they look at trips.",
    image: "/images/tcs-find-a-trip/cover-lime.webp",
    video: "/videos/tcs-find-a-trip/card.mp4",
    poster: "/images/tcs-find-a-trip/card-poster.webp",
    imageAlt: "The TCS World Travel Find a Trip menu, with Africa open to Explore Trips and Explore Destination",
    href: "/works/tcs-find-a-trip",
    layout: "flagship",
  },
  {
    type: "Side project",
    discipline: "Interaction design",
    title: "Designing Bella, the desk bell that hosts this portfolio, in Claude Code",
    description:
      "A desk bell in the navbar that greets visitors and counts how long they actually spend here.",
    image: "/images/bella/cover.webp",
    video: "/videos/bella/card.mp4",
    poster: "/images/bella/card-poster.webp",
    imageAlt: "Bella the desk bell in eight moods: idle, ringing, reading, watching, dozing, celebrating, surprised and champion",
    href: "/works/bella",
    layout: "standard",
  },
  {
    type: "Case study",
    discipline: "Product design",
    title: "From every trip at once to just the few that fit: search filters for TCS",
    description:
      "Filters, a result count and each trip's route on its card, so travellers can narrow thousands of trips to the few that fit.",
    image: "/images/tcs-search/cover.webp",
    video: "/videos/tcs-search/card.mp4",
    poster: "/images/tcs-search/card-poster.webp",
    imageAlt: "TCS World Travel search results for Japan, with a result count and tabs for expeditions, destinations and guides",
    href: "/works/tcs-search", // password-locked (lib/caseLock)
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
