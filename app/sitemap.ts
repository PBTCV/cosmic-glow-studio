import type { MetadataRoute } from "next";
import { getSql } from "@/lib/neon.server";
import { getSiteUrl } from "@/lib/site";
import { getPostSlugs } from "@/sanity/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/insights`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
  ];

  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getPostSlugs();
    postRoutes = slugs.map((slug) => ({
      url: `${base}/insights/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    postRoutes = [];
  }

  let astrologerRoutes: MetadataRoute.Sitemap = [];
  try {
    const sql = getSql();
    const rows = (await sql`
      select slug, updated_at from astrologers where is_active = true
    `) as Array<{ slug: string; updated_at: string | null }>;
    astrologerRoutes = rows.map((row) => ({
      url: `${base}/astrologer/${row.slug}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));
  } catch {
    astrologerRoutes = [];
  }

  return [...staticRoutes, ...postRoutes, ...astrologerRoutes];
}
