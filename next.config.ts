import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  ...(isStaticExport && { output: "export" }),
  basePath: "/seminar",
  trailingSlash: true,
  images: {
    unoptimized: isStaticExport,
  },
};

export default nextConfig;