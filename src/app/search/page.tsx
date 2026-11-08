import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { searchProducts } from "@/lib/shopify/search";

export const metadata: Metadata = { title: "Search the Collection" };
export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const term = typeof query.q === "string" ? query.q.trim() : "";
  const products = isShopifyConfigured() && term ? await searchProducts(term, 24) : [];

  return (
    <main className="search-page max-w-7xl mx-auto px-6 py-12">
      <div className="search-page-heading text-center max-w-2xl mx-auto mb-12">
        <span className="eyebrow">
          <i /> ATELIER CATALOG SEARCH
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-medium mt-3 mb-4">
          Search the <em>edit.</em>
        </h1>

        <form action="/search" className="search-form max-w-xl mx-auto shadow-sm">
          <Search size={20} className="text-emerald-800 flex-shrink-0" />
          <input
            type="search"
            name="q"
            defaultValue={term}
            placeholder="Search lederhosen, dirndl silk, linen shirts, accessories…"
            aria-label="Search collection"
          />
          <button type="submit" className="button button-dark py-2 px-5 text-xs">
            <span>SEARCH</span>
          </button>
        </form>

        {term && (
          <p className="text-slate-500 text-sm mt-3">
            Showing results for <strong className="text-slate-900">&ldquo;{term}&rdquo;</strong>
          </p>
        )}
      </div>

      {products.length > 0 ? (
        <div className="section search-product-grid">
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="search-empty text-center py-16 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Sparkles size={28} />
          </div>
          <span className="eyebrow">
            <i /> {term && isShopifyConfigured() ? "NO PIECES MATCHED" : "A GOOD PLACE TO BEGIN"}
          </span>
          <h2 className="font-serif text-3xl font-medium mt-2 mb-3">
            {!isShopifyConfigured()
              ? "The collection is on its way."
              : term
              ? "No match found just yet."
              : "Discover Bavarian craftsmanship."}
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            {!isShopifyConfigured()
              ? "Connect the live Shopify catalog to search available pieces."
              : term
              ? "Try searching for simpler keywords like 'Lederhosen', 'Dirndl', or explore our curated collections."
              : "Search for specific garments, materials, or traditional styles."}
          </p>
          <Link href="/collections" className="button button-dark inline-flex items-center gap-2">
            <span>BROWSE ALL COLLECTIONS</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </main>
  );
}
