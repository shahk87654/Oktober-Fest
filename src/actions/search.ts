"use server";

import { searchProducts } from "@/lib/shopify/search";

export async function searchProductsAction(query: string) {
  if (query.trim().length < 2) return [];
  return searchProducts(query, 5);
}
