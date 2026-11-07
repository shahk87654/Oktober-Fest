import { shopifyFetch } from "./client";
import { COLLECTIONS_QUERY, COLLECTION_QUERY } from "./queries";
import type { ShopifyCollection, ShopifyCollectionSummary, ShopifyFilter, ShopifyProduct } from "./types";

export type CollectionSort =
  | "RELEVANCE"
  | "BEST_SELLING"
  | "TITLE"
  | "PRICE"
  | "CREATED"
  | "MANUAL";

interface CollectionResult {
  collection: ShopifyCollection | null;
}

interface CollectionsResult {
  collections: { nodes: ShopifyCollectionSummary[] };
}

export async function getCollection(
  handle: string,
  options: {
    first?: number;
    after?: string | null;
    sortKey?: CollectionSort;
    reverse?: boolean;
    filters?: Array<Record<string, unknown>>;
  } = {},
): Promise<ShopifyCollection | null> {
  const { collection } = await shopifyFetch<CollectionResult>(
    COLLECTION_QUERY,
    {
      handle,
      first: options.first ?? 12,
      after: options.after ?? null,
      sortKey: options.sortKey ?? "MANUAL",
      reverse: options.reverse ?? false,
      filters: options.filters ?? [],
    },
  );
  return collection;
}

export async function getCollections(first = 100): Promise<ShopifyCollectionSummary[]> {
  const { collections } = await shopifyFetch<CollectionsResult>(COLLECTIONS_QUERY, { first });
  return collections.nodes;
}

export function getCollectionFilters(products: ShopifyProduct[]): ShopifyFilter[] {
  const filters = new Map<string, Map<string, ShopifyFilter["values"][number]>>();

  function addFilter(label: string, value: string, input: Record<string, unknown>) {
    if (!filters.has(label)) filters.set(label, new Map());
    const values = filters.get(label)!;
    const id = JSON.stringify(input);
    if (!values.has(id)) values.set(id, { id, label: value, input: id });
  }

  for (const product of products) {
    addFilter("Availability", product.availableForSale ? "In stock" : "Sold out", {
      available: product.availableForSale,
    });
    if (product.productType) {
      addFilter("Product type", product.productType, { productType: product.productType });
    }
    for (const option of product.options) {
      for (const value of option.values) {
        addFilter(option.name, value, { variantOption: { name: option.name, value } });
      }
    }
  }

  return Array.from(filters, ([label, values]) => ({
    id: label,
    label,
    type: "LIST",
    values: Array.from(values.values()),
  }));
}
