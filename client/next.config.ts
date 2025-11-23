import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    // Ensure Turbopack treats this 'client' folder as the workspace root
    // to avoid warnings about multiple lockfiles in parent directories.
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  /* config options here */
};

export default nextConfig;
