import type { Config } from "tailwindcss";
import { tokens } from "./src/styles/tokens";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:      tokens.colors.primary,
        blackcurrant: tokens.colors.blackcurrant,
        grape:        tokens.colors.grape,
        secondary:    tokens.colors.secondary,
        background:   tokens.colors.background,
        "text-base":  tokens.colors.text,
        heading:      tokens.colors.heading,
        muted:        tokens.colors.muted,
        accent:       tokens.colors.accent,
        lilac:        tokens.colors.lilac,
        pink:         tokens.colors.pink,
        vanilla:      tokens.colors.vanilla,
      },
      fontFamily: {
        brand: [...tokens.fontFamily.brand],
        body: [...tokens.fontFamily.body],
        heading: [...tokens.fontFamily.heading],
        handwriting: ["var(--font-handwriting)", "cursive"],
      },
      // Cast: tokens.fontSize is `as const` (readonly), Tailwind expects mutable.
      fontSize: tokens.fontSize as unknown as Record<
        string,
        [string, { lineHeight: string; letterSpacing?: string }]
      >,
      borderRadius: {
        sm: tokens.borderRadius.sm,
        md: tokens.borderRadius.md,
        lg: tokens.borderRadius.lg,
      },
    },
  },
  plugins: [],
};
export default config;
