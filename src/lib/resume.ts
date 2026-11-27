// ── Résumé ────────────────────────────────────────────────────────────────────
// What the "Fancy paper" sheet shows and the file "Take a copy" downloads.
// Content from Ashmik's 2026 résumé (the Nov 2026 PDF in public/), trimmed to what the sheet needs. Wrap a phrase in **double stars** to set it in the darker ink, or
// in ((double brackets)) to circle it in pen; `note` adds a handwritten margin note.

import { EMAIL, LINKEDIN } from "@/lib/contact";

// The version query makes browsers and the CDN fetch the new file whenever the résumé changes
export const RESUME_PDF = "/Ashmik-Ragesh-Resume.pdf?v=2026-11-26";
export const RESUME_FILENAME = "Ashmik-Ragesh-Resume.pdf";

// Opens the sheet from anywhere (the navbar tab, the mobile menu)
export const RESUME_OPEN_EVENT = "resume:open";
export const openResume = () => window.dispatchEvent(new Event(RESUME_OPEN_EVENT));

export const resume = {
  name: "Ashmik Ragesh",
  title: "Product Design Engineer",
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
        role: "Product Design Engineer",
        when: "Apr – Nov 2026",
        detail: [
          "Helped start **Helix**, a Claude Code skill that holds every brand's design system in code, cutting design delivery time ((roughly in half)).",
          "Redesigned TCS World Travel's trip search with filters, result counts and trip routes, leading to **1.3× more searches that end in a trip**.",
        ],
      },
      {
        org: "Travelopia",
        role: "Product Designer",
        when: "Aug 2023 – Mar 2026",
        detail: [
          "Integrated travel insurance into the Artemis booking flow in 1.5 weeks of design, ((lifting adoption from 7% to 52%)) and adding $125K in Q1 revenue.",
          "Spearheaded the **Artemis design system** across 3 brands, raising task completion by 35% and reducing errors by 60%.",
          "Designed a travel planning tool that cut lead prospecting time by 75%.",
        ],
      },
      {
        org: "Cubera",
        role: "Product Designer",
        when: "Jan – Aug 2023",
        detail: [
          "Led the MVP design of the Pegasus app.",
          "Built the **Pegasus design system**, ((reducing system errors by 65%)).",
        ],
      },
      {
        org: "Synctric",
        role: "Product Designer",
        when: "Aug 2022 – Jan 2023",
        detail: ["Created Synctric's brand identity and led its design system."],
      },
      {
        org: "AMMACHI Labs",
        role: "UX Designer",
        when: "Jan – Jul 2022",
        detail: ["Led UI/UX design for **NCERT government-funded educational simulations**."],
      },
    ],
  },
  {
    label: "Education",
    entries: [
      { org: "Amrita Vishwa Vidyapeetham", detail: ["Bachelor of Business Administration (BBA)", "2019 – 2022"] },
    ],
  },
  {
    label: "Skills",
    entries: [
      { org: "Design", detail: ["Product design, interaction design, design systems, design tokens, information architecture, prototyping, design-to-code, accessibility."] },
      { org: "Tools and AI", detail: ["Figma, Framer, ProtoPie, Spline, Claude Code, Cursor, Codex, Figma MCP, GitHub, Vercel, Supabase."] },
    ],
  },
];
