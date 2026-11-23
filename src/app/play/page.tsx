import { notFound } from "next/navigation";

// Play is held back until it has real work in it: the page answers 404 for now. The grid
// (components/play/PlayGrid, content/play.ts, ./play.css) stays as it is, so bringing it
// back is restoring the page below.
//
//   import PlayGrid from "@/components/play/PlayGrid";
//   import "./play.css";
//   export const metadata = { title: "Play — Ashmik Ragesh", description: "Visuals, interactions, motion studies and side projects." };
//   export default function PlayPage() {
//     return (<><h1 className="sr-only">Play: visuals, interactions, motion studies and side projects</h1><PlayGrid /></>);
//   }

export default function PlayPage() {
  notFound();
}
