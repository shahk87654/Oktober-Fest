import "server-only";
import { env, shopifyConfigured } from "@/lib/env";

type GraphQLError = { message: string; extensions?: Record<string, unknown> };
type GraphQLResponse<T> = { data?: T; errors?: GraphQLError[] };

export class ShopifyRequestError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "ShopifyRequestError";
  }
}

export async function storefrontFetch<TData, TVariables extends Record<string, unknown>>(
  query: string,
  variables: TVariables,
  options: { tags?: string[]; revalidate?: number; country?: string; language?: string } = {},
): Promise<TData> {
  if (!shopifyConfigured || !env.SHOPIFY_STORE_DOMAIN || !env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    throw new ShopifyRequestError("Shopify is not configured. Add the Storefront API credentials to the server environment.");
  }

  const endpoint = `https://${env.SHOPIFY_STORE_DOMAIN}/api/${env.SHOPIFY_API_VERSION}/graphql.json`;
  const inContext = Boolean(options.country || options.language);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({
      query: inContext ? withInContext(query) : query,
      variables: inContext
        ? { ...variables, country: options.country, language: options.language }
        : variables,
    }),
    ...(options.tags?.length || options.revalidate !== undefined
      ? { next: { tags: options.tags ?? [], revalidate: options.revalidate ?? 300 } }
      : { cache: "no-store" as const }),
  });

  if (!response.ok) {
    throw new ShopifyRequestError(`Shopify Storefront API returned HTTP ${response.status}.`, response.status);
  }
  const result = (await response.json()) as GraphQLResponse<TData>;
  if (result.errors?.length) {
    throw new ShopifyRequestError(result.errors.map((error) => error.message).join("; "));
  }
  if (!result.data) {
    throw new ShopifyRequestError("Shopify returned an empty GraphQL response.");
  }
  return result.data;
}

export function withInContext(query: string): string {
  return query.replace(
    /^(query|mutation)\s+([A-Za-z0-9_]+)?\s*(\((?:[^()]|\([^()]*\))*\))?\s*\{/,
    (_match, kind: string, operation: string | undefined, args: string | undefined) => {
      const definitions = args?.slice(1, -1).trim();
      const contextDefinitions = [
        definitions,
        "$country: CountryCode",
        "$language: LanguageCode",
      ].filter(Boolean).join(", ");
      return `${kind} ${operation ?? ""}(${contextDefinitions}) @inContext(country: $country, language: $language) {`;
    },
  );
}

export async function contextualFetch<TData, TVariables extends Record<string, unknown>>(
  query: string,
  variables: TVariables,
  options: { tags?: string[]; revalidate?: number; country?: string; language?: string } = {},
): Promise<TData> {
  return storefrontFetch<TData, TVariables>(query, variables, {
    country: options.country ?? "US",
    language: options.language ?? "EN",
    ...options,
  });
}
