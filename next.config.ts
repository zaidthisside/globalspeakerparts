import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    minimumCacheTTL: 31536000, // 1 year cache for optimized images
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/api/media-proxy",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, s-maxage=31536000, immutable, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

