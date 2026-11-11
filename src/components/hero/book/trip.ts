// ── The trips in the book ─────────────────────────────────────────────────────
// Four of Ashmik's trips, from the itineraries they were booked on: the stops, days and
// what was planned at each. The book reads only this file. Photos are saved small in
// /public/images/trips. All are Ashmik's own, from the trips, two or three to a stop.
// Himachal's route is a common Parvati Valley plan built round the places
// visited (Kasol, Grahan, Pulga, Tulga); its pins are approximate, and Kalga, Pulga and
// Tulga (a kilometre or two apart) are set slightly apart so their pins don't overlap.

export type Photo = { src: string; caption: string };

export type Stop = {
  name: string;
  days: string;
  line: string;
  lon: number;
  lat: number;
  photos: Photo[];
};

export type Trip = {
  key: "himachal" | "azerbaijan" | "bali" | "kashmir";
  title: string;
  when: string;
  /** Labels for what's round the place on the map: [text, lon, lat, italic for water] */
  labels: [string, number, number, boolean?][];
  stops: Stop[];
};

const p = (slug: string, captions: string[]): Photo[] => captions.map((caption, n) => ({ src: `/images/trips/${slug}-${n}.jpg`, caption }));

export const TRIPS: Trip[] = [
  {
    key: "himachal",
    title: "Himachal",
    when: "6 days · Parvati Valley",
    labels: [["LAHAUL & SPITI", 77.518, 32.274], ["KULLU", 77.308, 32.141], ["Parvati River", 77.4, 31.997, true]],
    stops: [
      { name: "Kasol", days: "Day 1", line: "Into the valley, with an evening by the Parvati at the riverside cafés.", lon: 77.315, lat: 32.01, photos: p("kasol", ["Setting off from Kasol", "Chai under the prayer flags in Kasol"]) },
      { name: "Grahan", days: "Days 2–3", line: "A forest trek up to the village, and a night in a homestay.", lon: 77.372, lat: 32.045, photos: p("grahan", ["The waterfall on the Grahan trail", "Evening in Grahan village"]) },
      { name: "Kalga", days: "Day 4", line: "Orchards and wooden houses on the hill above Barshaini.", lon: 77.42, lat: 32.05, photos: p("kalga", ["Crossing a stream below Kalga", "Looking down the valley from Kalga"]) },
      { name: "Pulga", days: "Day 5", line: "On through the village to the old pine forest beside it.", lon: 77.445, lat: 32.026, photos: p("pulga", ["Under the deodars at Pulga", "In the pine forest at Pulga"]) },
      { name: "Tulga", days: "Day 6", line: "A slow walk through the forest, then down to Barshaini for the ride back.", lon: 77.468, lat: 32.05, photos: p("tulga", ["The trek to Tulga", "Resting in the pines at Tulga"]) },
    ],
  },
  {
    key: "azerbaijan",
    title: "Azerbaijan",
    when: "6 days · Feb 2025",
    labels: [["Caspian Sea", 50.3, 39.6, true], ["RUSSIA", 47.1, 41.95], ["GEORGIA", 45.75, 41.55], ["ARMENIA", 45.1, 40.0], ["IRAN", 47.3, 38.85]],
    stops: [
      { name: "Baku", days: "Days 1–2", line: "Little Venice and the funicular on the first evening, then the Old City, the Fire Temple and Yanar Dag.", lon: 49.867, lat: 40.409, photos: p("baku", ["Nizami Street", "The I Love Baku sign", "Heydar Aliyev Center"]) },
      { name: "Gabala", days: "Day 3", line: "A cable car up Tufandag, a tour of the town, and a night in the mountains.", lon: 47.845, lat: 40.981, photos: p("gabala", ["A misty morning in Gabala", "Snow on Tufandag", "A night out after Gabala"]) },
      { name: "Gobustan", days: "Day 4", line: "Rock carvings at Gobustan and the mud volcanoes, then back to Baku.", lon: 49.375, lat: 40.108, photos: p("gobustan", ["The trail through the Gobustan rocks", "The Fire Temple gate on the way back", "By the Fire Temple walls"]) },
      { name: "Shahdag", days: "Day 5", line: "A day at Shahdag, with activities picked on the spot.", lon: 48.144, lat: 41.316, photos: p("shahdag", ["Taking in the peaks at Shahdag", "Lying in the snow at Shahdag"]) },
    ],
  },
  {
    key: "bali",
    title: "Bali",
    when: "7 days · Jun 2024",
    labels: [["Bali Sea", 115.1, -8.0, true], ["Indian Ocean", 114.85, -8.95, true]],
    stops: [
      { name: "Uluwatu", days: "Day 1", line: "Uluwatu Temple on the cliff, and the Kecak dance.", lon: 115.085, lat: -8.829, photos: p("uluwatu", ["Under the frangipani at Uluwatu", "The temple gates at Uluwatu"]) },
      { name: "Tanah Lot", days: "Day 2", line: "Ulun Danu on Lake Bratan, then Tanah Lot on its rock in the sea.", lon: 115.087, lat: -8.621, photos: p("tanah-lot", ["On the rocks at Tanah Lot", "A coffee stop on the way"]) },
      { name: "Lempuyang", days: "Day 3", line: "The gates of Lempuyang Temple, then the water palace at Tirta Gangga.", lon: 115.631, lat: -8.391, photos: p("lempuyang", ["The Gates of Heaven at Lempuyang", "A heart between the gates"]) },
      { name: "Nusa Penida", days: "Day 4", line: "Broken Beach, Angel’s Billabong, Kelingking and Crystal Bay, and a night on the island.", lon: 115.474, lat: -8.751, photos: p("nusa-penida", ["Checked in for the night on the island", "On a swing above the jungle"]) },
      { name: "Ubud", days: "Days 5–6", line: "Rafting on the Ayung River, then the volcano from Kintamani, the monkey forest and the Bali Swing.", lon: 115.263, lat: -8.507, photos: p("ubud", ["Rafts lined up on the Ayung", "In the gorge on the Ayung", "Under a waterfall on the Ayung"]) },
    ],
  },
  {
    key: "kashmir",
    title: "Kashmir",
    when: "6 days · Nov 2023",
    labels: [],
    stops: [
      { name: "Srinagar", days: "Day 1", line: "Shalimar, Nishat and Chashme Shahi gardens, then Hazratbal and Pari Mahal.", lon: 74.876, lat: 34.149, photos: p("srinagar", ["Chinar leaves in Srinagar", "Bundled up for the cold"]) },
      { name: "Sonmarg", days: "Day 2", line: "A walk or a pony ride up to the Thajiwas glacier.", lon: 75.293, lat: 34.304, photos: p("sonmarg", ["Resting in the snow at Sonmarg", "The three of us at Sonmarg"]) },
      { name: "Pahalgam", days: "Day 3", line: "A drive along the Lidder River, with Betaab Valley, Aru and Chandanwari close by.", lon: 75.315, lat: 34.016, photos: p("pahalgam", ["Sunset over the river at Pahalgam", "By the Lidder River"]) },
      { name: "Gulmarg", days: "Day 4", line: "The Gondola up the mountain, then a horse ride in the meadow.", lon: 74.38, lat: 34.048, photos: p("gulmarg", ["Climbing from the Gondola", "At the top of the Gondola", "Above the clouds at Gulmarg"]) },
      { name: "Dal Lake", days: "Days 5–6", line: "A night on a houseboat, and a shikara ride on the lake.", lon: 74.836, lat: 34.075, photos: p("dal-lake", ["Snow angels", "Snow angels, round two"]) },
    ],
  },
];
