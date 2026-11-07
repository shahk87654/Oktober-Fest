import { shopifyFetch } from "./client";
import { SEARCH_QUERY } from "./queries";
import type { ShopifyProduct } from "./types";

interface SearchResult {
  search: { nodes: ShopifyProduct[] };
}

export async function searchProducts(query: string, first = 12): Promise<ShopifyProduct[]> {
  const value = query.trim();
  if (!value) return [];
  const { search } = await shopifyFetch<SearchResult>(SEARCH_QUERY, {
    query: value,
    first: Math.min(first, 50),
  });
  return search.nodes;
}
