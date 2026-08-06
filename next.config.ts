import type { NextConfig } from "next";

const isStatic = process.env.NEXT_STATIC !== "false";

const nextConfig: NextConfig = {
  ...(isStatic ? { output: "export" } : {}),
  basePath: "/seminar",
  trailingSlash: true,
  images: {
    unoptimized: isStatic,
  },
};

export default nextConfig;