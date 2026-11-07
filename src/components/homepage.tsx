import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, CreditCard, MoveUpRight, Ruler, ShoppingBag } from "lucide-react";
import { collectionHandles, journalBlogHandle } from "@/lib/config";
import { imageUrl } from "@/lib/format";
import type { ShopifyArticle, ShopifyCollection } from "@/lib/shopify/types";
import { ProductCard } from "./product-card";
import { NewsletterForm } from "./newsletter-form";
import { HomeBannerCarousel } from "./home-banner-carousel";

const editorialImage = (id: string, width = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

const collectionCards = [
  { index: "01", name: "For him", note: "A modern take on the classics", handle: collectionHandles.men, fallback: "photo-1515886657613-9f3515b0c78f" },
  { index: "02", name: "For her", note: "Tradition, on her own terms", handle: collectionHandles.women, fallback: "photo-1539109136881-3be0616acf4b" },
  { index: "03", name: "For little ones", note: "Their first Oktoberfest", handle: collectionHandles.kids, fallback: "photo-1519238263530-99bdd11df2ea" },
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
      <HomeBannerCarousel />

      <section className="home-collection-section" id="home-collections" aria-labelledby="home-collections-title">
        <header className="home-section-heading">
          <div>
            <span className="home-overline">A PLACE FOR EVERY KIND OF CELEBRATION</span>
            <h2 id="home-collections-title">Find your<br /><em>kind of Alpine.</em></h2>
          </div>
          <p>Familiar roots. A fresh point of view. Start wherever the occasion takes you.</p>
        </header>
        <div className="home-collection-grid">
          {collectionCards.map((collection, index) => {
            const image = collectionImages[index] ?? editorialImage(collection.fallback, 1200);
            const alt = [men?.image?.altText, women?.image?.altText, kids?.image?.altText][index] ?? collection.name;
            const handle = [men?.handle, women?.handle, kids?.handle][index] ?? collection.handle;
            return (
              <Link className={`home-collection-card home-collection-card-${index + 1}`} href={`/collections/${handle}`} key={collection.index}>
                <Image src={imageUrl(image, 1200)} alt={alt} fill sizes="(max-width: 700px) 90vw, 33vw" />
                <span className="home-collection-number">{collection.index} <i /> COLLECTION</span>
                <span className="home-collection-copy"><small>{collection.note}</small><strong>{collection.name}</strong></span>
                <span className="home-collection-arrow"><ArrowUpRight size={18} /></span>
              </Link>
            );
          })}
        </div>
      </section>

      {mensProducts.length > 0 && (
        <section className="home-edit-section" aria-labelledby="home-edit-title">
          <header className="home-section-heading home-edit-heading">
            <div>
              <span className="home-overline">THE ALPINE EDIT / 01</span>
              <h2 id="home-edit-title">Made for<br /><em>the long way round.</em></h2>
            </div>
            <div className="home-edit-aside">
              <p>Pieces with a little more character. Picked from the collection, just for you.</p>
              <Link href={`/collections/${men?.handle ?? collectionHandles.men}`}>EXPLORE THE EDIT <ArrowRight size={14} /></Link>
            </div>
          </header>
          <div className="product-grid home-edit-grid">
            {mensProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      )}

      <section className="home-story-section">
        <div className="home-story-image">
          <Image
            src={imageUrl(women?.image?.url ?? editorialImage("photo-1539109136881-3be0616acf4b", 1600), 1600)}
            alt={women?.image?.altText ?? "A fresh perspective on traditional dress"}
            fill
            sizes="(max-width: 700px) 100vw, 55vw"
          />
          <span>THE WOMEN&apos;S EDIT / 02</span>
        </div>
        <div className="home-story-copy">
          <span className="home-overline">A DIFFERENT KIND OF TRADITION</span>
          <h2>Wear it<br />your <em>way.</em></h2>
          <p>Distinctive silhouettes, beautiful details, and room to make the tradition your own. Meet the new women&apos;s edit.</p>
          <Link href={`/collections/${women?.handle ?? collectionHandles.women}`}>DISCOVER THE COLLECTION <ArrowRight size={15} /></Link>
          <span className="home-story-mark" aria-hidden="true">A</span>
        </div>
      </section>

      {womensProducts.length > 0 && (
        <section className="home-edit-section home-women-edit" aria-labelledby="home-women-title">
          <header className="home-section-heading home-edit-heading">
            <div>
              <span className="home-overline">THE WOMEN&apos;S EDIT / 02</span>
              <h2 id="home-women-title">A little more<br /><em>unexpected.</em></h2>
            </div>
            <div className="home-edit-aside">
              <p>Modern heirlooms and considered details, drawn from the women&apos;s collection.</p>
              <Link href={`/collections/${women?.handle ?? collectionHandles.women}`}>VIEW ALL PIECES <ArrowRight size={14} /></Link>
            </div>
          </header>
          <div className="product-grid home-edit-grid">
            {womensProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      )}

      <section className="home-kids-section">
        <div className="home-kids-image">
          <Image
            src={imageUrl(kids?.image?.url ?? editorialImage(collectionCards[2].fallback, 1500), 1500)}
            alt={kids?.image?.altText ?? "A little one dressed for a family celebration"}
            fill
            sizes="(max-width: 700px) 100vw, 55vw"
          />
          <span>THE LITTLE ONES / 03</span>
        </div>
        <div className="home-kids-copy">
          <span className="home-overline">SMALL MOMENTS, BIG MEMORIES</span>
          <h2>Their first<br /><em>little tradition.</em></h2>
          <p>For the youngest guests and the stories they will hear for years. Pieces made for joining in, in their own way.</p>
          <Link href={`/collections/${kids?.handle ?? collectionHandles.kids}`}>EXPLORE THE KIDS&apos; EDIT <ArrowRight size={15} /></Link>
          <span className="home-kids-mark" aria-hidden="true">03</span>
        </div>
      </section>

      <section className="home-note-section">
        <Image
          src={editorialImage("photo-1529139574466-a303027c1d8b", 1500)}
          alt="An editorial detail from the Alpine Atelier"
          fill
          sizes="(max-width: 700px) 100vw, 50vw"
        />
        <div className="home-note-overlay" />
        <div className="home-note-copy">
          <span className="home-overline">A NOTE FROM THE ATELIER</span>
          <p>“Tradition isn&apos;t a thing to stand still for.<br />It&apos;s a thing to <em>step into.</em>”</p>
          <Link href="/about">OUR POINT OF VIEW <ArrowRight size={14} /></Link>
        </div>
        <span className="home-note-index">ALPINE ATELIER <i /> SINCE ALWAYS</span>
      </section>

      <section className="home-values-section" aria-labelledby="home-values-title">
        <header className="home-values-heading">
          <span className="home-overline">A FEW THINGS WE HOLD DEAR</span>
          <h2 id="home-values-title">The Alpine<br /><em>way of seeing.</em></h2>
        </header>
        <div className="home-values-grid">
          <article className="home-value-card">
            <span>01 / KEEP THE SPIRIT</span>
            <h3>Rooted, never standing still.</h3>
            <p>A nod to where it began, with room for every new way to celebrate.</p>
          </article>
          <article className="home-value-card">
            <span>02 / MAKE IT YOURS</span>
            <h3>There is no one way to wear it.</h3>
            <p>Personal touches and unexpected pairings are always welcome at the table.</p>
          </article>
          <article className="home-value-card">
            <span>03 / COME TOGETHER</span>
            <h3>Better when shared.</h3>
            <p>For familiar faces, new friends, and the moments in between.</p>
          </article>
        </div>
      </section>

      <section className="home-ritual-section" aria-labelledby="home-ritual-title">
        <div className="home-ritual-intro">
          <span className="home-overline">A SMALL GUIDE TO GETTING READY</span>
          <h2 id="home-ritual-title">The art of<br /><em>showing up.</em></h2>
          <p>There is no dress code for making a moment your own. Start with what feels right, then let the day take it from there.</p>
        </div>
        <div className="home-ritual-steps">
          <article>
            <span>01</span>
            <div><h3>Find your starting point</h3><p>Begin with a silhouette that feels like you.</p></div>
            <Link href={`/collections/${men?.handle ?? collectionHandles.men}`} aria-label="Explore the men's collection"><ArrowUpRight size={17} /></Link>
          </article>
          <article>
            <span>02</span>
            <div><h3>Add a personal detail</h3><p>Make room for a little unexpected character.</p></div>
            <Link href={`/collections/${women?.handle ?? collectionHandles.women}`} aria-label="Explore the women's collection"><ArrowUpRight size={17} /></Link>
          </article>
          <article>
            <span>03</span>
            <div><h3>Bring your people</h3><p>The best part is always who you share it with.</p></div>
            <Link href={`/collections/${kids?.handle ?? collectionHandles.kids}`} aria-label="Explore the kids' collection"><ArrowUpRight size={17} /></Link>
          </article>
        </div>
      </section>

      {articles.length > 0 && (
        <section className="home-journal-section" aria-labelledby="home-journal-title">
          <header className="home-section-heading home-journal-heading">
            <div>
              <span className="home-overline">FIELD NOTES / JOURNAL</span>
              <h2 id="home-journal-title">Stories worth<br /><em>staying for.</em></h2>
            </div>
            <Link href={`/blogs/${journalBlogHandle}`}>ALL JOURNAL STORIES <ArrowRight size={14} /></Link>
          </header>
          <div className="home-journal-grid">
            {articles.slice(0, 3).map((article, index) => (
              <Link className="home-journal-card" href={`/blogs/${journalBlogHandle}/${article.handle}`} key={article.handle}>
                <div className="home-journal-image">
                  {article.image ? (
                    <Image src={imageUrl(article.image.url, 900)} alt={article.image.altText ?? article.title} fill sizes="(max-width: 700px) 90vw, 33vw" />
                  ) : (
                    <Image src={editorialImage(["photo-1529139574466-a303027c1d8b", "photo-1539109136881-3be0616acf4b", "photo-1524504388940-b1c1722653e1"][index], 900)} alt="" fill sizes="(max-width: 700px) 90vw, 33vw" />
                  )}
                  <span><ArrowUpRight size={16} /></span>
                </div>
                <div className="home-journal-meta"><span>{article.blog.title}</span><time dateTime={article.publishedAt}>{new Date(article.publishedAt).toLocaleDateString("en", { month: "long", year: "numeric" })}</time></div>
                <h3>{article.title}</h3>
                <span className="home-journal-read">READ THE STORY <ArrowRight size={13} /></span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="home-shopping-section" aria-labelledby="home-shopping-title">
        <header className="home-shopping-heading">
          <span className="home-overline">A LITTLE MORE PEACE OF MIND</span>
          <h2 id="home-shopping-title">Shop for Oktoberfest 2026 <em>conveniently.</em></h2>
        </header>
        <div className="home-shopping-grid">
          <article className="home-shopping-card">
            <span className="home-shopping-icon"><CreditCard size={21} strokeWidth={1.5} aria-hidden="true" /></span>
            <h3>Payment modes</h3>
            <p>For your ease, we accept credit or debit cards, PayPal, and many other ways to pay.</p>
          </article>
          <article className="home-shopping-card">
            <span className="home-shopping-icon"><ShoppingBag size={21} strokeWidth={1.5} aria-hidden="true" /></span>
            <h3>Simple steps to order</h3>
            <p>Choose your product and size, add your contact details, and place your order.</p>
          </article>
          <article className="home-shopping-card">
            <span className="home-shopping-icon"><Ruler size={21} strokeWidth={1.5} aria-hidden="true" /></span>
            <h3>Exact sizes</h3>
            <p>Share your measurements and we&apos;ll help you find the right fit—even for toddlers.</p>
          </article>
          <article className="home-shopping-card">
            <span className="home-shopping-icon"><BadgeCheck size={21} strokeWidth={1.5} aria-hidden="true" /></span>
            <h3>German quality</h3>
            <p>Our brand is known for its quality, and compromising on it is a big no-no.</p>
          </article>
        </div>
      </section>

      <section className="home-newsletter-section">
        <div className="home-newsletter-brand">A<span>A</span></div>
        <div className="home-newsletter-copy">
          <span className="home-overline">LETTERS FROM THE ALPS</span>
          <h2>A good thing,<br /><em>now and then.</em></h2>
          <p>New arrivals, thoughtful edits, and the occasional note from our corner of the Alps.</p>
        </div>
        <NewsletterForm shopDomain={process.env.SHOPIFY_STORE_DOMAIN} />
      </section>
      <div className="home-colophon"><span>ALPINE ATELIER</span><span>TRADITION, IN A NEW LIGHT</span><MoveUpRight size={15} /></div>
    </main>
  );
}
