// ── The trips in the book ─────────────────────────────────────────────────────
// Four of Ashmik's trips, from the itineraries they were booked on: the stops, days and
// what was planned at each. Distances (`leg`) are only given where the itinerary gave
// them. The book reads only this file. Photos are from Wikimedia Commons (mostly the lead
// image of each place's Wikipedia article), saved small in /public/images/trips.

export type Photo = { src: string; caption: string };

export type Stop = {
  name: string;
  days: string;
  /** How far from the stop before */
  leg?: string;
  line: string;
  lon: number;
  lat: number;
  photos: Photo[];
};

export type Trip = {
  key: "dubai" | "azerbaijan" | "bali" | "kashmir";
  title: string;
  when: string;
  /** Labels for what's round the place on the map: [text, lon, lat, italic for water] */
  labels: [string, number, number, boolean?][];
  stops: Stop[];
};

const p = (slug: string, captions: string[]): Photo[] => captions.map((caption, n) => ({ src: `/images/trips/${slug}-${n}.jpg`, caption }));

export const TRIPS: Trip[] = [
  {
    key: "dubai",
    title: "Dubai",
    when: "6 days · Nov 2026",
    labels: [["Persian Gulf", 54.78, 25.2, true]],
    stops: [
      { name: "Dubai Marina", days: "Day 1", line: "A dinner cruise along the Marina on the first evening.", lon: 55.14, lat: 25.08, photos: p("dubai-marina", ["Dubai Marina", "Ain Dubai on Bluewaters"]) },
      { name: "Downtown", days: "Day 2", line: "A city tour, the aquarium in Dubai Mall, then Burj Khalifa from floors 124 and 125.", lon: 55.274, lat: 25.197, photos: p("downtown-dubai", ["Burj Khalifa at dusk", "Dubai Mall"]) },
      { name: "The desert", days: "Day 3", line: "A desert safari, with a barbecue dinner at the camp.", lon: 55.62, lat: 24.98, photos: p("dubai-desert", ["The desert at Lahbab"]) },
      { name: "Miracle Garden", days: "Day 4", line: "Miracle Garden in the day, Global Village at night.", lon: 55.244, lat: 25.06, photos: p("miracle-garden", ["Dubai Miracle Garden", "Global Village"]) },
      { name: "Abu Dhabi", days: "Day 5", line: "A day trip for a city tour of the capital.", lon: 54.43, lat: 24.45, photos: p("abu-dhabi", ["Sheikh Zayed Grand Mosque", "Qasr Al Watan", "Louvre Abu Dhabi"]) },
    ],
  },
  {
    key: "azerbaijan",
    title: "Azerbaijan",
    when: "6 days · Feb 2025",
    labels: [["Caspian Sea", 50.3, 39.6, true], ["RUSSIA", 47.1, 41.95], ["GEORGIA", 45.75, 41.55], ["ARMENIA", 45.1, 40.0], ["IRAN", 47.3, 38.85]],
    stops: [
      { name: "Baku", days: "Days 1–2", line: "Little Venice and the funicular on the first evening, then the Old City, the Fire Temple and Yanar Dag.", lon: 49.867, lat: 40.409, photos: p("baku", ["Flame Towers", "The funicular", "Maiden Tower, Old City"]) },
      { name: "Gabala", days: "Day 3", line: "A cable car up Tufandag, a tour of the town, and a night in the mountains.", lon: 47.845, lat: 40.981, photos: p("gabala", ["Gabala from Tufandag", "Mount Tufandag"]) },
      { name: "Gobustan", days: "Day 4", line: "Rock carvings at Gobustan and the mud volcanoes, then back to Baku.", lon: 49.375, lat: 40.108, photos: p("gobustan", ["Rock carvings at Gobustan", "A mud volcano"]) },
      { name: "Shahdag", days: "Day 5", line: "A day at Shahdag, with activities picked on the spot.", lon: 48.144, lat: 41.316, photos: p("shahdag", ["Shahdag Mountain Resort", "Mount Shahdag"]) },
    ],
  },
  {
    key: "bali",
    title: "Bali",
    when: "7 days · Jun 2024",
    labels: [["Bali Sea", 115.1, -8.0, true], ["Indian Ocean", 114.85, -8.95, true]],
    stops: [
      { name: "Uluwatu", days: "Day 1", line: "Uluwatu Temple on the cliff, and the Kecak dance.", lon: 115.085, lat: -8.829, photos: p("uluwatu", ["Uluwatu Temple", "Kecak dance"]) },
      { name: "Tanah Lot", days: "Day 2", line: "Ulun Danu on Lake Bratan, then Tanah Lot on its rock in the sea.", lon: 115.087, lat: -8.621, photos: p("tanah-lot", ["Tanah Lot", "Ulun Danu Bratan"]) },
      { name: "Lempuyang", days: "Day 3", line: "The gates of Lempuyang Temple, then the water palace at Tirta Gangga.", lon: 115.631, lat: -8.391, photos: p("lempuyang", ["Lempuyang Temple", "Tirta Gangga"]) },
      { name: "Nusa Penida", days: "Day 4", line: "Broken Beach, Angel’s Billabong, Kelingking and Crystal Bay, and a night on the island.", lon: 115.474, lat: -8.751, photos: p("nusa-penida", ["Kelingking Beach", "Broken Beach"]) },
      { name: "Ubud", days: "Days 5–6", line: "Rafting on the Ayung River, then the volcano from Kintamani, the monkey forest and the Bali Swing.", lon: 115.263, lat: -8.507, photos: p("ubud", ["Sacred Monkey Forest", "Mount Batur from Kintamani", "Rafting on the Ayung"]) },
    ],
  },
  {
    key: "kashmir",
    title: "Kashmir",
    when: "6 days · Nov 2023",
    labels: [],
    stops: [
      { name: "Srinagar", days: "Day 1", line: "Shalimar, Nishat and Chashme Shahi gardens, then Hazratbal and Pari Mahal.", lon: 74.876, lat: 34.149, photos: p("srinagar", ["Shalimar Bagh", "Nishat Bagh", "Hazratbal Shrine"]) },
      { name: "Sonmarg", days: "Day 2", leg: "about 80 km from Srinagar", line: "A walk or a pony ride up to the Thajiwas glacier.", lon: 75.293, lat: 34.304, photos: p("sonmarg", ["Sonmarg"]) },
      { name: "Pahalgam", days: "Day 3", leg: "about 90 km from Srinagar", line: "A drive along the Lidder River, with Betaab Valley, Aru and Chandanwari close by.", lon: 75.315, lat: 34.016, photos: p("pahalgam", ["Pahalgam", "Betaab Valley", "Aru Valley"]) },
      { name: "Gulmarg", days: "Day 4", leg: "about 142 km from Pahalgam", line: "The Gondola up the mountain, then a horse ride in the meadow.", lon: 74.38, lat: 34.048, photos: p("gulmarg", ["Gulmarg", "Gulmarg Gondola"]) },
      { name: "Dal Lake", days: "Days 5–6", leg: "about 51 km from Gulmarg", line: "A night on a houseboat, and a shikara ride on the lake.", lon: 74.836, lat: 34.075, photos: p("dal-lake", ["Dal Lake", "A shikara"]) },
    ],
  },
];
