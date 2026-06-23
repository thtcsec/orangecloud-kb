import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@kb/shared"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
