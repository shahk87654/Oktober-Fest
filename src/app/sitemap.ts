import type { MetadataRoute } from "next";
import { env, shopifyConfigured } from "@/lib/env";
import { getAllCollectionsForSitemap, getAllProductsForSitemap, getArticles } from "@/lib/shopify/storefront";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const pages = ["/", "/blogs/news", "/pages/about", "/pages/contact", "/pages/faqs", "/pages/materials", "/pages/size-guide"];
  const fixed: MetadataRoute.Sitemap = pages.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : .65,
  }));
  if (!shopifyConfigured) return fixed;
  const [collections, products, articles] = await Promise.all([
    getAllCollectionsForSitemap(),
    getAllProductsForSitemap(),
    getArticles("news", 100),
  ]);
  const collectionEntries: MetadataRoute.Sitemap = collections.map((collection) => ({
    url: `${base}/collections/${collection.handle}`, lastModified: new Date(), changeFrequency: "daily", priority: .8,
  }));
  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${base}/products/${product.handle}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: .75,
  }));
  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${base}/blogs/news/${article.handle}`, lastModified: new Date(article.publishedAt), changeFrequency: "monthly", priority: .6,
  }));
  return [...fixed, ...collectionEntries, ...productEntries, ...articleEntries];
}
