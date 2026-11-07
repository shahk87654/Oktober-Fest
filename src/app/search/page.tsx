import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { searchProducts } from "@/lib/shopify/search";

export const metadata: Metadata = { title: "Search the collection" };
export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const term = typeof query.q === "string" ? query.q.trim() : "";
  const products = isShopifyConfigured() && term ? await searchProducts(term, 24) : [];
  return <main className="search-page">
    <div className="search-page-heading"><span className="eyebrow">THE ALPINE ATELIER COLLECTION</span><h1>Search the <em>edit.</em></h1>
      <form action="/search" className="search-page-form"><Search size={19} /><input type="search" name="q" defaultValue={term} placeholder="Search a piece, a detail, a feeling…" /><button type="submit">SEARCH <ArrowRight size={15} /></button></form>
      {term && <p className="muted">Showing results for “{term}”</p>}
    </div>
    {products.length ? <div className="section search-product-grid"><div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div></div> : <div className="search-empty"><span className="eyebrow">{term && isShopifyConfigured() ? "NO PIECES FOUND" : "A GOOD PLACE TO BEGIN"}</span><h2>{!isShopifyConfigured() ? "The collection is on its way." : term ? "No match, just yet." : "Try a little inspiration."}</h2><p>{!isShopifyConfigured() ? "Connect the live Shopify catalog to search available pieces." : term ? "Try another search or explore the full collection." : "Search for a piece, style or detail."}</p><Link href="/collections" className="text-link">EXPLORE THE COLLECTIONS <ArrowRight size={14} /></Link></div>}
  </main>;
}
