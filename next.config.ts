import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mode standalone pour Docker (copie uniquement les fichiers nécessaires)
  output: "standalone",

  images: {
    // Domaines autorisés pour next/image
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",          // Miniatures YouTube
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",       // Miniatures YouTube alternative
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",  // Cloudflare R2
        pathname: "/**",
      },
    ],
  },

  // Optimisations de compilation
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Exclusion des modules Node.js côté serveur seulement
  serverExternalPackages: ["bcryptjs", "@prisma/client"],

  // Configuration des redirections
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/member/dashboard",
        permanent: true,
      },
    ];
  },

  // Headers de sécurité additionnels (complétés par le middleware)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
