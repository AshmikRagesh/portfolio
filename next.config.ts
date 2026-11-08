import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Curiosity Pass was retired; old and shared pass links land on the home page
  async redirects() {
    return [
      { source: "/pass", destination: "/", permanent: false },
      { source: "/pass/:code", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
