import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { CollectionControls } from "@/components/collection-controls";
import { ProductCard } from "@/components/product-card";
import { collectionHandles } from "@/lib/config";
import { imageUrl } from "@/lib/format";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getCollection, getCollectionFilters, type CollectionSort } from "@/lib/shopify/collections";

type SearchParams = Record<string, string | string[] | undefined>;
type SortOption = { sortKey: CollectionSort; reverse: boolean };
const sorts: Record<string, SortOption> = {
  featured: { sortKey: "MANUAL", reverse: false },
  "best-selling": { sortKey: "BEST_SELLING", reverse: false },
  "title-ascending": { sortKey: "TITLE", reverse: false },
  "title-descending": { sortKey: "TITLE", reverse: true },
  "price-ascending": { sortKey: "PRICE", reverse: false },
  "price-descending": { sortKey: "PRICE", reverse: true },
  "created-descending": { sortKey: "CREATED", reverse: true },
};

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  if (!isShopifyConfigured()) return { title: "Collection" };
  const collection = await getCollection(handle, { first: 1 });
  if (!collection) return { title: "Collection not found" };
  return {
    title: collection.seo.title || collection.title,
    description: collection.seo.description || collection.description,
    alternates: { canonical: `/collections/${collection.handle}` },
    openGraph: { images: collection.image ? [collection.image.url] : undefined },
  };
}

export const dynamic = "force-dynamic";

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ handle }, query] = await Promise.all([params, searchParams]);
  if (!isShopifyConfigured()) {
    return (
      <main className="store-setup flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <span className="eyebrow">
          <i /> LIVE FROM THE ATELIER
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium mt-3 mb-2 text-slate-900">
          A collection <em>in the making.</em>
        </h1>
        <p className="text-slate-500 max-w-md">
          Connect your Shopify catalog to browse this collection, pieces, and current availability.
        </p>
      </main>
    );
  }

  const sort = typeof query.sort === "string" && sorts[query.sort] ? query.sort : "featured";
  const after = typeof query.after === "string" ? query.after : null;
  const rawFilters = Array.isArray(query.filter) ? query.filter : typeof query.filter === "string" ? [query.filter] : [];
  const filters = rawFilters.flatMap((raw) => {
    try {
      const value: unknown = JSON.parse(raw);
      return typeof value === "object" && value !== null && !Array.isArray(value) ? [value as Record<string, unknown>] : [];
    } catch {
      return [];
    }
  });
  const collection = await getCollection(handle, { first: 16, after, sortKey: sorts[sort].sortKey, reverse: sorts[sort].reverse, filters });
  if (!collection) notFound();

  const count = collection.products.nodes.length;
  const availableFilters = getCollectionFilters(collection.products.nodes);
  const configuredHandles = Object.values(collectionHandles);
  const knownCollection = configuredHandles.includes(collection.handle);
  const canonicalPath = `/collections/${collection.handle}`;
  const nextParams = new URLSearchParams();
  nextParams.set("sort", sort);
  for (const raw of rawFilters) nextParams.append("filter", raw);
  if (collection.products.pageInfo?.endCursor) nextParams.set("after", collection.products.pageInfo.endCursor);

  return (
    <main className="collection-page">
      <div className="collection-breadcrumb">
        <Link href="/" className="hover:text-emerald-800">Home</Link>
        <span>/</span>
        <Link href="/collections" className="hover:text-emerald-800">Collections</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">{collection.title}</span>
      </div>

      <header className="collection-hero">
        <div className="collection-title-block">
          <span className="eyebrow">
            <i /> {knownCollection ? "OKTOBERFEST 2026 EDIT" : "ATELIER SELECTION"}
          </span>
          <h1>{collection.title}<em>.</em></h1>
          <p>{collection.description || "A considered selection of handcrafted Bavarian styles."}</p>
          <span className="collection-hero-index">
            {count} {count === 1 ? "PIECE AVAILABLE" : "PIECES AVAILABLE"}
          </span>
        </div>
        {collection.image && (
          <div className="collection-hero-image">
            <Image
              src={imageUrl(collection.image.url, 1500)}
              alt={collection.image.altText ?? collection.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          </div>
        )}
      </header>

      <div className="collection-content">
        <div className="collection-results-bar">
          <div className="collection-count">
            <span className="collection-result-number">
              {String(count).padStart(2, "0")}{collection.products.pageInfo?.hasNextPage ? "+" : ""}
            </span>
            <span className="text-slate-500 font-semibold text-xs tracking-wider">
              {count === 1 ? "PIECE" : "PIECES"} IN THIS EDIT
            </span>
          </div>
          <CollectionControls filters={availableFilters} activeFilters={rawFilters} sort={sort} />
        </div>

        {collection.products.nodes.length ? (
          <div className="collection-results">
            <div className="product-grid">
              {collection.products.nodes.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {collection.products.pageInfo?.hasNextPage && (
              <div className="collection-pagination">
                <span className="text-xs text-slate-500 font-semibold">SHOWING {count} PIECES</span>
                <Link className="button button-outline" href={`${canonicalPath}?${nextParams.toString()}`}>
                  <span>LOAD MORE PIECES</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="collection-empty text-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Sparkles size={28} />
            </div>
            <span className="eyebrow">
              <i /> ARCHIVE EDIT
            </span>
            <h2 className="font-serif text-3xl font-medium mt-2 mb-3">
              This edit is <em>between seasons.</em>
            </h2>
            <Link href="/collections" className="button button-dark inline-flex items-center gap-2">
              <span>EXPLORE ALL COLLECTIONS</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
