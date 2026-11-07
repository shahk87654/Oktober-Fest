import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getCollections } from "@/lib/shopify/collections";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/collections`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
  ];
  if (!isShopifyConfigured()) return routes;
  const collections = await getCollections();
  return routes.concat(collections.map((collection) => ({
    url: `${siteUrl}/collections/${collection.handle}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  })));
}
