import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, MoveUpRight, ScanLine } from "lucide-react";
import { campaignCopy, collectionHandles, editorialImages, journalBlogHandle } from "@/lib/config";
import { formatMoney, imageUrl } from "@/lib/format";
import type { ShopifyArticle, ShopifyCollection } from "@/lib/shopify/types";
import { ProductCard } from "./product-card";
import { NewsletterForm } from "./newsletter-form";

const editorialImage = (id: string, width = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

const categories = [
  { index: "01", name: "MEN", sub: "A study in character", href: `/collections/${collectionHandles.men}`, image: "photo-1515886657613-9f3515b0c78f", className: "category-tall" },
  { index: "02", name: "WOMEN", sub: "Tradition, with a new point of view", href: `/collections/${collectionHandles.women}`, image: "photo-1539109136881-3be0616acf4b", className: "category-wide" },
  { index: "03", name: "CHILDREN", sub: "For their first great celebration", href: `/collections/${collectionHandles.kids}`, image: "photo-1519238263530-99bdd11df2ea", className: "category-small" },
];

export function HomePage({
  men,
  women,
  kids,
  featured,
  accessories,
  articles,
}: {
  men: ShopifyCollection | null;
  women: ShopifyCollection | null;
  kids: ShopifyCollection | null;
  featured: ShopifyCollection | null;
  accessories: ShopifyCollection | null;
  articles: ShopifyArticle[];
}) {
  const mensProducts = (men?.products.nodes ?? featured?.products.nodes ?? []).slice(0, 4);
  const womensProducts = (women?.products.nodes ?? []).slice(0, 4);
  const heroProductImage = mensProducts[0]?.featuredImage;
  const heroCollection = [featured, men, women, kids, accessories].find((collection) => collection?.image?.url);
  const heroImage = heroCollection?.image?.url ?? heroProductImage?.url;
  const heroAlt = heroCollection?.image?.altText ?? heroProductImage?.altText ?? heroCollection?.title ?? mensProducts[0]?.title ?? "Alpine Atelier collection";
  const dynamicCategories = [
    { ...categories[0], image: men?.image?.url ?? mensProducts[0]?.featuredImage?.url ?? editorialImage(categories[0].image), imageAlt: men?.image?.altText ?? "A considered look from the men's collection", href: `/collections/${men?.handle ?? collectionHandles.men}` },
    { ...categories[1], image: women?.image?.url ?? womensProducts[0]?.featuredImage?.url ?? editorialImage(categories[1].image), imageAlt: women?.image?.altText ?? "Modern Bavarian dress", href: `/collections/${women?.handle ?? collectionHandles.women}` },
    { ...categories[2], image: kids?.image?.url ?? editorialImage(categories[2].image), imageAlt: kids?.image?.altText ?? "A celebration for the next generation", href: `/collections/${kids?.handle ?? collectionHandles.kids}` },
  ];
  const shopCategories: Array<[string, string, ShopifyCollection | null, string]> = [
    ["Lederhosen", collectionHandles.lederhosen, men, "photo-1515886657613-9f3515b0c78f"],
    ["Dirndl dresses", collectionHandles.dirndl, women, "photo-1539109136881-3be0616acf4b"],
    ["Bavarian shirts", collectionHandles.shirts, men, "photo-1529139574466-a303027c1d8b"],
    ["Jackets & vests", collectionHandles.jackets, men, "photo-1529139574466-a303027c1d8b"],
    ["Traditional shoes", collectionHandles.shoes, accessories, "photo-1543163521-1bf539c55dd2"],
    ["Accessories", collectionHandles.accessories, accessories, "photo-1523275335684-37898b6baf30"],
  ];

  return (
    <main className="atelier-home">
      <section className="hero-section">
        {heroImage && <Image
          className="hero-image"
          src={imageUrl(heroImage, 2400)}
          alt={heroAlt}
          fill
          priority
          sizes="100vw"
        />}
        <div className="hero-shade" />
        <div className="hero-content">
          <span className="eyebrow hero-eyebrow"><i /> ALPINE ATELIER <span>—</span> THE NEW TRADITION</span>
          <h1>Own the<br /><em>occasion.</em></h1>
          <p>Bavarian dress, re-cut for the way you move now. A collection for nights that last and stories that stay.</p>
          <div className="hero-actions"><Link href={`/collections/${featured?.handle ?? collectionHandles.featured}`} className="button button-light">DISCOVER THE COLLECTION <ArrowRight size={16} /></Link><Link href="/about" className="hero-story-link">INSIDE THE ATELIER <ArrowUpRight size={15} /></Link></div>
        </div>
        <div className="hero-index"><ScanLine size={14} /><span>{heroCollection?.title ?? "SHOPIFY PRODUCT"}</span><i /><span>01 / 03</span></div>
        <a className="hero-scroll" href="#collections"><span>SCROLL TO DISCOVER</span><ArrowDown size={14} /></a>
        <div className="hero-caption">BAVARIAN ROOTS · REFRAMED FOR NOW</div>
        <div className="hero-side-mark"><span>AA</span><i /> EST. IN THE MOMENT</div>
        {mensProducts[0] && heroProductImage && <Link href={`/products/${mensProducts[0].handle}`} className="hero-product-card">
          <span className="hero-product-image"><Image src={imageUrl(heroProductImage.url, 160)} alt={heroProductImage.altText ?? mensProducts[0].title} fill sizes="64px" /></span>
          <span className="hero-product-copy"><small>THE CAMPAIGN PIECE</small><strong>{mensProducts[0].title}</strong><span>{formatMoney(mensProducts[0].priceRange.minVariantPrice)}</span></span>
          <span className="hero-product-arrow"><ArrowUpRight size={16} /></span>
        </Link>}
      </section>

      <div className="home-signal-bar" aria-label="Alpine Atelier collections">
        <span>TRADITION / RECONSIDERED</span><i /><span>MEN · WOMEN · CHILDREN</span><i /><span>THE ALPINE ATELIER</span><i /><span>TRADITION / RECONSIDERED</span>
      </div>

      <section className="section collection-intro" id="collections">
        <div className="section-heading collection-heading">
          <div><span className="eyebrow">01 / THE COLLECTION INDEX <i /></span><h2>Choose your<br /><em>own direction.</em></h2></div>
          <p>Three perspectives on Bavarian dress. Find the one that feels like yours.</p>
          <span className="heading-number">SELECT A POINT OF VIEW</span>
        </div>
        <div className="category-grid">
          {dynamicCategories.map((category) => (
            <Link className={`category-card ${category.className}`} href={category.href} key={category.index}>
              <Image src={imageUrl(category.image, 1400)} alt={category.imageAlt} fill sizes="(max-width: 700px) 100vw, 55vw" />
              <div className="category-overlay" />
              <div className="category-number"><span>{category.index}</span><i /> {category.name}</div>
              <div className="category-bottom"><div><span>{category.sub}</span><h3>{category.name}</h3></div><span className="category-arrow"><ArrowUpRight size={17} /></span></div>
            </Link>
          ))}
        </div>
      </section>

      {mensProducts.length > 0 && (
        <section className="section products-section">
          <div className="section-heading compact-heading">
            <div><span className="eyebrow">02 / OBJECTS OF CHARACTER <i /></span><h2>The Lederhosen <em>study.</em></h2></div>
            <Link href={`/collections/${men?.handle ?? collectionHandles.men}`} className="text-link">VIEW ALL PIECES <ArrowRight size={15} /></Link>
          </div>
          <div className="product-grid">{mensProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </section>
      )}

      <section className="women-editorial">
        <div className="women-editorial-image">
          <Image src={women?.image ? imageUrl(women.image.url, 1500) : editorialImage("photo-1539109136881-3be0616acf4b", 1500)} alt={women?.image?.altText ?? "A modern interpretation of traditional dress"} fill sizes="(max-width: 800px) 100vw, 58vw" />
          <span className="image-index"><ScanLine size={13} /> 02 <i /> THE WOMEN&apos;S EDIT</span>
        </div>
        <div className="women-editorial-copy">
          <span className="eyebrow">03 / A DIFFERENT SILHOUETTE <i /></span>
          <h2>Tradition<br />in a new <em>light.</em></h2>
          <p>Explore timeless Dirndl silhouettes, delicate details and distinctive Bavarian craftsmanship. A story of considered contrasts, made to be entirely your own.</p>
          <Link href={`/collections/${women?.handle ?? collectionHandles.women}`} className="button button-outline">DISCOVER THE WOMEN&apos;S EDIT <ArrowRight size={15} /></Link>
          <div className="editorial-mark">A<br /><span>A</span></div>
        </div>
      </section>

      {womensProducts.length > 0 && (
        <section className="section products-section women-products">
          <div className="section-heading compact-heading">
            <div><span className="eyebrow">04 / THE WOMEN&apos;S COLLECTION <i /></span><h2>Made to be <em>remembered.</em></h2></div>
            <Link href={`/collections/${women?.handle ?? collectionHandles.women}`} className="text-link">VIEW ALL PIECES <ArrowRight size={15} /></Link>
          </div>
          <div className="product-grid">{womensProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </section>
      )}

      <section className="story-section">
        <div className="story-image-wrap">
          <Image src={editorialImage("photo-1529139574466-a303027c1d8b", 1400)} alt="Fashion craft detail and considered materials" fill sizes="(max-width: 800px) 100vw, 52vw" />
          <span className="story-image-caption">DETAIL IS NEVER AN AFTERTHOUGHT</span>
        </div>
        <div className="story-copy">
          <span className="eyebrow">THE ATELIER / OUR POINT OF VIEW</span>
          <h2>Rooted in<br />heritage.<br /><em>Made for today.</em></h2>
          <p>We look to Bavarian traditions not as something to preserve behind glass, but as a living language. Honest materials, thoughtful detailing and familiar silhouettes meet a more modern sensibility.</p>
          <Link href="/about" className="text-link light-link">MEET THE ATELIER <ArrowRight size={15} /></Link>
          <span className="story-number">03</span>
        </div>
      </section>

      <section className="category-strip">
        <div className="category-strip-heading"><span className="eyebrow">A CLOSER LOOK</span><h2>Shop by <em>category.</em></h2></div>
        <div className="category-links">
          {shopCategories.map(([label, handle, itemCollection, fallback], index) => {
            const collectionImage = itemCollection?.image?.url ?? itemCollection?.products.nodes[0]?.featuredImage?.url;
            const image = collectionImage ? imageUrl(collectionImage, 240) : editorialImage(fallback, 240);
            return (
              <Link href={`/collections/${handle}`} key={`${label}-${index}`} className="category-link">
                <span className="category-link-image"><Image src={image} alt="" fill sizes="72px" /></span><span>{label}</span><ArrowUpRight size={14} />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="campaign-banner">
        <Image src={editorialImages.campaign} alt="Seasonal Alpine Atelier campaign" fill sizes="100vw" />
        <div className="campaign-shade" />
        <div className="campaign-copy"><span className="eyebrow">{campaignCopy.eyebrow}</span><h2>{campaignCopy.headline.map((line, index) => <span key={line}>{index === campaignCopy.headline.length - 1 ? <em>{line}</em> : line}{index < campaignCopy.headline.length - 1 && <br />}</span>)}</h2><Link href={`/collections/${featured?.handle ?? collectionHandles.featured}`} className="button button-light">{campaignCopy.cta} <ArrowRight size={15} /></Link></div>
        <span className="campaign-caption">A MOMENT THAT BECOMES A MEMORY</span>
      </section>

      {articles.length > 0 && (
        <section className="section journal-section">
          <div className="section-heading compact-heading">
            <div><span className="eyebrow">NOTES FROM THE MOUNTAINS <i /></span><h2>The Alpine <em>Journal.</em></h2></div>
            <Link href={`/blogs/${journalBlogHandle}`} className="text-link">ALL STORIES <ArrowRight size={15} /></Link>
          </div>
          <div className="journal-grid">{articles.slice(0, 3).map((article, index) => (
              <Link className="journal-card" href={`/blogs/${journalBlogHandle}/${article.handle}`} key={article.handle}>
              <div className={`journal-image journal-image-${index}`}>
                {article.image && <Image src={imageUrl(article.image.url, 800)} alt={article.image.altText ?? article.title} fill sizes="(max-width: 700px) 100vw, 33vw" />}
                {!article.image && <Image src={editorialImage(["photo-1529139574466-a303027c1d8b", "photo-1539109136881-3be0616acf4b", "photo-1524504388940-b1c1722653e1"][index], 800)} alt="" fill sizes="(max-width: 700px) 100vw, 33vw" />}
                <span className="journal-image-arrow"><ArrowUpRight size={17} /></span>
              </div>
              <div className="journal-meta"><span>{article.blog.title}</span><time dateTime={article.publishedAt}>{new Date(article.publishedAt).toLocaleDateString("en", { month: "long", year: "numeric" })}</time></div>
              <h3>{article.title}</h3><span className="journal-read">READ THE STORY <ArrowRight size={13} /></span>
            </Link>
          ))}</div>
        </section>
      )}

      <section className="service-strip">
        {[
          ["01", "Secure checkout", "Checkout completed by Shopify"],
          ["02", "Store information", "Published directly by the store"],
          ["03", "Live product details", "Managed through Shopify"],
          ["04", "Delivery information", "Rates shown at checkout"],
        ].map(([number, title, copy]) => <div className="service-item" key={number}><span className="service-number">{number}</span><div><h3>{title}</h3><p>{copy}</p></div></div>)}
      </section>

      <section className="newsletter-section">
        <div className="newsletter-mark">A<span>A</span></div>
        <div className="newsletter-copy"><span className="eyebrow">A NOTE FROM THE ATELIER</span><h2>A little more <em>Alpine.</em></h2><p>Be the first to discover new collections, seasonal edits and occasional notes from the atelier.</p></div>
        <NewsletterForm shopDomain={process.env.SHOPIFY_STORE_DOMAIN} />
      </section>
      <div className="home-endnote"><span>ALPINE ATELIER</span><span>TRADITION, REIMAGINED</span><MoveUpRight size={15} /></div>
    </main>
  );
}
