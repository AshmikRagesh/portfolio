"use client";

import { useId, useRef } from "react";
import { useStampOnce } from "@/components/useStampOnce";

// Round rubber-stamp "NDA" seal for case studies that can't be shown publicly.
//   • double outer ring, thin inner ring and a dotted ring, like a postmark
//   • "CONFIDENTIAL" across the top and "PROTECTED WORK" along the bottom — both upright —
//     with a star at either side
//   • a ribbon band with notched tails across the middle carrying "NDA"; the rings are
//     cut away behind it, as on a real stamp
//   • rough edges (turbulence displacement) + ink dropout (speckle mask)
//   • ink is the `warning` red at full strength, so it reads bright on the greyed-out image
// Presses down the first time its card is hovered or focused, then stays. Touch screens
// can't hover, so there it stamps once the card scrolls into view. (See .nda-stamp in
// globals.css — triggered by data-stamped on the card.)
const INK = "#c5444a";

export default function NdaStamp({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const u = (name: string) => `url(#${name}-${id})`;
  const ref = useRef<SVGSVGElement>(null);

  useStampOnce(ref);

  // Ribbon: body 24→96 × 49→71, notched tails out to x = 12 / 108
  const ribbon = "M24 49h72v22H24Z M24 52H12l5 8-5 8h12 M96 52h12l-5 8 5 8H96";

  return (
    <svg
      ref={ref}
      width="120"
      height="120"
      viewBox="0 0 120 120"
      role="img"
      aria-label="Under NDA — case study not public"
      className={`nda-stamp pointer-events-none overflow-visible ${className}`}
    >
      <defs>
        {/* Uneven rubber edge */}
        <filter id={`rough-${id}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
        </filter>
        {/* Speckle + blotches: wherever these are opaque, the ink didn't take */}
        <filter id={`speckle-${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  14 0 0 0 -8.8" />
        </filter>
        <filter id={`blotch-${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="11" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  9 0 0 0 -5.2" />
        </filter>
        <mask id={`ink-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">
          <rect width="120" height="120" fill="#fff" />
          <rect width="120" height="120" fill="#000" filter={u("speckle")} />
          <rect width="120" height="120" fill="#000" opacity="0.15" filter={u("blotch")} />
        </mask>
        {/* Rings stop at the ribbon */}
        <mask id={`band-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">
          <rect width="120" height="120" fill="#fff" />
          <path d="M10 47h100v26H10Z" fill="#000" />
        </mask>
        {/* Text paths: top runs left→right over the top; bottom runs left→right under the bottom */}
        <path id={`top-${id}`} d="M19 60A41 41 0 0 1 101 60" />
        <path id={`bottom-${id}`} d="M12 60A48 48 0 0 0 108 60" />
      </defs>

      <g mask={u("ink")}>
        <g filter={u("rough")} fill="none" stroke={INK}>
          {/* Double outer ring */}
          <circle cx="60" cy="60" r="57" strokeWidth="3" />
          <circle cx="60" cy="60" r="53" strokeWidth="1" />
          {/* Inner + dotted rings, cut away behind the ribbon */}
          <g mask={u("band")}>
            <circle cx="60" cy="60" r="37" strokeWidth="1.4" />
            <circle cx="60" cy="60" r="32" strokeWidth="1.1" strokeDasharray="0.1 3.4" strokeLinecap="round" />
          </g>
          {/* Ribbon */}
          <path d={ribbon} strokeWidth="2.4" strokeLinejoin="round" />
        </g>
        <g filter={u("rough")} fill={INK} className="font-brand">
          <text fontSize="9" letterSpacing="2" fontWeight="500">
            <textPath href={`#top-${id}`} startOffset="50%" textAnchor="middle">
              CONFIDENTIAL
            </textPath>
          </text>
          <text fontSize="8" letterSpacing="1.6" fontWeight="500">
            <textPath href={`#bottom-${id}`} startOffset="50%" textAnchor="middle">
              PROTECTED WORK
            </textPath>
          </text>
          <text x="9" y="63" textAnchor="middle" fontSize="7">★</text>
          <text x="111" y="63" textAnchor="middle" fontSize="7">★</text>
          <text x="61.5" y="67" textAnchor="middle" fontSize="20" letterSpacing="5" fontWeight="500" stroke={INK} strokeWidth="1.8">
            NDA
          </text>
          <text x="60" y="40" textAnchor="middle" fontSize="6.5" letterSpacing="3">★ ★ ★</text>
          <text x="60" y="86" textAnchor="middle" fontSize="6.5" letterSpacing="3">★ ★ ★</text>
        </g>
      </g>
    </svg>
  );
}
