import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/seminar",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;