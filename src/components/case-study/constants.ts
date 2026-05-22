// ─────────────────────────────────────────────────────────────────────────────
// Case Study — shared Tailwind class strings
// Typography scale: Scale B / Expressive (tokens.ts → tailwind.config.ts)
// ─────────────────────────────────────────────────────────────────────────────

export const H1_CLASS =
  "font-heading font-normal text-h1 md:text-h1-md lg:text-h1-lg text-heading";
export const H2_CLASS =
  "font-heading font-normal text-h2 md:text-h2-md lg:text-h2-lg text-heading";
export const H3_CLASS =
  "font-heading font-normal text-h3 md:text-h3-md lg:text-h3-lg text-heading";
export const H4_CLASS =
  "font-heading font-normal text-h4 md:text-h4-md lg:text-h4-lg text-heading";
export const LEAD_CLASS =
  "font-body font-normal text-lead md:text-lead-md lg:text-lead-lg text-muted";
export const BODY_CLASS =
  "font-body font-normal text-body md:text-body-md lg:text-body-lg text-muted";
export const EYEBROW_CLASS =
  "font-brand text-[13px] font-medium uppercase tracking-[1.5px] text-muted";

// Consistent section padding applied to every full-width case study section.
// bg-* is intentionally excluded — set it per-section.
export const SECTION_PAD =
  "px-[20px] py-[60px] md:px-[60px] md:py-[80px] lg:pl-[80px] lg:pr-[180px] lg:py-[80px]";
