import type { NextConfig } from "next";

// Safe for the YouTube embeds, Google fonts and ESPN/GitHub images: none of these
// limit what the page loads, only who may frame it and what the browser guesses.
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // The Curiosity Pass was retired; old and shared pass links land on the home page
  async redirects() {
    return [
      { source: "/pass", destination: "/", permanent: false },
      { source: "/pass/:code", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
