// ── Résumé ────────────────────────────────────────────────────────────────────
// What the "Fancy paper" sheet shows and the file "Take a copy" downloads.
// Content from Ashmik's 2026 résumé, trimmed to what the sheet needs. Wrap a phrase in **double stars** to set it in the darker ink, or
// in ((double brackets)) to circle it in pen; `note` adds a handwritten margin note.

import { EMAIL, LINKEDIN } from "@/lib/contact";

export const RESUME_PDF = "/Ashmik-Ragesh-Resume.pdf";
export const RESUME_FILENAME = "Ashmik-Ragesh-Resume.pdf";

// Opens the sheet from anywhere (the navbar tab, the mobile menu)
export const RESUME_OPEN_EVENT = "resume:open";
export const openResume = () => window.dispatchEvent(new Event(RESUME_OPEN_EVENT));

export const resume = {
  name: "Ashmik Ragesh",
  title: "Product Designer",
  site: "ashmikragesh.com",
  email: EMAIL,
  linkedin: { label: "in/ashmik-ragesh", href: LINKEDIN },
};

export type ResumeEntry = { org: string; role?: string; when?: string; detail: string[]; note?: string };
export type ResumeSection = { label: string; entries: ResumeEntry[] };

export const resumeSections: ResumeSection[] = [
  {
    label: "Experience",
    entries: [
      {
        org: "Travelopia",
        role: "Product Designer",
        when: "Aug 2023 – Now",
        detail: [
          "Led design for three brands: Enchanting Travels, Hayes & Jarvis and My Planet.",
          "Spearheaded the **Artemis design system** across three travel brands, ((boosting task completion by 35%)) and reducing errors by 60%.",
          "Redesigned the travel proposal UX, leading to **a 40% increase in bookings**.",
          "Designed a travel planning tool that cut lead prospecting time by 75%.",
        ],
      },
      {
        org: "Cubera",
        role: "Product Designer",
        when: "Jan – Aug 2023",
        detail: [
          "Developed the **Pegasus design system**, ((reducing system errors by 65%)).",
          "Led the MVP design for the Pegasus application, with high-fidelity prototypes that sped up development and stakeholder alignment.",
        ],
      },
      {
        org: "Synctric",
        role: "Product Designer",
        when: "Aug 2022 – Jan 2023",
        detail: [
          "Created Synctric's brand identity and led its design system and website redesign.",
          "Designed high-fidelity financial dashboards.",
        ],
      },
      {
        org: "AMMACHI Labs",
        role: "UX Designer",
        when: "Jan 2022 – Jul 2022",
        detail: [
          "Led UI/UX design for **NCERT government-funded educational simulations**, shaped by user research with the team.",
        ],
      },
    ],
  },
  {
    label: "Education",
    entries: [
      { org: "Amrita Vishwa Vidyapeetham", detail: ["Bachelor of Business Administration", "2019 – 2022"] },
    ],
  },
  {
    label: "Skills",
    entries: [
      { org: "Design & Animation", detail: ["Interaction design, prototyping, user flows, information architecture, motion design, branding, responsive design for iOS, Android and web."] },
      { org: "Research", detail: ["User interviews, usability tests, heuristic evaluation, survey design, comparative analysis, A/B testing."] },
      { org: "Tools", detail: ["Figma, Framer, Adobe CC, FigJam, Protopie, Spline, Notion, Jira, ChatGPT, Midjourney."] },
    ],
  },
];
