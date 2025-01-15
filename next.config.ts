import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Enables static export
  basePath: '/emojis' // github repo name
};

export default nextConfig;
