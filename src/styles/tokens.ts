export const tokens = {
  colors: {
    primary:      "#1e0525",  // Midnight — dark hero/footer bg
    blackcurrant: "#32073e",  // CTA buttons, dark card bg
    grape:        "#895be7",  // Interactive accent, hover states
    secondary:    "#6E1687",  // Secondary body text
    background:   "#FFFFFF",  // Page background
    text:         "#1e0525",  // Primary text
    heading:      "#1e0525",  // Headings H1–H6
    muted:        "#8e8292",  // Labels, captions, tags
    accent:       "#895be7",  // Grape — links, interactive
    lilac:        "#d0b8ff",  // Light purple accents
    pink:         "#f8c2f7",  // Soft bg tints, gradients
    vanilla:      "#ece5d8",  // Warm off-white surface
  },
  fontFamily: {
    // Geist Mono — nav links, CTA (loaded via next/font/google)
    brand: ["var(--font-brand)", "monospace"],
    // Geist Sans — body / subtext (loaded via next/font/google)
    body: ["var(--font-body)", "sans-serif"],
    // GT Alpina Trial — headings (loaded via @font-face in globals.css)
    // Add font files to public/fonts/: GTAlpinaTrial-Regular.woff2 + GTAlpinaTrial-RegularItalic.woff2
    heading: ["GT Alpina Trial", "serif"],
    // Inter — card titles, buttons (loaded via next/font/google)
    ui: ["var(--font-ui)", "sans-serif"],
  },
  borderRadius: {
    sm: "4px",
    md: "7px",
    lg: "12px",
  },
} as const;
