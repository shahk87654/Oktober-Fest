import { shopifyFetch } from "./client";
import { PRODUCT_RECOMMENDATIONS_QUERY } from "./queries";
import type { ShopifyProduct } from "./types";

interface RecommendationsResult {
  productRecommendations: ShopifyProduct[] | null;
}

export async function getProductRecommendations(productId: string): Promise<ShopifyProduct[]> {
  const { productRecommendations } = await shopifyFetch<RecommendationsResult>(
    PRODUCT_RECOMMENDATIONS_QUERY,
    { productId },
  );
  return productRecommendations ?? [];
}
