export const tokens = {
  colors: {
    primary: "#000000",
    secondary: "#666666",
    background: "#FFFFFF",
    text: "#000000",
    heading: "#091624",
    muted: "#717379",
  },
  fontFamily: {
    // Geist Mono — nav links, CTA (loaded via next/font/google)
    brand: ["var(--font-brand)", "monospace"],
    // Geist Sans — body / subtext (loaded via next/font/google)
    body: ["var(--font-body)", "sans-serif"],
    // GT Alpina Trial — headings (loaded via @font-face in globals.css)
    // Add font files to public/fonts/: GTAlpinaTrial-Regular.woff2 + GTAlpinaTrial-RegularItalic.woff2
    heading: ["GT Alpina Trial", "serif"],
  },
  borderRadius: {
    sm: "4px",
    md: "7px",
    lg: "12px",
  },
} as const;
