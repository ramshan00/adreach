import type { NextConfig } from "next";

const isStatic = process.env.NEXT_STATIC === "true";

if (isStatic && !process.env.NEXT_PUBLIC_API_URL?.trim()) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is required when NEXT_STATIC=true (Hostinger static build). " +
      "Set it to the Vercel API origin, e.g. https://adreach-psi.vercel.app",
  );
}

const nextConfig: NextConfig = {
  ...(isStatic ? { output: "export" as const } : {}),
  basePath: isStatic ? "/seminar" : "",
  trailingSlash: true,
  // Playwright and local tools often use 127.0.0.1 instead of localhost.
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    unoptimized: isStatic,
  },
};

export default nextConfig;
