import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export const dynamic = "force-static";

function siteBase(): string {
  return SITE_URL.replace(/\/+$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteBase();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
