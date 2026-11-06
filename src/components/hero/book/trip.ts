// ── The trip in the book ──────────────────────────────────────────────────────
// DUMMY CONTENT: a stand-in Kerala trip so the book has something to show. Swap in a
// real trip (places, days, notes, photos) when it's ready; the book reads only this.

export type Scene = "nets" | "fort" | "dance" | "hills" | "mist" | "falls" | "boat" | "palms" | "sunset";
export type Palette = "brand" | "yellow" | "green" | "blue";

export type Photo = { scene: Scene; palette: Palette; caption: string };

export type Stop = {
  name: string;
  days: string;
  /** How far from the stop before, for the itinerary list */
  leg?: string;
  /** One line for the itinerary list */
  line: string;
  /** A couple of short paragraphs for the stop's own page */
  notes: string[];
  lon: number;
  lat: number;
  photos: Photo[];
};

export const TRIP = {
  title: "Itinerary",
  meta: "6 days · Kerala · Dec 2025",
  stops: [
    {
      name: "Kochi",
      days: "Days 1–2",
      line: "Fort Kochi’s fishing nets at sunset, and appam with stew for dinner.",
      notes: [
        "Landed late morning and went straight to Fort Kochi. The Chinese fishing nets go up and down all evening, and the fishermen let you help pull one in.",
        "Day two was Jew Town’s spice shops and a Kathakali show, with the make-up done in front of you first.",
      ],
      lon: 76.27,
      lat: 9.97,
      photos: [
        { scene: "nets", palette: "brand", caption: "Fishing nets, Fort Kochi" },
        { scene: "fort", palette: "yellow", caption: "Princess Street" },
        { scene: "dance", palette: "blue", caption: "Kathakali, before the show" },
      ],
    },
    {
      name: "Munnar",
      days: "Days 3–4",
      leg: "about 130 km from Kochi",
      line: "Tea estates in every direction, and clouds at Top Station at 6 am.",
      notes: [
        "Four hours of hairpin bends up from Kochi, the air getting colder every turn. Tea bushes cover every hill like green carpet.",
        "Up at five for Top Station: the valley was full of cloud, then it lifted all at once.",
      ],
      lon: 77.06,
      lat: 10.09,
      photos: [
        { scene: "hills", palette: "green", caption: "Tea estates on the way up" },
        { scene: "mist", palette: "blue", caption: "Top Station, 6 am" },
        { scene: "falls", palette: "green", caption: "Attukad waterfall" },
      ],
    },
    {
      name: "Alleppey",
      days: "Days 5–6",
      leg: "about 170 km from Munnar",
      line: "A night on a houseboat through the backwaters, with karimeen for lunch.",
      notes: [
        "Boarded a houseboat at noon and drifted through the backwaters until dark. Lunch was karimeen fried on board.",
        "Woke up moored by a paddy field, with ducks going past the window. Back to Kochi for the flight home.",
      ],
      lon: 76.34,
      lat: 9.49,
      photos: [
        { scene: "boat", palette: "brand", caption: "Houseboat, Vembanad" },
        { scene: "palms", palette: "green", caption: "Coconut palms along the canal" },
        { scene: "sunset", palette: "yellow", caption: "Last light on the backwaters" },
      ],
    },
  ] as Stop[],
};
