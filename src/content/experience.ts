// ── Experience notepad (hero) ─────────────────────────────────────────────────
// Rows render top to bottom on the yellow pad beside the portrait, newest first.
// PLACEHOLDER: swap these for the real companies, roles and years.
export interface ExperienceEntry {
  company: string;
  role: string;
  years: string; // e.g. "2024 – 26" or "2018"
}

export const experience: ExperienceEntry[] = [
  { company: "Company name", role: "Design Engineer", years: "2024 – 26" },
  { company: "Company name", role: "Senior Product Designer", years: "2022 – 24" },
  { company: "Company name", role: "Product Designer", years: "2020 – 22" },
  { company: "Company name", role: "UI/UX Designer", years: "2018 – 20" },
];
