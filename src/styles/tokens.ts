export const tokens = {
  colors: {
    primary:      "#1e0525",  // Midnight — dark hero/footer bg
    blackcurrant: "#32073e",  // CTA buttons, dark card bg
    grape:        "#9D136A",  // Interactive accent, hover states
    secondary:    "#524555",  // Secondary body text
    background:   "#FFFFFF",  // Page background
    text:         "#1e0525",  // Primary text
    heading:      "#1e0525",  // Headings H1–H6
    muted:        "#8e8292",  // Labels, captions, tags
    accent:       "#9D136A",  // Grape — links, interactive
    lilac:        "#d0b8ff",  // Light purple accents
    pink:         "#f8c2f7",  // Soft bg tints, gradients
    vanilla:      "#ece5d8",  // Warm off-white surface
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
