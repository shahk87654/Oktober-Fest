import "server-only";
import { storefrontFetch } from "@/lib/shopify/client";
import { PREDICTIVE_SEARCH_QUERY } from "@/lib/shopify/queries";
import type { ShopifyImage } from "@/lib/shopify/types";

type SearchProduct = { id: string; title: string; handle: string; featuredImage: ShopifyImage | null };
type PredictiveResponse = {
  predictiveSearch: {
    products: SearchProduct[];
    collections: { id: string; title: string; handle: string }[];
    articles: { id: string; title: string; handle: string }[];
  };
};

export async function predictiveSearch(query: string) {
  const normalized = query.trim().slice(0, 100);
  if (!normalized) return { products: [], collections: [], articles: [] };
  const response = await storefrontFetch<PredictiveResponse, { query: string; first: number }>(
    PREDICTIVE_SEARCH_QUERY, { query: normalized, first: 6 }, { tags: ["search"], revalidate: 60 },
  );
  return response.predictiveSearch;
}
