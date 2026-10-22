import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./demo.css";

// Theme preview for "The Guesthouse" — not linked from the site and not indexed.
// Body text uses Geist here (instead of Roboto Slab) so the swap can be judged.
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-demo-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "The Guesthouse · Ashmik Ragesh (demo)",
  robots: { index: false, follow: false },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${geist.variable} demo-root`}>
      {/* Hand-drawn wobble for lines and sticker edges */}
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <filter id="scribble">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="2" />
        </filter>
      </svg>
      {children}
    </div>
  );
}
