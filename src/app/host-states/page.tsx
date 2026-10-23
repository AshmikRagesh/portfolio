import { notFound } from "next/navigation";
import type { Metadata } from "next";
import HostStates from "@/components/host/HostStates";

// ── /host-states ──────────────────────────────────────────────────────────────
// The reference page for the front-desk bell: anatomy, palette, moods, states and
// triggers, motion, copy, sound, usage and accessibility, with live scenes and a
// playground. Development only — it 404s in production.

export const metadata: Metadata = { title: "Front-desk bell", robots: { index: false } };

export default function HostStatesPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <HostStates />;
}
