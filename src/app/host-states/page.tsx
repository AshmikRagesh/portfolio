import { notFound } from "next/navigation";
import type { Metadata } from "next";
import HostStates from "@/components/host/HostStates";

// ── /host-states ──────────────────────────────────────────────────────────────
// A review sheet for the front-desk bell: every state it can be in, side by side,
// live. Development only — it 404s in production.

export const metadata: Metadata = { title: "Host states", robots: { index: false } };

export default function HostStatesPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <HostStates />;
}
