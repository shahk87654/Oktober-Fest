import { shopifyFetch } from "./client";
import { PRODUCT_QUERY, PRODUCT_VARIANTS_QUERY, RECENT_PRODUCTS_QUERY } from "./queries";
import type { ShopifyProduct } from "./types";

interface ProductResult {
  product: ShopifyProduct | null;
}

interface RecentProductsResult {
  products: { nodes: ShopifyProduct[] };
}

export async function getProductsByHandles(handles: string[]): Promise<ShopifyProduct[]> {
  const uniqueHandles = Array.from(new Set(handles)).slice(0, 5);
  if (uniqueHandles.length === 0) return [];

  const query = uniqueHandles.map((handle) => `handle:${handle}`).join(" OR ");
  const { products } = await shopifyFetch<RecentProductsResult>(RECENT_PRODUCTS_QUERY, {
    first: uniqueHandles.length,
    query,
  });
  const byHandle = new Map(products.nodes.map((product) => [product.handle, product]));
  return uniqueHandles.flatMap((handle) => {
    const product = byHandle.get(handle);
    return product ? [product] : [];
  });
}

export async function getProduct(handle: string): Promise<ShopifyProduct | null> {
  const { product } = await shopifyFetch<ProductResult>(PRODUCT_QUERY, { handle });
  if (!product) return null;

  const variants = [...product.variants.nodes];
  let pageInfo = product.variants.pageInfo;
  while (pageInfo?.hasNextPage && pageInfo.endCursor) {
    const cursor = pageInfo.endCursor;
    const page = await shopifyFetch<{
      product: { variants: ShopifyProduct["variants"] } | null;
    }>(PRODUCT_VARIANTS_QUERY, { id: product.id, after: cursor });
    if (!page.product) break;
    if (!page.product.variants.nodes.length || page.product.variants.pageInfo?.endCursor === cursor) {
      throw new Error(`Shopify returned an incomplete variant page for product ${product.handle}.`);
    }
    variants.push(...page.product.variants.nodes);
    pageInfo = page.product.variants.pageInfo;
  }
  product.variants = { nodes: variants, pageInfo };
  return product;
}
