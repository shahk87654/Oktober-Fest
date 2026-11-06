import "server-only";
import { contextualFetch, storefrontFetch } from "@/lib/shopify/client";
import {
  ARTICLE_QUERY,
  ARTICLES_QUERY,
  ALL_COLLECTIONS_QUERY,
  ALL_PRODUCTS_QUERY,
  COLLECTION_QUERY,
  FEATURED_COLLECTIONS_QUERY,
  HOMEPAGE_QUERY,
  METAOBJECT_QUERY,
  METAOBJECTS_QUERY,
  PAGE_QUERY,
  PRODUCT_QUERY,
  RECOMMENDATIONS_QUERY,
  SHOP_BRAND_QUERY,
} from "@/lib/shopify/queries";
import type { Article, Collection, Product, ShopifyImage } from "@/lib/shopify/types";

type ProductResponse = { product: Product | null };
type CollectionResponse = { collection: Collection | null };
export type ShopifyPage = {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  seo: { title: string | null; description: string | null };
};
export type ShopifyShopBrand = {
  name: string;
  logo: ShopifyImage | null;
};
type SitemapNode = { id: string; handle: string; updatedAt: string };
type PagedSitemapResponse = {
  products?: { nodes: SitemapNode[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
  collections?: { nodes: SitemapNode[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
};

export function getProduct(handle: string, locale: { country?: string; language?: string } = {}) {
  return contextualFetch<ProductResponse, { handle: string }>(PRODUCT_QUERY, { handle }, {
    tags: [`product:${handle}`, "products"], revalidate: 300, ...locale,
  }).then((response) => response.product);
}

export async function getShopBrand() {
  const response = await storefrontFetch<{
    shop: { name: string; brand: { logo: { image: ShopifyImage | null } | null } | null };
  }, Record<string, never>>(SHOP_BRAND_QUERY, {}, { tags: ["shop"], revalidate: 3600 });
  return {
    name: response.shop.name,
    logo: response.shop.brand?.logo?.image ?? null,
  } satisfies ShopifyShopBrand;
}

export function getCollection(
  handle: string,
  params: {
    first?: number;
    after?: string | null;
    sortKey?: string;
    reverse?: boolean;
    filters?: Record<string, unknown>[];
    country?: string;
    language?: string;
  } = {},
) {
  const { country, language, ...queryOptions } = params;
  return contextualFetch<CollectionResponse, Record<string, unknown>>(
    COLLECTION_QUERY,
    {
      handle,
      first: queryOptions.first ?? 16,
      after: queryOptions.after ?? null,
      sortKey: queryOptions.sortKey ?? "BEST_SELLING",
      reverse: queryOptions.reverse ?? false,
      filters: queryOptions.filters ?? [],
    },
    { tags: [`collection:${handle}`, "collections"], revalidate: 300, country, language },
  ).then((response) => response.collection);
}

export async function getFeaturedCollections(first = 8) {
  const response = await storefrontFetch<{ collections: { nodes: Collection[] } }, { first: number }>(
    FEATURED_COLLECTIONS_QUERY, { first }, { tags: ["collections"], revalidate: 600 },
  );
  return response.collections.nodes;
}

export async function getHomepageCollections(first = 8) {
  const response = await storefrontFetch<{ collections: { nodes: Collection[] } }, { first: number }>(
    HOMEPAGE_QUERY, { first }, { tags: ["collections", "products"], revalidate: 600 },
  );
  return response.collections.nodes;
}

async function getAllSitemapNodes(kind: "products" | "collections") {
  const query = kind === "products" ? ALL_PRODUCTS_QUERY : ALL_COLLECTIONS_QUERY;
  const all: SitemapNode[] = [];
  let after: string | null = null;
  let pages = 0;
  do {
    const response: PagedSitemapResponse = await storefrontFetch<PagedSitemapResponse, { first: number; after: string | null }>(
      query, { first: 250, after }, { tags: [kind], revalidate: 3600 },
    );
    const connection: PagedSitemapResponse["products"] | PagedSitemapResponse["collections"] = response[kind];
    if (!connection) throw new Error(`Shopify did not return ${kind} while generating the sitemap.`);
    all.push(...connection.nodes);
    after = connection.pageInfo.endCursor;
    pages += 1;
    if (connection.pageInfo.hasNextPage && !after) throw new Error(`Shopify returned no cursor for the next ${kind} page.`);
    if (pages >= 100 && connection.pageInfo.hasNextPage) throw new Error(`Sitemap pagination exceeded 100 pages for ${kind}.`);
    if (!connection.pageInfo.hasNextPage) break;
  } while (true);
  return all;
}

export const getAllProductsForSitemap = () => getAllSitemapNodes("products");
export const getAllCollectionsForSitemap = () => getAllSitemapNodes("collections");

export async function getRecommendations(productId: string) {
  const response = await storefrontFetch<{ productRecommendations: Product[] }, { productId: string }>(
    RECOMMENDATIONS_QUERY, { productId }, { tags: ["products"], revalidate: 600 },
  );
  return response.productRecommendations;
}

export async function getArticle(blog: string, handle: string) {
  const response = await storefrontFetch<{ blog: { articleByHandle: Article | null } | null }, { blog: string; handle: string }>(
    ARTICLE_QUERY, { blog, handle }, { tags: [`article:${handle}`, "articles"], revalidate: 600 },
  );
  return response.blog?.articleByHandle ?? null;
}

export async function getArticles(blog = "news", first = 12) {
  const response = await storefrontFetch<{ blog: { articles: { nodes: Article[] } } | null }, { blog: string; first: number }>(
    ARTICLES_QUERY, { blog, first }, { tags: ["articles"], revalidate: 600 },
  );
  return response.blog?.articles.nodes ?? [];
}

export async function getPage(handle: string) {
  const response = await storefrontFetch<{ pageByHandle: ShopifyPage | null }, { handle: string }>(
    PAGE_QUERY, { handle }, { tags: [`page:${handle}`], revalidate: 900 },
  );
  return response.pageByHandle;
}

export async function getMetaobject<TFields extends Record<string, string>>(
  type: string,
  handle: string,
) {
  const response = await storefrontFetch<{
    metaobject: { id: string; type: string; handle: string; fields: { key: string; value: string | null }[] } | null;
  }, { type: string; handle: string }>(METAOBJECT_QUERY, { type, handle }, {
    tags: [`metaobject:${type}:${handle}`], revalidate: 900,
  });
  const object = response.metaobject;
  if (!object) return null;
  return object.fields.reduce((result, field) => {
    if (field.value !== null) Object.assign(result, { [field.key]: field.value });
    return result;
  }, { id: object.id } as TFields & { id: string });
}

export async function getMetaobjects<TFields extends Record<string, string>>(
  type: string,
  first = 20,
) {
  const response = await storefrontFetch<{
    metaobjects: { nodes: { id: string; type: string; handle: string; fields: { key: string; value: string | null }[] }[] };
  }, { type: string; first: number }>(METAOBJECTS_QUERY, { type, first }, {
    tags: [`metaobjects:${type}`, "metaobjects"], revalidate: 900,
  });
  return response.metaobjects.nodes.map((object) =>
    object.fields.reduce((result, field) => {
      if (field.value !== null) Object.assign(result, { [field.key]: field.value });
      return result;
    }, { id: object.id, handle: object.handle } as TFields & { id: string; handle: string }),
  );
}
