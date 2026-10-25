"use client";

import { useId, useRef } from "react";
import { useStampOnce } from "@/components/useStampOnce";

// Rectangular rubber stamp marking the option that shipped — a sibling of the round
// NDA seal on the Works cards: double border, "SHIPPED" in grape ink with a star either
// side, rough edges and ink dropout. Presses down as its card (.group) scrolls into view.
const INK = "#9D136A";

export default function ShippedStamp({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const u = (name: string) => `url(#${name}-${id})`;
  const ref = useRef<SVGSVGElement>(null);
  useStampOnce(ref, "view");

  return (
    <svg
      ref={ref}
      width="168"
      height="64"
      viewBox="0 0 168 64"
      role="img"
      aria-label="Shipped"
      className={`shipped-stamp pointer-events-none overflow-visible ${className}`}
    >
      <defs>
        {/* Uneven rubber edge */}
        <filter id={`rough-${id}`} x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" seed="5" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2" />
        </filter>
        {/* Speckle + blotches: wherever these are opaque, the ink didn't take */}
        <filter id={`speckle-${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="9" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  14 0 0 0 -8.8" />
        </filter>
        <filter id={`blotch-${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="13" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  9 0 0 0 -5.2" />
        </filter>
        <mask id={`ink-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="168" height="64">
          <rect width="168" height="64" fill="#fff" />
          <rect width="168" height="64" fill="#000" filter={u("speckle")} />
          <rect width="168" height="64" fill="#000" opacity="0.15" filter={u("blotch")} />
        </mask>
      </defs>

      <g mask={u("ink")}>
        <g filter={u("rough")} fill="none" stroke={INK}>
          <rect x="2" y="2" width="164" height="60" rx="6" strokeWidth="3" />
          <rect x="7" y="7" width="154" height="50" rx="3" strokeWidth="1" />
        </g>
        <g filter={u("rough")} fill={INK} className="font-brand">
          <text x="84" y="41" textAnchor="middle" fontSize="24" letterSpacing="5" fontWeight="500" stroke={INK} strokeWidth="1.2">
            SHIPPED
          </text>
          <text x="20" y="36" textAnchor="middle" fontSize="8">★</text>
          <text x="148" y="36" textAnchor="middle" fontSize="8">★</text>
        </g>
      </g>
    </svg>
  );
}
