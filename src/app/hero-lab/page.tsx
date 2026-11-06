// ── /hero-lab ─────────────────────────────────────────────────────────────────
// Hero layout trials. Now: the split layout (text left, portrait and desk objects
// right), with the real work list under it for context. Pick it here before it goes
// into components/Hero.tsx. Development only: it 404s in production.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Works from "@/components/Works";
import HeroSplit from "./HeroSplit";

export const metadata: Metadata = { title: "Hero lab", robots: { index: false } };

export default function HeroLabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <div className="relative z-10 bg-background">
      <HeroSplit />
      <Works />
    </div>
  );
}
