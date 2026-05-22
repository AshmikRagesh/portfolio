export const tokens = {
  colors: {
    // ── Brand ─────────────────────────────────────────────────────────
    primary:        "#32073e",  // Blackcurrant — CTAs, badges, tags, shipped pill
    midnight:       "#1e0525",  // Deep dark — footer, reel hero, modal bg
    grape:          "#9D136A",  // Interactive accent, hover, handwritten tags
    "grape-light":  "#F9E4FF",  // Soft purple — light accents, active nav (was lilac)

    // ── Text ──────────────────────────────────────────────────────────
    text:           "#1e0525",  // Primary body text
    heading:        "#1e0525",  // Headings H1–H6
    secondary:      "#524555",  // Secondary body text
    muted:          "#8e8292",  // Labels, captions, eyebrows

    // ── Surfaces ──────────────────────────────────────────────────────
    background:     "#FFFFFF",  // Page background
    surface:        "#f8f9fa",  // Light cards, sidebar bg
    placeholder:    "#f0f0f0",  // Image placeholder bg
    vanilla:        "#ece5d8",  // Warm alternative surface

    // ── Lines / borders ───────────────────────────────────────────────
    "line-soft":    "#edf0f3",  // Subtle dividers
    line:           "#c8ccd4",  // Image borders, stronger dividers

    // ── Soft accents ──────────────────────────────────────────────────
    pink:           "#f8c2f7",  // Soft pink tints

    // ── Status ────────────────────────────────────────────────────────
    success:        "#0E9A49",  // Positive — pros, trend arrows
    "success-bg":   "#e7f8f2",  // Light success bg (Impact metric cards)
    warning:        "#c5444a",  // Negative — cons, alerts
  },
  fontFamily: {
    // Geist Mono — nav links, CTA chips (loaded via next/font/google in layout.tsx)
    brand: ["var(--font-brand)", "monospace"],
    // Roboto Slab — body / lead / captions (loaded via next/font/google in layout.tsx)
    // Slab serif chosen for screen readability + harmonises with GT Alpina headings.
    // Fallback: sans-serif (Roboto Slab's proportions are closer to a sans than to Times-like serifs).
    body: ["var(--font-body)", "sans-serif"],
    // GT Alpina Trial — display headings (loaded via @font-face in globals.css)
    // Local font files in public/fonts/: GT-Alpina-Standard-{Regular,Medium,Regular-Italic}-Trial.otf
    heading: ["GT Alpina Trial", "serif"],
    // Nanum Pen Script — handwritten decorative tags (loaded via next/font/google in layout.tsx)
    // Exposed under tailwind.config.ts as `font-handwriting`.
  },
  borderRadius: {
    sm: "4px",
    md: "7px",
    lg: "12px",
  },
  // Typography scale — Scale B (Expressive, modular ratio ~1.333)
  // Each role has mobile / -md (≥768px) / -lg (≥1024px) variants.
  // Tuple shape: [size, { lineHeight, letterSpacing? }] — Tailwind fontSize format.
  fontSize: {
    // Headings
    h1:        ["32px", { lineHeight: "1.1",  letterSpacing: "-1.6px" }],
    "h1-md":   ["40px", { lineHeight: "1.1",  letterSpacing: "-2px"   }],
    "h1-lg":   ["44px", { lineHeight: "1.1",  letterSpacing: "-2.2px" }],

    h2:        ["24px", { lineHeight: "1.15", letterSpacing: "-1.2px" }],
    "h2-md":   ["32px", { lineHeight: "1.15", letterSpacing: "-1.6px" }],
    "h2-lg":   ["32px", { lineHeight: "1.15", letterSpacing: "-1.6px" }],

    h3:        ["18px", { lineHeight: "1.25", letterSpacing: "-0.7px" }],
    "h3-md":   ["22px", { lineHeight: "1.25", letterSpacing: "-0.9px" }],
    "h3-lg":   ["24px", { lineHeight: "1.25", letterSpacing: "-1px"   }],

    h4:        ["18px", { lineHeight: "1.3",  letterSpacing: "-0.5px" }],
    "h4-md":   ["20px", { lineHeight: "1.3",  letterSpacing: "-0.5px" }],
    "h4-lg":   ["22px", { lineHeight: "1.3",  letterSpacing: "-0.6px" }],

    // Body — lead paragraphs (intro under headings)
    lead:      ["16px", { lineHeight: "1.55" }],
    "lead-md": ["18px", { lineHeight: "1.55" }],
    "lead-lg": ["18px", { lineHeight: "1.55" }],

    // Body — secondary / card content
    body:      ["14px", { lineHeight: "1.5"  }],
    "body-md": ["15px", { lineHeight: "1.5"  }],
    "body-lg": ["16px", { lineHeight: "1.5"  }],

    // Captions, status labels
    caption:      ["12px", { lineHeight: "1.4", letterSpacing: "0.5px" }],
    "caption-md": ["13px", { lineHeight: "1.4", letterSpacing: "0.5px" }],
    "caption-lg": ["14px", { lineHeight: "1.4", letterSpacing: "0.5px" }],

    // Display number (metric stats)
    stat:      ["48px", { lineHeight: "1", letterSpacing: "-2.4px" }],
    "stat-md": ["56px", { lineHeight: "1", letterSpacing: "-2.8px" }],
    "stat-lg": ["56px", { lineHeight: "1", letterSpacing: "-2.8px" }],
  },
} as const;
