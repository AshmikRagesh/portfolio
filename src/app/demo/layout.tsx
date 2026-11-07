import type { Metadata } from "next";
import "./demo.css";

// Theme preview for "The Guesthouse" — not linked from the site and not indexed.
// Body text uses Geist here (instead of Roboto Slab) so the swap can be judged. It reuses
// the Geist the root layout already loads (--font-geist): loading the same Google font a
// second time made production builds fail when one of the two downloads came back broken.

export const metadata: Metadata = {
  title: "The Guesthouse · Ashmik Ragesh (demo)",
  robots: { index: false, follow: false },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="demo-root [--font-demo-body:var(--font-geist)]">
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
