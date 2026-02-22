import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static export — no Node.js server at runtime.
  // Vercel serves this as a CDN-cached static site with zero serverless cost.
  output: "export",
  trailingSlash: true,
  images: {
    // Static export cannot use Next.js Image Optimization
    unoptimized: true,
  },
};

export default nextConfig;
