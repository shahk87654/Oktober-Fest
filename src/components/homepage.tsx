import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CreditCard,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { collectionHandles, journalBlogHandle } from "@/lib/config";
import { imageUrl } from "@/lib/format";
import type { ShopifyArticle, ShopifyCollection } from "@/lib/shopify/types";
import { ProductCard } from "./product-card";
import { NewsletterForm } from "./newsletter-form";
import { HomeBannerCarousel } from "./home-banner-carousel";

const editorialImage = (id: string, width = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

const collectionCards = [
  {
    index: "01",
    name: "Men's Heritage Edit",
    note: "Bavarian deerskin lederhosen & linen shirts",
    handle: collectionHandles.men,
    fallback: "photo-1515886657613-9f3515b0c78f",
  },
  {
    index: "02",
    name: "Women's Couture Dirndls",
    note: "Pure silk aprons, velvet bodices & blouses",
    handle: collectionHandles.women,
    fallback: "photo-1539109136881-3be0616acf4b",
  },
  {
    index: "03",
    name: "Children's Trachten",
    note: "Crafted for their very first celebration",
    handle: collectionHandles.kids,
    fallback: "photo-1519238263530-99bdd11df2ea",
  },
];

export function HomePage({
  men,
  women,
  kids,
  featured,
  articles,
}: {
  men: ShopifyCollection | null;
  women: ShopifyCollection | null;
  kids: ShopifyCollection | null;
  featured: ShopifyCollection | null;
  articles: ShopifyArticle[];
}) {
  const mensProducts = (men?.products.nodes ?? featured?.products.nodes ?? []).slice(0, 4);
  const womensProducts = (women?.products.nodes ?? []).slice(0, 4);
  const collectionImages = [
    men?.image?.url ?? mensProducts[0]?.featuredImage?.url,
    women?.image?.url ?? womensProducts[0]?.featuredImage?.url,
    kids?.image?.url,
  ];

  return (
    <main className="alpine-home">
      {/* Dynamic Hero Carousel */}
      <HomeBannerCarousel />

      {/* Floating Trust Strip */}
      <section className="w-full bg-white border-b border-slate-200/80 py-5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <Truck size={20} className="text-emerald-700" />
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900 tracking-wider uppercase m-0">Express Shipping</p>
              <p className="text-[11px] text-slate-500 m-0">Direct to your doorstep worldwide</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <ShieldCheck size={20} className="text-emerald-700" />
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900 tracking-wider uppercase m-0">Genuine Bavarian</p>
              <p className="text-[11px] text-slate-500 m-0">Handcrafted heirloom quality</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Ruler size={20} className="text-emerald-700" />
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900 tracking-wider uppercase m-0">Tailored Fit</p>
              <p className="text-[11px] text-slate-500 m-0">Precise measurements & guidance</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Sparkles size={20} className="text-emerald-700" />
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900 tracking-wider uppercase m-0">Oktoberfest 2026</p>
              <p className="text-[11px] text-slate-500 m-0">Curated festive collection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Collection Grid */}
      <section className="home-collection-section" id="home-collections" aria-labelledby="home-collections-title">
        <header className="home-section-heading">
          <div>
            <span className="eyebrow">
              <i /> CURATED CHAPTERS OF CELEBRATION
            </span>
            <h2 id="home-collections-title">
              Find your <em>Alpine expression.</em>
            </h2>
          </div>
          <p>
            Deep Bavarian roots interpreted through a clean, modern silhouette. Step into pieces created to be worn and remembered.
          </p>
        </header>

        <div className="home-collection-grid">
          {collectionCards.map((collection, index) => {
            const image = collectionImages[index] ?? editorialImage(collection.fallback, 1200);
            const alt = [men?.image?.altText, women?.image?.altText, kids?.image?.altText][index] ?? collection.name;
            const handle = [men?.handle, women?.handle, kids?.handle][index] ?? collection.handle;
            return (
              <Link
                className={`home-collection-card home-collection-card-${index + 1}`}
                href={`/collections/${handle}`}
                key={collection.index}
              >
                <Image
                  src={imageUrl(image, 1200)}
                  alt={alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <span className="home-collection-number">
                  {collection.index} • EDIT
                </span>
                <span className="home-collection-copy">
                  <small>{collection.note}</small>
                  <strong>{collection.name}</strong>
                </span>
                <span className="home-collection-arrow">
                  <ArrowUpRight size={20} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Men's Showcase Grid */}
      {mensProducts.length > 0 && (
        <section className="home-edit-section" aria-labelledby="home-edit-title">
          <header className="home-section-heading home-edit-heading">
            <div>
              <span className="eyebrow">
                <i /> MEN&apos;S BAVARIAN WARDROBE
              </span>
              <h2 id="home-edit-title">
                Handcrafted for <em>the long road.</em>
              </h2>
            </div>
            <div className="home-edit-aside">
              <p>Authentic deerskin lederhosen, horn buttons, and tailored jackets crafted for fest and field.</p>
              <Link href={`/collections/${men?.handle ?? collectionHandles.men}`}>
                <span>EXPLORE ALL MEN&apos;S PIECES</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </header>
          <div className="product-grid home-edit-grid">
            {mensProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Women's Spotlight Editorial */}
      <section className="home-story-section">
        <div className="home-story-image">
          <Image
            src={imageUrl(women?.image?.url ?? editorialImage("photo-1539109136881-3be0616acf4b", 1600), 1600)}
            alt={women?.image?.altText ?? "Contemporary dirndl dress styling"}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <span>WOMEN&apos;S COUTURE EDIT</span>
        </div>
        <div className="home-story-copy">
          <span className="eyebrow">
            <i /> MODERN DIRNDL ATELIER
          </span>
          <h2>
            Tradition, on <em>your own terms.</em>
          </h2>
          <p>
            Sculptural silhouettes, shimmering silks, and hand-embroidered aprons. Made to celebrate life&apos;s most meaningful festivities in effortless comfort and poise.
          </p>
          <Link href={`/collections/${women?.handle ?? collectionHandles.women}`}>
            <span>DISCOVER THE DIRNDL COLLECTION</span>
            <ArrowRight size={15} />
          </Link>
          <span className="home-story-mark" aria-hidden="true">
            W
          </span>
        </div>
      </section>

      {/* Women's Products Grid */}
      {womensProducts.length > 0 && (
        <section className="home-edit-section home-women-edit" aria-labelledby="home-women-title">
          <header className="home-section-heading home-edit-heading">
            <div>
              <span className="eyebrow">
                <i /> THE WOMEN&apos;S SELECTION
              </span>
              <h2 id="home-women-title">
                Heirloom pieces &amp; <em>poise.</em>
              </h2>
            </div>
            <div className="home-edit-aside">
              <p>From timeless black velvet bodices to soft pastel silk aprons.</p>
              <Link href={`/collections/${women?.handle ?? collectionHandles.women}`}>
                <span>VIEW COMPLETE COLLECTION</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </header>
          <div className="product-grid home-edit-grid">
            {womensProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Kids' Section */}
      <section className="home-kids-section">
        <div className="home-kids-image">
          <Image
            src={imageUrl(kids?.image?.url ?? editorialImage(collectionCards[2].fallback, 1500), 1500)}
            alt={kids?.image?.altText ?? "A little one dressed for family Oktoberfest celebrations"}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <span>THE LITTLE ONES • AGES 2–14</span>
        </div>
        <div className="home-kids-copy">
          <span className="eyebrow">
            <i /> FIRST CELEBRATIONS
          </span>
          <h2>
            Their very first <em>little tradition.</em>
          </h2>
          <p>
            Gentle on delicate skin, durable for joyful play, and authentic down to the miniature horn buttons. Made to pass down through siblings and cousins.
          </p>
          <Link href={`/collections/${kids?.handle ?? collectionHandles.kids}`}>
            <span>EXPLORE CHILDREN&apos;S STYLES</span>
            <ArrowRight size={15} />
          </Link>
          <span className="home-kids-mark" aria-hidden="true">
            K
          </span>
        </div>
      </section>

      {/* Atelier Manifesto Banner */}
      <section className="home-note-section">
        <Image
          src={editorialImage("photo-1529139574466-a303027c1d8b", 1600)}
          alt="An editorial detail from the Alpine Atelier workshop"
          fill
          sizes="100vw"
        />
        <div className="home-note-overlay" />
        <div className="home-note-copy">
          <span className="home-overline">A PHILOSOPHY FROM THE BAVARIAN ALPS</span>
          <p>
            “Tradition isn&apos;t something to keep behind glass. It is a living art to <em>step boldly into.</em>”
          </p>
          <Link href="/about">
            <span>READ OUR HERITAGE MANIFESTO</span>
            <ArrowRight size={14} />
          </Link>
        </div>
        <span className="home-note-index">ALPINE ATELIER • ESTABLISHED 1898</span>
      </section>

      {/* Brand Values Grid */}
      <section className="home-values-section" aria-labelledby="home-values-title">
        <header className="home-values-heading">
          <span className="eyebrow">
            <i /> PRINCIPLES OF THE ATELIER
          </span>
          <h2 id="home-values-title">
            The Alpine <em>standard of craft.</em>
          </h2>
        </header>
        <div className="home-values-grid">
          <article className="home-value-card">
            <span>01 / LIVING HERITAGE</span>
            <h3>Rooted, Never Static</h3>
            <p>We honor century-old tanning and embroidery techniques while refining every fit for modern comfort.</p>
          </article>
          <article className="home-value-card">
            <span>02 / INDIVIDUAL SPIRIT</span>
            <h3>No Two Ways to Wear It</h3>
            <p>Pair traditional lederhosen with crisp knitwear or style your dirndl with contemporary accessories.</p>
          </article>
          <article className="home-value-card">
            <span>03 / TIMELESS PASSAGE</span>
            <h3>Heirlooms to Pass Down</h3>
            <p>Natural materials that age with grace and develop a unique patina through every joyous celebration.</p>
          </article>
        </div>
      </section>

      {/* 3-Step Getting Ready Guide */}
      <section className="home-ritual-section" aria-labelledby="home-ritual-title">
        <div className="home-ritual-intro">
          <span className="eyebrow">
            <i /> THE ART OF GETTING READY
          </span>
          <h2 id="home-ritual-title">
            How to dress for <em>the occasion.</em>
          </h2>
          <p>
            Whether it is your first Oktoberfest in Munich or a family jubilee, dressing in genuine Bavarian style is an unforgettable experience.
          </p>
        </div>
        <div className="home-ritual-steps">
          <article>
            <span>01</span>
            <div>
              <h3>Choose Your Foundation</h3>
              <p>Begin with genuine leather lederhosen or a silk-apron dirndl that matches your silhouette.</p>
            </div>
            <Link href={`/collections/${men?.handle ?? collectionHandles.men}`} aria-label="Explore men's foundation">
              <ArrowUpRight size={18} />
            </Link>
          </article>
          <article>
            <span>02</span>
            <div>
              <h3>Layer with Character</h3>
              <p>Add a linen trachten shirt, embroidered waistcoat, or delicate lace blouse to create depth.</p>
            </div>
            <Link href={`/collections/${women?.handle ?? collectionHandles.women}`} aria-label="Explore women's layering">
              <ArrowUpRight size={18} />
            </Link>
          </article>
          <article>
            <span>03</span>
            <div>
              <h3>Share the Celebration</h3>
              <p>Gather your family and friends. The best celebration is always the one you share together.</p>
            </div>
            <Link href={`/collections/${kids?.handle ?? collectionHandles.kids}`} aria-label="Explore family styles">
              <ArrowUpRight size={18} />
            </Link>
          </article>
        </div>
      </section>

      {/* Field Notes Journal Stories */}
      {articles.length > 0 && (
        <section className="home-journal-section" aria-labelledby="home-journal-title">
          <header className="home-section-heading home-journal-heading">
            <div>
              <span className="eyebrow">
                <i /> FIELD NOTES &amp; JOURNAL
              </span>
              <h2 id="home-journal-title">
                Stories from <em>the mountains.</em>
              </h2>
            </div>
            <Link href={`/blogs/${journalBlogHandle}`}>
              <span>ALL JOURNAL STORIES</span>
              <ArrowRight size={14} />
            </Link>
          </header>
          <div className="home-journal-grid">
            {articles.slice(0, 3).map((article, index) => (
              <Link
                className="home-journal-card"
                href={`/blogs/${journalBlogHandle}/${article.handle}`}
                key={article.handle}
              >
                <div className="home-journal-image">
                  {article.image ? (
                    <Image
                      src={imageUrl(article.image.url, 900)}
                      alt={article.image.altText ?? article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <Image
                      src={editorialImage(
                        ["photo-1529139574466-a303027c1d8b", "photo-1539109136881-3be0616acf4b", "photo-1524504388940-b1c1722653e1"][index],
                        900,
                      )}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  )}
                  <span>
                    <ArrowUpRight size={18} />
                  </span>
                </div>
                <div className="home-journal-meta">
                  <span>{article.blog.title}</span>
                  <time dateTime={article.publishedAt}>
                    {new Date(article.publishedAt).toLocaleDateString("en", {
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <h3>{article.title}</h3>
                <span className="home-journal-read">
                  <span>READ STORY</span>
                  <ArrowRight size={13} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Customer Guarantees */}
      <section className="home-shopping-section" aria-labelledby="home-shopping-title">
        <header className="home-shopping-heading">
          <span className="eyebrow">
            <i /> PEACE OF MIND ORDERING
          </span>
          <h2 id="home-shopping-title">
            Prepared for Oktoberfest 2026 <em>with care.</em>
          </h2>
        </header>
        <div className="home-shopping-grid">
          <article className="home-shopping-card">
            <span className="home-shopping-icon">
              <CreditCard size={24} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <h3>Secure Payments</h3>
            <p>Shop Pay, Apple Pay, PayPal, Visa, Mastercard, and interest-free installment options.</p>
          </article>
          <article className="home-shopping-card">
            <span className="home-shopping-icon">
              <ShoppingBag size={24} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <h3>Simple 3-Step Orders</h3>
            <p>Select your favorite piece, choose size, and checkout with encrypted Shopify security.</p>
          </article>
          <article className="home-shopping-card">
            <span className="home-shopping-icon">
              <Ruler size={24} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <h3>Precise Measurement</h3>
            <p>Comprehensive size guides and support to ensure a glove-like fit the first time.</p>
          </article>
          <article className="home-shopping-card">
            <span className="home-shopping-icon">
              <BadgeCheck size={24} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <h3>Certified Authenticity</h3>
            <p>Genuine Alpine fabrics, supple leathers, and authentic traditional Bavarian cuts.</p>
          </article>
        </div>
      </section>

      {/* Newsletter Signup Banner */}
      <section className="home-newsletter-section">
        <div className="home-newsletter-brand">
          A<span>A</span>
        </div>
        <div className="home-newsletter-copy">
          <span className="eyebrow">
            <i /> THE ALPINE DISPATCH
          </span>
          <h2>
            Occasional dispatches from <em>the mountains.</em>
          </h2>
          <p>
            Private previews of seasonal collections, styling advice for Oktoberfest, and stories from our artisans.
          </p>
        </div>
        <NewsletterForm shopDomain={process.env.SHOPIFY_STORE_DOMAIN} />
      </section>

      <div className="home-colophon">
        <span>ALPINE ATELIER • MUNICH &amp; THE ALPS</span>
        <span>TRADITION, IN A FRESH MODERN LIGHT</span>
        <span>EST. 1898</span>
      </div>
    </main>
  );
}
