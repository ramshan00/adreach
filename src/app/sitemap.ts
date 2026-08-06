import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://adreach.agency/seminar";

  return [
    {
      url: `${baseUrl}/`,
      lastModified: "2026-08-06",
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}