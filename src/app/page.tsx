import { HomePage } from "@/components/homepage";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getCollection } from "@/lib/shopify/collections";
import { getArticles } from "@/lib/shopify/blog";
import { collectionHandles, journalBlogHandle } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function Page() {
  if (!isShopifyConfigured()) return <HomePage men={null} women={null} kids={null} featured={null} accessories={null} articles={[]} />;
  const [men, women, kids, featured, accessories, articles] = await Promise.all([
    getCollection(collectionHandles.men, { first: 4 }),
    getCollection(collectionHandles.women, { first: 4 }),
    getCollection(collectionHandles.kids, { first: 1 }),
    getCollection(collectionHandles.featured, { first: 4 }),
    getCollection(collectionHandles.accessories, { first: 2 }),
    getArticles(journalBlogHandle).catch((error: unknown) => {
      console.error("Unable to load Shopify journal articles.", error);
      return [];
    }),
  ]);
  return <HomePage men={men} women={women} kids={kids} featured={featured} accessories={accessories} articles={articles} />;
}
