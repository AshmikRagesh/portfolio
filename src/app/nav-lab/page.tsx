// ── /nav-lab ──────────────────────────────────────────────────────────────────
// Navbar explorations, side by side: layouts with the logo moved and the CTA gone,
// and hover ideas for the tabs. Pick one here before it goes into Navbar.tsx.
// Development only: it 404s in production.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NavLab from "./NavLab";
import "./nav-lab.css";

export const metadata: Metadata = { title: "Nav lab", robots: { index: false } };

export default function NavLabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <NavLab />;
}
