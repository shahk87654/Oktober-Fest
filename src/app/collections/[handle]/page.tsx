import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
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
  if (!isShopifyConfigured()) return <main className="store-setup"><span className="eyebrow">LIVE FROM THE ATELIER</span><h1>A collection<br /><em>in the making.</em></h1><p>Connect Shopify to bring this collection, its pieces and current availability into the storefront.</p></main>;

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

  return <main className="collection-page">
    <div className="collection-breadcrumb"><Link href="/">HOME</Link><span>/</span><Link href="/collections">COLLECTIONS</Link><span>/</span><span>{collection.title.toUpperCase()}</span></div>
    <header className="collection-hero">
      <div className="collection-title-block">
        <span className="eyebrow">{knownCollection ? "THE ALPINE ATELIER EDIT" : "THE COLLECTION"}</span>
        <h1>{collection.title}<em>.</em></h1>
        <p>{collection.description || "A considered selection from the Alpine Atelier."}</p>
        <span className="collection-hero-index">COLLECTION / {collection.handle.toUpperCase()}</span>
      </div>
      {collection.image && <div className="collection-hero-image"><Image src={imageUrl(collection.image.url, 1500)} alt={collection.image.altText ?? collection.title} fill priority sizes="(max-width: 700px) 100vw, 60vw" /></div>}
    </header>
    <div className="collection-content">
      <div className="collection-results-bar">
        <div className="collection-count"><span className="collection-result-number">{String(count).padStart(2, "0")}{collection.products.pageInfo?.hasNextPage ? "+" : ""}</span><span>{count === 1 ? "PIECE" : "PIECES"} <i /> {collection.products.pageInfo?.hasNextPage ? "FIRST EDIT" : "IN THIS EDIT"}</span></div>
        <CollectionControls filters={availableFilters} activeFilters={rawFilters} sort={sort} />
      </div>
      {collection.products.nodes.length ? <div className="collection-layout">
        <aside className="collection-sidebar"><span className="eyebrow">REFINE YOUR EDIT</span><CollectionControls filters={availableFilters} activeFilters={rawFilters} sort={sort} /></aside>
        <div className="collection-results">
          <div className="product-grid">{collection.products.nodes.map((product) => <ProductCard key={product.id} product={product} />)}</div>
          {collection.products.pageInfo?.hasNextPage && <div className="collection-pagination"><span>SHOWING {count} PIECES</span><Link className="button button-outline" href={`${canonicalPath}?${nextParams.toString()}`}>LOAD MORE PIECES <ArrowRight size={15} /></Link></div>}
        </div>
      </div> : <div className="collection-empty"><span className="eyebrow">NOTHING HERE JUST YET</span><h2>This edit is <em>between seasons.</em></h2><Link href="/collections" className="text-link">EXPLORE OTHER COLLECTIONS <ArrowRight size={14} /></Link></div>}
    </div>
  </main>;
}
