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
        // Brand
        primary:       tokens.colors.primary,
        midnight:      tokens.colors.midnight,
        grape:         tokens.colors.grape,
        "grape-light": tokens.colors["grape-light"],
        // Text
        "text-base":   tokens.colors.text,
        heading:       tokens.colors.heading,
        secondary:     tokens.colors.secondary,
        muted:         tokens.colors.muted,
        // Surfaces
        background:    tokens.colors.background,
        surface:       tokens.colors.surface,
        placeholder:   tokens.colors.placeholder,
        vanilla:       tokens.colors.vanilla,
        // Lines
        "line-soft":   tokens.colors["line-soft"],
        line:          tokens.colors.line,
        // Soft accents
        pink:          tokens.colors.pink,
        // Status
        success:       tokens.colors.success,
        "success-bg":  tokens.colors["success-bg"],
        warning:       tokens.colors.warning,
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
