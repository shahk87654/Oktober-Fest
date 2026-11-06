import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { JsonLd } from "@/components/json-ld";
import { getCollection } from "@/lib/shopify/storefront";
import { env, shopifyConfigured } from "@/lib/env";
import { getStoredCountry } from "@/lib/shopify/cart";

type Props = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ sort?: string; occasion?: string; after?: string }>;
};

const sortKeys = ["BEST_SELLING", "PRICE", "CREATED"] as const;
const occasions = ["Oktoberfest", "Wedding", "Party", "Costume", "Kids"] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const collection = shopifyConfigured ? await getCollection(handle, { first: 1 }) : null;
  return {
    title: collection?.title ?? `${handle.replaceAll("-", " ")} Collection`,
    description: collection?.description || `Shop the Wiesn Atelier ${handle.replaceAll("-", " ")} collection.`,
    alternates: { canonical: `/collections/${handle}` },
    openGraph: collection?.image ? { images: [{ url: collection.image.url, alt: collection.image.altText ?? collection.title }] } : undefined,
  };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const [{ handle }, query] = await Promise.all([params, searchParams]);
  const sortKey = query.sort === "PRICE_DESC" ? "PRICE" : sortKeys.includes(query.sort as (typeof sortKeys)[number]) ? query.sort : "BEST_SELLING";
  const occasion = occasions.includes(query.occasion as (typeof occasions)[number]) ? query.occasion : undefined;
  const country = await getStoredCountry();
  const collection = shopifyConfigured
    ? await getCollection(handle, {
        first: 24,
        after: query.after ?? null,
        sortKey,
        reverse: query.sort === "PRICE_DESC",
        filters: occasion ? [{ tag: occasion.toLowerCase() }] : [],
        country,
      })
    : null;
  if (shopifyConfigured && !collection) notFound();

  const title = collection?.title ?? handle.replaceAll("-", " ");
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: title, item: `${siteUrl}/collections/${handle}` },
    ],
  };

  return (
    <div className="collection-page">
      <JsonLd data={breadcrumb} />
      <header className="collection-hero">
        {collection?.image && <Image src={collection.image.url} alt={collection.image.altText ?? title} fill sizes="100vw" priority />}
        <div className="collection-hero__shade" />
        <div className="page-shell collection-hero__content">
          <nav aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>{title}</span></nav>
          <h1 className="display">{title}</h1>
          <p>{collection?.description || "A considered edit for the moments worth dressing up for."}</p>
        </div>
      </header>
      <section className="page-shell collection-body">
        <div className="collection-toolbar">
          <p>{collection ? `${collection.products.nodes.length} pieces in this edit` : "Collection preview"}</p>
          <form action={`/collections/${handle}`} method="get" className="collection-filters">
            <label>Occasion
              <select name="occasion" defaultValue={occasion ?? ""} aria-label="Filter by occasion">
                <option value="">All occasions</option>{occasions.map((value) => <option value={value} key={value}>{value}</option>)}
              </select>
            </label>
            <label>Sort by
              <select name="sort" defaultValue={sortKey} aria-label="Sort products">
                <option value="BEST_SELLING">Best selling</option><option value="PRICE">Price: low to high</option><option value="PRICE_DESC">Price: high to low</option><option value="CREATED">Newest</option>
              </select>
            </label>
            <button type="submit">Apply</button>
          </form>
        </div>
        {collection?.products.nodes.length ? (
          <div className="collection-grid">{collection.products.nodes.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        ) : (
          <div className="collection-empty lozenge"><span className="eyebrow">{shopifyConfigured ? "A quiet moment" : "Store setup needed"}</span><h2 className="display">{shopifyConfigured ? "Nothing in this edit just yet." : "Connect your Shopify storefront."}</h2><p>{shopifyConfigured ? "Try a different occasion or explore another collection." : "Add a Storefront API domain and token in your environment to show live products and accept orders."}</p>{!shopifyConfigured && <Link className="link-underline" href="/pages/about">Meet the atelier</Link>}</div>
        )}
        {collection?.products.pageInfo?.hasNextPage && collection.products.pageInfo.endCursor && (
          <div className="pagination"><Link className="button-secondary" href={`/collections/${handle}?sort=${sortKey}&occasion=${occasion ?? ""}&after=${encodeURIComponent(collection.products.pageInfo.endCursor)}`}>Load more</Link></div>
        )}
      </section>
      <style>{`
        .collection-hero { position:relative; display:flex; min-height:340px; align-items:flex-end; overflow:hidden; background:var(--hops); color:white; }
        .collection-hero img { object-fit:cover; }.collection-hero__shade { position:absolute; inset:0; background:linear-gradient(90deg,rgba(20,33,26,.76),rgba(20,33,26,.2)); }
        .collection-hero__content { position:relative; padding-block:4rem 3.5rem; }.collection-hero nav { display:flex; gap:.6rem; font-size:.7rem; text-transform:capitalize; }
        .collection-hero nav span { opacity:.65; }.collection-hero h1 { margin:.8rem 0 .45rem; font-size:clamp(3.2rem,7vw,6rem); text-transform:capitalize; }
        .collection-hero p { max-width:540px; margin:0; font-size:.88rem; line-height:1.55; }.collection-body { padding-block:2rem 6rem; }
        .collection-toolbar { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1.4rem; border-bottom:1px dashed var(--line); padding-bottom:1rem; }
        .collection-toolbar p { color:var(--muted); font-size:.75rem; }.collection-filters { display:flex; align-items:center; gap:1rem; }
        .collection-filters label { display:flex; align-items:center; gap:.5rem; font-size:.68rem; }.collection-filters select { max-width:185px; height:38px; border:1px solid var(--line); border-radius:20px; background:transparent; padding:0 .7rem; font-size:.68rem; }
        .collection-filters button { border:0; border-bottom:1px solid var(--gold); background:transparent; font-size:.68rem; font-weight:700; cursor:pointer; }
        .collection-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:2.4rem 1rem; }
        .collection-empty { display:flex; min-height:350px; align-items:center; justify-content:center; flex-direction:column; gap:.8rem; border-radius:14px; padding:2rem; text-align:center; }
        .collection-empty .eyebrow { color:var(--pretzel); }.collection-empty h2 { margin:0; font-size:clamp(2rem,5vw,3.8rem); }.collection-empty p { max-width:420px; color:var(--muted); line-height:1.6; }
        .pagination { display:flex; justify-content:center; margin-top:3rem; }
        @media(max-width:900px) { .collection-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } }
        @media(max-width:650px) { .collection-hero { min-height:300px; }.collection-toolbar { align-items:flex-start; flex-direction:column; }.collection-filters { width:100%; flex-wrap:wrap; }.collection-filters label { flex:1; flex-direction:column; align-items:flex-start; }.collection-filters select { width:100%; max-width:none; }.collection-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:1.6rem .65rem; } }
      `}</style>
    </div>
  );
}
