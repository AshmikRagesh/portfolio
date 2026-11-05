// ── Résumé ────────────────────────────────────────────────────────────────────
// What the "Fancy paper" sheet shows and the file "Take a copy" downloads.
// PLACEHOLDER copy for now: Ashmik will swap in the real résumé (and the PDF in
// /public) later. Wrap a phrase in **double stars** to set it in the darker ink.

import { EMAIL } from "@/lib/contact";

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
  linkedin: { label: "in/ashmikragesh", href: "https://www.linkedin.com/in/ashmikragesh" },
};

export type ResumeEntry = { org: string; role?: string; when?: string; detail: string[] };
export type ResumeSection = { label: string; entries: ResumeEntry[] };

export const resumeSections: ResumeSection[] = [
  {
    label: "Experience",
    entries: [
      {
        org: "Studio Placeholder",
        role: "Senior Product Designer",
        when: "2024 – Now",
        detail: [
          "Led **end-to-end design of the core search experience**, from research and flows to shipped UI, working closely with engineering and product.",
          "Built and maintained **a design system used across four product teams**, with tokens, components and documentation.",
        ],
      },
      {
        org: "Company Placeholder",
        role: "Product Designer",
        when: "2022 – 2024",
        detail: [
          "Redesigned onboarding and account setup, **simplifying a seven-step flow into three**.",
          "Ran usability sessions every sprint and turned findings into a shared backlog of fixes.",
        ],
      },
      {
        org: "Agency Placeholder",
        role: "UX Designer",
        when: "2020 – 2022",
        detail: [
          "Designed web and mobile products for clients in retail, travel and finance, **from first sketch to developer handoff**.",
        ],
      },
      {
        org: "Freelance",
        role: "Visual Designer",
        when: "2019 – 2020",
        detail: ["Brand identities, websites and motion pieces for small businesses."],
      },
    ],
  },
  {
    label: "Education",
    entries: [
      { org: "University Placeholder", detail: ["B.Des. in Interaction Design", "2015 – 2019"] },
    ],
  },
  {
    label: "Skills",
    entries: [
      { org: "Design & Prototype", detail: ["Product design, interaction design, design systems, UX research, motion."] },
      { org: "Tools", detail: ["Figma, Claude Code, Cursor, Framer, Adobe CC, HTML/CSS/JavaScript."] },
    ],
  },
];
