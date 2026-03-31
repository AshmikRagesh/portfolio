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
        primary: tokens.colors.primary,
        secondary: tokens.colors.secondary,
        background: tokens.colors.background,
        "text-base": tokens.colors.text,
        heading: tokens.colors.heading,
        muted: tokens.colors.muted,
        accent: tokens.colors.accent,
      },
      fontFamily: {
        brand: [...tokens.fontFamily.brand],
        body: [...tokens.fontFamily.body],
        heading: [...tokens.fontFamily.heading],
        ui: [...tokens.fontFamily.ui],
      },
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
