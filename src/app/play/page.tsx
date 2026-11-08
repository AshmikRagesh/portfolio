import type { Metadata } from "next";
import PlayGrid from "@/components/play/PlayGrid";
import "./play.css";

export const metadata: Metadata = {
  title: "Play — Ashmik Ragesh",
  description: "Visuals, interactions, motion studies and side projects.",
};

export default function PlayPage() {
  return (
    <>
      <h1 className="sr-only">Play: visuals, interactions, motion studies and side projects</h1>
      <PlayGrid />
    </>
  );
}
