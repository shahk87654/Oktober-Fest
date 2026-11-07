import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getCollections } from "@/lib/shopify/collections";
import { imageUrl } from "@/lib/format";

export const metadata: Metadata = { title: "Collections", description: "Explore the Alpine Atelier collection." };
export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  if (!isShopifyConfigured()) return <main className="store-setup"><span className="eyebrow">LIVE FROM THE ATELIER</span><h1>Collections <em>await.</em></h1><p>Connect Shopify to browse collections managed in your store.</p></main>;
  const collections = await getCollections();
  const [featuredCollection, ...otherCollections] = collections;
  return <main className="all-collections-page">
    <header className="collections-masthead">
      <div className="collections-masthead-title"><span className="eyebrow">THE ALPINE ATELIER / COLLECTION INDEX</span><h1>Wardrobe, <em>in chapters.</em></h1></div>
      <div className="collections-masthead-note"><p>Explore considered edits, arranged directly from the live Shopify catalog.</p><span>{String(collections.length).padStart(2, "0")} COLLECTIONS <i /> UPDATED LIVE</span></div>
    </header>
    {featuredCollection ? <>
      <Link href={`/collections/${featuredCollection.handle}`} className="collections-featured">
        <div className="collections-featured-image">
          {featuredCollection.image && <Image src={imageUrl(featuredCollection.image.url, 1800)} alt={featuredCollection.image.altText ?? featuredCollection.title} fill priority sizes="(max-width: 700px) 100vw, 68vw" />}
          <span className="collections-featured-index">01 / FEATURED EDIT</span>
          <span className="collections-featured-open"><ArrowUpRight size={19} /></span>
          <div className="collections-featured-copy"><span>THE ATELIER PRESENTS</span><h2>{featuredCollection.title}<i>.</i></h2><p>{featuredCollection.description || "A considered edit from the Alpine Atelier."}</p><span className="collections-featured-cta">DISCOVER THE COLLECTION <ArrowUpRight size={15} /></span></div>
        </div>
      </Link>
      {otherCollections.length > 0 && <section className="collections-index" aria-labelledby="collections-index-title">
        <header className="collections-index-heading"><div><span className="eyebrow">FIND YOUR OWN COMBINATION</span><h2 id="collections-index-title">The collection <em>index.</em></h2></div><span>{String(otherCollections.length).padStart(2, "0")} MORE EDITS</span></header>
        <div className="all-collections-grid">{otherCollections.map((collection, index) => <Link href={`/collections/${collection.handle}`} className="all-collection-card" key={collection.id}>
          <div className="all-collection-image">{collection.image && <Image src={imageUrl(collection.image.url, 900)} alt={collection.image.altText ?? collection.title} fill sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw" />}<span>{String(index + 2).padStart(2, "0")}</span><ArrowUpRight size={18} /></div>
          <div className="all-collection-card-copy"><h3>{collection.title}</h3><p>{collection.description}</p><span>EXPLORE EDIT <ArrowUpRight size={13} /></span></div>
        </Link>)}</div>
      </section>}
    </> : <p className="empty-collection">No collections are currently published.</p>}
  </main>;
}
