import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export const dynamic = "force-static";

function siteBase(): string {
  return SITE_URL.replace(/\/+$/, "");
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteBase();

  return [
    {
      url: `${baseUrl}/`,
      lastModified: "2026-08-06",
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
