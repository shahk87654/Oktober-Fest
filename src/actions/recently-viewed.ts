"use server";

import { getProductsByHandles } from "@/lib/shopify/products";

export async function getRecentlyViewedProducts(handles: string[]) {
  const validHandles = Array.from(new Set(handles))
    .filter((handle) => /^[a-zA-Z0-9][a-zA-Z0-9-]{0,254}$/.test(handle))
    .slice(0, 5);
  return getProductsByHandles(validHandles);
}
