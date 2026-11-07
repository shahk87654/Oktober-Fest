import "server-only";

interface ShopifyResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export class ShopifyRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShopifyRequestError";
  }
}

export function isShopifyConfigured(): boolean {
  return Boolean(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN);
}

export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  options: { cache?: RequestCache; revalidate?: number } = {},
): Promise<T> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!domain || !token) {
    throw new ShopifyRequestError(
      "Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN.",
    );
  }

  const version = process.env.SHOPIFY_API_VERSION || "2026-10";
  const response = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    ...(options.cache === "no-store"
      ? { cache: "no-store" as const }
      : { next: { revalidate: options.revalidate ?? 60 } }),
  });

  if (!response.ok) {
    throw new ShopifyRequestError(`Shopify Storefront API returned ${response.status}.`);
  }

  const result = (await response.json()) as ShopifyResponse<T>;
  if (result.errors?.length) {
    throw new ShopifyRequestError(result.errors.map((error) => error.message).join("; "));
  }
  if (!result.data) {
    throw new ShopifyRequestError("Shopify returned an empty response.");
  }

  return result.data;
}
