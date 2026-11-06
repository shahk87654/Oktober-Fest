import type { Metadata } from "next";
import Link from "next/link";
import { predictiveSearch } from "@/lib/shopify/search";
import { ProductCard } from "@/components/product-card";
import { shopifyConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Search", robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim().slice(0, 100);
  const results = shopifyConfigured && query ? await predictiveSearch(query) : null;
  const productResults = results?.products ?? [];
  const collections = results?.collections ?? [];
  const articles = results?.articles ?? [];
  const productDetails = productResults.length
    ? await Promise.all(productResults.slice(0, 20).map((product) => getCollectionProduct(product.handle)))
    : [];
  return (
    <div className="page-shell search-page">
      <p className="eyebrow">Find your Wiesn edit</p>
      <h1 className="display">Search the atelier.</h1>
      <form action="/search" className="search-box"><label className="sr-only" htmlFor="search-query">Search products and stories</label><input id="search-query" name="q" defaultValue={query} placeholder="Try lederhosen, dirndl, or leather…" /><button type="submit">Search</button></form>
      {!shopifyConfigured ? <p className="search-empty">Connect the Storefront API to search live products, collections and stories.</p> : query ? (
        <>
          <p className="search-summary">Search results for <strong>“{query}”</strong></p>
          {collections.length > 0 && <div className="search-collections"><h2 className="display">Collections</h2>{collections.map((collection) => <Link key={collection.id} href={`/collections/${collection.handle}`}>{collection.title} <span>↗</span></Link>)}</div>}
          {productDetails.length > 0 ? <div className="search-grid">{productDetails.filter((item): item is NonNullable<typeof item> => Boolean(item)).map((product) => <ProductCard key={product.id} product={product} />)}</div> : <p className="search-empty">No products matched this search. Try another word or browse our collections.</p>}
          {articles.length > 0 && <div className="search-articles"><h2 className="display">From the journal</h2>{articles.map((article) => <Link href={`/blogs/news/${article.handle}`} key={article.id}>{article.title} <span>↗</span></Link>)}</div>}
        </>
      ) : <p className="search-empty">A good search starts with a good question. What are you looking for?</p>}
      <style>{`
        .search-page { min-height:55vh; padding-block:5rem; }.search-page h1 { margin:.6rem 0 2rem; font-size:clamp(3rem,7vw,6rem); }
        .search-box { display:flex; max-width:750px; height:58px; border-bottom:1px solid var(--forest); }.search-box input { flex:1; min-width:0; border:0; outline:0; background:transparent; font-family:var(--font-display); font-size:1.35rem; }
        .search-box button { border:0; border-radius:30px; background:var(--hops); color:white; padding:0 1.4rem; font-size:.7rem; font-weight:700; text-transform:uppercase; cursor:pointer; }
        .search-summary { margin:2rem 0 1rem; color:var(--muted); font-size:.8rem; }.search-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:2rem 1rem; }
        .search-empty { margin:2rem 0; color:var(--muted); font-size:.85rem; }.search-collections,.search-articles { display:flex; flex-wrap:wrap; gap:.7rem; margin-block:2rem; }
        .search-collections h2,.search-articles h2 { width:100%; margin:.5rem 0; font-size:1.8rem; }.search-collections a,.search-articles a { border:1px solid var(--line); border-radius:30px; padding:.7rem 1rem; font-size:.72rem; }.search-collections span,.search-articles span { color:var(--pretzel); }
        @media(max-width:850px) { .search-grid { grid-template-columns:repeat(3,1fr); } }@media(max-width:600px) { .search-grid { grid-template-columns:repeat(2,1fr); gap:1.5rem .65rem; } }
      `}</style>
    </div>
  );
}

async function getCollectionProduct(handle: string) {
  const { getProduct } = await import("@/lib/shopify/storefront");
  return getProduct(handle);
}
