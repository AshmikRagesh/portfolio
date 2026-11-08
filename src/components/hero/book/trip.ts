// ── The trips in the book ─────────────────────────────────────────────────────
// DUMMY CONTENT: four stand-in trips so the book has something real-looking to show.
// Swap in real trips (places, days, notes, photos) when they're ready; the book reads
// only this file. Photos are from Wikimedia Commons (lead images of each place's
// Wikipedia article), saved small in /public/images/trips; `credit` is the Commons file.

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
  key: "kerala" | "rajasthan" | "karnataka" | "meghalaya";
  title: string;
  when: string;
  /** Labels for what's round the state on the map: [text, lon, lat, italic for water] */
  labels: [string, number, number, boolean?][];
  stops: Stop[];
};

const p = (slug: string, captions: string[]): Photo[] => captions.map((caption, n) => ({ src: `/images/trips/${slug}-${n}.jpg`, caption }));

export const TRIPS: Trip[] = [
  {
    key: "kerala",
    title: "Kerala",
    when: "9 days · Dec 2025",
    labels: [["Arabian Sea", 75.15, 10.5, true], ["KARNATAKA", 75.75, 12.62], ["TAMIL NADU", 77.62, 10.9]],
    stops: [
      { name: "Kochi", days: "Days 1–2", line: "Fishing nets at Fort Kochi, spice shops in Jew Town, appam and stew for dinner.", lon: 76.27, lat: 9.97, photos: p("kochi", ["Fishing nets at sunset", "Hill Palace", "Santa Cruz Basilica"]) },
      { name: "Munnar", days: "Days 3–4", leg: "about 130 km from Kochi", line: "Tea estates on every hill, and Top Station above the clouds at 6 am.", lon: 77.06, lat: 10.09, photos: p("munnar", ["Tea hills above town", "Ridges near Anamudi", "A Nilgiri tahr"]) },
      { name: "Thekkady", days: "Day 5", leg: "about 90 km from Munnar", line: "A bamboo raft on Periyar lake at dawn, then a walk through a spice garden.", lon: 77.17, lat: 9.6, photos: p("thekkady", ["Periyar lake", "Bamboo rafting", "Pattumalay tea bungalow"]) },
      { name: "Kumarakom", days: "Day 6", leg: "about 115 km from Thekkady", line: "Birds at sunrise from a canoe, and a slow afternoon by Vembanad lake.", lon: 76.43, lat: 9.62, photos: p("kumarakom", ["The backwaters"]) },
      { name: "Alleppey", days: "Day 7", leg: "about 35 km from Kumarakom", line: "A night on a houseboat through the canals, with karimeen for lunch.", lon: 76.34, lat: 9.49, photos: p("alleppey", ["Houseboat on the canal", "Alleppey beach"]) },
      { name: "Varkala", days: "Days 8–9", leg: "about 125 km from Alleppey", line: "Cliff-top cafés over a red-laterite beach, and the last sunset of the trip.", lon: 76.72, lat: 8.73, photos: p("varkala", ["The beach below the cliff", "South cliff"]) },
    ],
  },
  {
    key: "rajasthan",
    title: "Rajasthan",
    when: "12 days · Feb 2025",
    labels: [["PAKISTAN", 70.2, 28.7], ["GUJARAT", 72.2, 23.7], ["MADHYA PRADESH", 76.6, 23.75], ["HARYANA", 76.4, 29.2]],
    stops: [
      { name: "Jaipur", days: "Days 1–2", line: "Amber Fort in the morning light, and the Hawa Mahal from a rooftop café.", lon: 75.79, lat: 26.91, photos: p("jaipur", ["Hawa Mahal", "Amber Fort", "Jal Mahal"]) },
      { name: "Pushkar", days: "Day 3", leg: "about 145 km from Jaipur", line: "The ghats round the lake at dusk, with bells from every temple at once.", lon: 74.55, lat: 26.49, photos: p("pushkar", ["Ghats round the lake", "Hills after the monsoon"]) },
      { name: "Udaipur", days: "Days 4–6", leg: "about 280 km from Pushkar", line: "A boat on Lake Pichola, the City Palace, and dinner facing the water.", lon: 73.71, lat: 24.59, photos: p("udaipur", ["City Palace at dusk", "Jag Mandir", "Jagdish Temple"]) },
      { name: "Kumbhalgarh", days: "Day 7", leg: "about 85 km from Udaipur", line: "Walked a stretch of the 36 km wall as the sun went down.", lon: 73.58, lat: 25.15, photos: p("kumbhalgarh", ["The fort walls", "Ram Pol", "From above"]) },
      { name: "Jodhpur", days: "Days 8–9", leg: "about 180 km from Kumbhalgarh", line: "Mehrangarh standing over a sea of blue houses.", lon: 73.02, lat: 26.24, photos: p("jodhpur", ["Mehrangarh", "Jaswant Thada", "The clock tower"]) },
      { name: "Jaisalmer", days: "Days 10–12", leg: "about 285 km from Jodhpur", line: "The golden fort, then a night out in the dunes at Sam.", lon: 70.91, lat: 26.92, photos: p("jaisalmer", ["Jaisalmer Fort", "Patwon ki Haveli", "Gadisar Lake"]) },
    ],
  },
  {
    key: "karnataka",
    title: "Karnataka",
    when: "10 days · Aug 2024",
    labels: [["Arabian Sea", 73.2, 13.4, true], ["GOA", 73.95, 15.55], ["MAHARASHTRA", 75.4, 17.75], ["ANDHRA PRADESH", 78.4, 15.2], ["TAMIL NADU", 78.1, 11.7], ["KERALA", 75.6, 11.4]],
    stops: [
      { name: "Mysuru", days: "Days 1–2", line: "The palace lit up on a Sunday night, and the flower stalls at Devaraja market.", lon: 76.64, lat: 12.3, photos: p("mysuru", ["Chamundeshwari Temple", "From Chamundi Hills"]) },
      { name: "Coorg", days: "Days 3–4", leg: "about 120 km from Mysuru", line: "Coffee estates in the monsoon, and waterfalls at full force.", lon: 75.74, lat: 12.42, photos: p("coorg", ["Tadiandamol valley", "Mallalli falls", "Coorg hills"]) },
      { name: "Chikmagalur", days: "Days 5–6", leg: "about 160 km from Coorg", line: "Mullayanagiri at dawn, and far too much filter coffee.", lon: 75.77, lat: 13.32, photos: p("chikmagalur", ["Coffee country"]) },
      { name: "Gokarna", days: "Days 7–8", leg: "about 330 km from Chikmagalur", line: "The cliff path from Om Beach to Half Moon and Paradise.", lon: 74.32, lat: 14.55, photos: p("gokarna", ["Gokarna", "Vibhuti Falls"]) },
      { name: "Hampi", days: "Days 9–10", leg: "about 300 km from Gokarna", line: "Boulders and ruins for miles, and sunrise from Matanga Hill.", lon: 76.46, lat: 15.34, photos: p("hampi", ["Virupaksha Temple", "Vittala Temple", "Elephant stables"]) },
    ],
  },
  {
    key: "meghalaya",
    title: "Meghalaya",
    when: "7 days · Jun 2024",
    labels: [["ASSAM", 91.6, 26.15], ["BANGLADESH", 91.15, 24.95]],
    stops: [
      { name: "Shillong", days: "Days 1–2", line: "Ward’s Lake, Police Bazaar, and live music on a Friday night.", lon: 91.89, lat: 25.58, photos: p("shillong", ["Elephant Falls", "Laitlum Canyon", "Ward’s Lake"]) },
      { name: "Sohra", days: "Day 3", leg: "about 55 km from Shillong", line: "Waterfalls in every direction, and the wettest air I’ve ever breathed.", lon: 91.73, lat: 25.27, photos: p("sohra", ["Nohkalikai Falls", "Cherrapunji"]) },
      { name: "Nongriat", days: "Days 4–5", leg: "3,500 steps down from Sohra", line: "The double-decker living root bridge, and a swim under Rainbow Falls.", lon: 91.68, lat: 25.25, photos: p("nongriat", ["The living root bridge"]) },
      { name: "Mawlynnong", days: "Day 6", leg: "about 80 km from Sohra", line: "A village of flowers and bamboo bins, with a root bridge nearby.", lon: 91.88, lat: 25.2, photos: p("mawlynnong", ["Mawlynnong", "A village street"]) },
      { name: "Dawki", days: "Day 7", leg: "about 30 km from Mawlynnong", line: "Boats on the Umngot, the water so clear they look like they float.", lon: 92.02, lat: 25.18, photos: p("dawki", ["The Umngot river", "Boating on the Umngot"]) },
    ],
  },
];
