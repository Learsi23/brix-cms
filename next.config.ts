import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Local images (/images/, /uploads/) are optimized by default.
    // Add remote hostnames here only when you serve images from an external CDN.
    localPatterns: [
      { pathname: '/uploads/**' },
      { pathname: '/images/**' },
      { pathname: '/**' }, // Permite cualquier imagen en la raíz de /public
    ],
    remotePatterns: [],
  },
};

export default nextConfig;