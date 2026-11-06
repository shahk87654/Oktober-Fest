import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowRight, Check, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { HeroCarousel } from "@/components/hero-carousel";
import { ProductRail } from "@/components/product-rail";
import { FestivalCountdown } from "@/components/festival-countdown";
import { getArticles, getCollection, getMetaobject, getMetaobjects, getShopBrand } from "@/lib/shopify/storefront";
import { shopifyConfigured } from "@/lib/env";

const outfits = [
  { title: "For him", label: "The modern classic", href: "/collections/lederhosen-men", collection: "men" },
  { title: "For her", label: "A little more dirndl", href: "/collections/dirndl", collection: "women" },
  { title: "For the little ones", label: "Big day, little outfit", href: "/collections/kids", collection: "kids" },
] as const;
const womenTiles = [
  { title: "Dirndl", href: "/collections/dirndl", className: "women-large", collection: "dirndl" },
  { title: "Jackets", href: "/collections/women-jackets-sweaters", className: "", collection: "jackets" },
  { title: "Blouses", href: "/collections/blouses", className: "", collection: "blouses" },
  { title: "Shoes", href: "/collections/dirndl-shoes", className: "women-wide", collection: "shoes" },
] as const;
const values = [
  ["A fit that feels like yours", "Thoughtful sizing and a real person to help you get it right."],
  ["Materials worth knowing", "Honest details on the leather, cloth and craft behind every piece."],
  ["Ready for the long haul", "Wear it often. Mend it well. Pass it along when the time comes."],
  ["A little more human", "From our first hello to the last dance, we’re here for the details."],
  ["Made to make memories", "The best outfit is the one you forget you’re wearing."],
];

export default async function HomePage() {
  const [
    lederhosenCollection,
    dirndlCollection,
    articles,
    heroContent,
    countdown,
    homeSections,
    menCollection,
    womenCollection,
    kidsCollection,
    jacketsCollection,
    blousesCollection,
    shoesCollection,
    shop,
  ] = shopifyConfigured
    ? await Promise.all([
        getCollection("lederhosen-men", { first: 8 }),
        getCollection("dirndl", { first: 8 }),
        getArticles("news", 3),
        Promise.all([1, 2, 3].map((number) => getMetaobject<{ id: string; kicker?: string; title?: string; alt_text?: string; desktop_image_url?: string; mobile_image_url?: string; cta_label?: string; cta_url?: string }>("hero_slide", `hero-${number}`))).then((slides) => slides.filter((slide): slide is NonNullable<typeof slide> => Boolean(slide))),
        getMetaobject<{ id: string; target_date?: string; end_date?: string; title?: string; ended_title?: string }>("countdown_config", "oktoberfest"),
        getMetaobjects<{ id: string; handle: string; section_type?: string; heading?: string; body?: string; image_url?: string; cta_label?: string; cta_url?: string }>("home_section", 20),
        getCollection("men", { first: 4 }),
        getCollection("women", { first: 4 }),
        getCollection("kids", { first: 4 }),
        getCollection("women-jackets-sweaters", { first: 4 }),
        getCollection("blouses", { first: 4 }),
        getCollection("dirndl-shoes", { first: 4 }),
        getShopBrand(),
      ])
    : [null, null, [], [], null, [], null, null, null, null, null, null, null];
  const lederhosen = lederhosenCollection?.products.nodes ?? [];
  const dirndl = dirndlCollection?.products.nodes ?? [];
  const collectionImage = (collection: typeof menCollection) =>
    collection?.image ?? collection?.products.nodes.find((product) => product.featuredImage)?.featuredImage ?? null;
  const collectionImages = {
    men: collectionImage(menCollection),
    women: collectionImage(womenCollection),
    kids: collectionImage(kidsCollection),
    dirndl: collectionImage(dirndlCollection),
    jackets: collectionImage(jacketsCollection),
    blouses: collectionImage(blousesCollection),
    shoes: collectionImage(shoesCollection),
  };
  const heroImages = [collectionImages.men?.url ?? null, collectionImages.women?.url ?? null, collectionImages.kids?.url ?? null];
  const featureSection = homeSections.find((section) => section.section_type === "feature_banner");
  const featureImage = safeShopifyImageUrl(featureSection?.image_url) ?? collectionImage(lederhosenCollection)?.url ?? null;
  const featureHref = featureSection?.cta_url?.startsWith("/") && !featureSection.cta_url.startsWith("//") ? featureSection.cta_url : "/collections/all";

  return (
    <>
      <HeroCarousel content={heroContent} fallbackImages={heroImages} />
      <section className="page-shell section-pad outfit-section">
        <div className="section-heading"><div><p className="eyebrow">A good place to start</p><h2 className="display">Find your perfect outfit.</h2></div><p className="section-intro">The right thing to wear has a way of making a day feel like an occasion.</p></div>
        <div className="outfit-grid">
          {outfits.map((item, index) => (
            <Link href={item.href} className="outfit-tile" key={item.title}>
              {collectionImages[item.collection] ? (
                <Image src={collectionImages[item.collection]!.url} alt={collectionImages[item.collection]!.altText ?? item.title} fill sizes="(max-width: 700px) 90vw, 33vw" />
              ) : <span className="collection-art" aria-hidden="true" />}
              <span className="outfit-tile__shade" /><span className="outfit-tile__index">0{index + 1}</span>
              <span className="outfit-tile__text"><small>{item.label}</small><strong className="display">{item.title}</strong><i aria-hidden="true"><ArrowDownRight size={21} /></i></span>
            </Link>
          ))}
        </div>
      </section>
      <ProductRail eyebrow="The Wiesn essentials" title="Our latest lederhosen." products={lederhosen} href="/collections/lederhosen-men" emptyMessage="New pieces are being stitched into the collection." />
      <section className="page-shell section-pad women-section">
        <div className="section-heading"><div><p className="eyebrow">Made for your own kind of tradition</p><h2 className="display">Best of the women&apos;s collections.</h2></div><Link href="/collections/women" className="text-link">Explore all <ArrowRight size={15} /></Link></div>
        <div className="women-bento">
          {womenTiles.map((tile) => (
            <Link key={tile.title} href={tile.href} className={`women-tile ${tile.className}`}>
              {collectionImages[tile.collection] ? (
                <Image src={collectionImages[tile.collection]!.url} alt={collectionImages[tile.collection]!.altText ?? tile.title} fill sizes="(max-width: 700px) 90vw, 45vw" />
              ) : <span className="collection-art" aria-hidden="true" />}
              <span className="women-tile__title">{tile.title}<ArrowRight size={17} /></span>
            </Link>
          ))}
        </div>
      </section>
      <section className="story-section grain">
        <div className="page-shell story-inner">
          <div><p className="eyebrow">A note from the foothills</p><h2 className="display">Tradition is a feeling.<br /><i>We make the clothes.</i></h2></div>
          <div className="story-copy">
            <p>Oktoberfest is more than a place or a season. It’s the warmth of a table that makes room, the brass band finding its rhythm, and the familiar comfort of something made to be worn again.</p>
            <p>At {shop?.name ?? "Wiesn Atelier"}, we bring that generous Bavarian spirit to pieces with a modern point of view. We look for honest materials, thoughtful details and clothes that feel as good on their tenth outing as their first.</p>
            <details><summary>Our approach to Tracht <span>+</span></summary><p>We believe heritage is something you live in, not something you put behind glass. Our collections take cues from traditional Bavarian dress and make space for the way people celebrate today: comfortably, confidently, and in their own style.</p></details>
            <Link href="/pages/about" className="link-underline">A little more about us</Link>
          </div>
        </div>
      </section>
      <ProductRail eyebrow="A fresh take on tradition" title="Latest dirndl additions." products={dirndl} href="/collections/dirndl" emptyMessage="Our dirndl edit is coming together. Check back soon." />
      <section className="feature-banner">
        {featureImage ? <Image src={featureImage} alt={featureSection?.heading ?? "Shopify product from the lederhosen collection"} fill sizes="100vw" /> : <span className="collection-art" aria-hidden="true" />}
        <div className="feature-banner__shade" />
        <div className="page-shell feature-banner__content"><p className="eyebrow">For the people who make the party</p><h2 className="display">{featureSection?.heading ?? <>The best part is<br />who you share it with.</>}</h2>{featureSection?.body && <p>{featureSection.body}</p>}<Link className="button-primary" href={featureHref}>{featureSection?.cta_label ?? "Shop all collections"} <ArrowRight size={16} /></Link></div>
      </section>
      <section className="page-shell section-pad why-section">
        <div className="why-image">{collectionImages.women ? <Image src={collectionImages.women.url} alt={collectionImages.women.altText ?? "Shopify product from the women's collection"} fill sizes="(max-width: 700px) 100vw, 50vw" /> : <span className="collection-art" aria-hidden="true" />}<span className="why-image__note display">Good clothes.<br />Better company.</span></div>
        <div className="why-copy"><p className="eyebrow">A few things we believe</p><h2 className="display">Why choose us?</h2><ul>{values.map(([title, detail]) => <li key={title}><span><Check size={16} /></span><div><strong>{title}</strong><p>{detail}</p></div></li>)}</ul><Link href="/pages/materials" className="button-secondary">Get to know our materials <ArrowRight size={15} /></Link></div>
        <div className="material-strip">
          {["Cowskin", "Goatskin", "Deerskin", "Cotton", "Silk", "Wool"].map((material, index) => (
            <Link key={material} href={`/pages/${material.toLowerCase()}-${index < 3 ? "leather" : "fabric"}`}><i style={{ ["--material-color" as string]: ["#99775a", "#b98c4e", "#685344", "#d9d4c7", "#e7d8c9", "#75796b"][index] }} /><span>{material}</span></Link>
          ))}
        </div>
      </section>
      <FestivalCountdown
        targetIso={countdown?.target_date ?? "2027-09-18T10:00:00+02:00"}
        endIso={countdown?.end_date ?? "2027-10-03T23:59:59+02:00"}
        title={countdown?.title}
        endedTitle={countdown?.ended_title}
      />
      <section className="page-shell section-pad magazine">
        <div className="section-heading"><div><p className="eyebrow">Stories from around the table</p><h2 className="display">The Wiesn journal.</h2></div><Link href="/blogs/news" className="text-link">Read the journal <ArrowRight size={15} /></Link></div>
        {articles.length ? <div className="article-grid">{articles.map((article) => <Link className="article-card" href={`/blogs/news/${article.handle}`} key={article.id}><div className="article-card__image">{article.image && <Image src={article.image.url} alt={article.image.altText ?? article.title} fill sizes="(max-width: 700px) 90vw, 33vw" />}</div><p className="eyebrow">Bavarian notes · 4 min read</p><h3 className="display">{article.title}</h3><span>Keep reading <ArrowRight size={14} /></span></Link>)}</div> : <div className="magazine-empty"><Sparkles size={20} /><span>New stories are on their way from the journal.</span><Link href="/blogs/news">Visit the magazine</Link></div>}
      </section>
      <section className="trust-band">
        <div className="page-shell trust-grid">
          {[["Payment modes", "A secure checkout, your way.", ShieldCheck], ["Simple steps", "From first look to front door.", ArrowRight], ["Exact sizes", "Find the fit that feels right.", Sparkles], ["German quality", "Thoughtful details, built to last.", Leaf]].map(([title, detail, Icon]) => {
            const TrustIcon = Icon;
            return <div key={title as string}><TrustIcon size={22} strokeWidth={1.4} /><strong>{title as string}</strong><span>{detail as string}</span></div>;
          })}
        </div>
      </section>
      <style>{`
        .section-intro { max-width:270px; margin:0; color:var(--muted); font-family:var(--font-display); font-size:1.1rem; line-height:1.35; }
        .outfit-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; }
        .outfit-tile { position:relative; display:block; min-height:430px; overflow:hidden; border-radius:14px; background:#c9c3b4; color:white; }
        .collection-art { position:absolute; inset:0; background:radial-gradient(ellipse at 75% 30%,rgba(0,152,212,.45),transparent 30%),linear-gradient(125deg,#14211a 6%,#2f4a2b 58%,#7a4a25); }
        .outfit-tile img { object-fit:cover; transition:transform .6s; }
        .outfit-tile:hover img { transform:scale(1.04); }
        .outfit-tile__shade { position:absolute; inset:0; background:linear-gradient(0deg,rgba(15,26,19,.78),transparent 64%); }
        .outfit-tile::after { position:absolute; inset:0; content:""; opacity:0; background-image:url("data:image/svg+xml,%3Csvg width='34' height='34' viewBox='0 0 34 34' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 17 17 0l17 17-17 17z' fill='none' stroke='%23fff' stroke-opacity='.55'/%3E%3C/svg%3E"); background-size:34px; transition:opacity .25s; }
        .outfit-tile:hover::after { opacity:.24; }
        .outfit-tile__index { position:absolute; top:1.3rem; left:1.3rem; font-size:.7rem; letter-spacing:.15em; }
        .outfit-tile__text { position:absolute; right:1.4rem; bottom:1.6rem; left:1.4rem; display:grid; grid-template-columns:1fr auto; align-items:end; }
        .outfit-tile__text small { grid-column:span 2; margin-bottom:.35rem; font-size:.62rem; letter-spacing:.15em; text-transform:uppercase; }
        .outfit-tile__text strong { font-size:2.6rem; line-height:1; }
        .outfit-tile__text i { display:grid; width:40px; height:40px; place-items:center; border:1px solid rgba(255,255,255,.7); border-radius:50%; font-style:normal; }
        .women-bento { display:grid; grid-template-columns:1.3fr 1fr 1fr; grid-template-rows:250px 250px; gap:1rem; }
        .women-tile { position:relative; min-width:0; overflow:hidden; border-radius:14px; background:#ddd4c4; }
        .women-tile img { object-fit:cover; transition:transform .55s; }
        .women-tile:hover img { transform:scale(1.04); }.women-large { grid-row:span 2; }.women-wide { grid-column:span 2; }
        .women-tile__title { position:absolute; right:1rem; bottom:1rem; left:1rem; display:flex; align-items:center; justify-content:space-between; border-radius:8px; padding:.85rem 1rem; background:rgba(246,240,228,.9); font-family:var(--font-display); font-size:1.25rem; }
        .story-section { background:#ece8dd; }.story-inner { display:grid; grid-template-columns:1fr 1fr; gap:clamp(3rem,10vw,9rem); padding-block:clamp(4rem,8vw,8rem); }
        .story-inner h2 { margin:1rem 0; font-size:clamp(2.6rem,6vw,5.5rem); line-height:.95; }.story-inner h2 i { color:var(--pretzel); font-weight:400; }
        .story-copy { max-width:560px; color:#454940; font-size:.91rem; line-height:1.8; }.story-copy details { margin:1rem 0 1.4rem; border-block:1px solid var(--line); }
        .story-copy summary { display:flex; justify-content:space-between; padding:.85rem 0; color:var(--forest); font-weight:650; cursor:pointer; }.story-copy summary span { color:var(--pretzel); }
        .story-copy details p { margin:.1rem 0 1rem; }.story-copy .link-underline { font-size:.78rem; font-weight:700; }
        .feature-banner { position:relative; min-height:540px; overflow:hidden; color:white; background:#2f4a2b; }.feature-banner img { object-fit:cover; object-position:center 48%; }
        .feature-banner__shade { position:absolute; inset:0; background:linear-gradient(90deg,rgba(20,33,26,.76),rgba(20,33,26,.06)); }
        .feature-banner__content { position:relative; display:flex; min-height:540px; align-items:flex-start; justify-content:center; flex-direction:column; }
        .feature-banner__content .eyebrow { color:#eadcb8; }.feature-banner__content h2 { margin:1rem 0 1.8rem; font-size:clamp(3.2rem,7vw,6.7rem); line-height:.94; }
        .feature-banner__content .button-primary { border-color:var(--gold); background:var(--gold); color:var(--forest); }
        .why-section { display:grid; grid-template-columns:1fr 1fr; gap:3rem 6rem; align-items:center; }
        .why-image { position:relative; min-height:600px; overflow:hidden; border-radius:14px; background:#d3d0c3; }.why-image img { object-fit:cover; }
        .why-image__note { position:absolute; right:1.1rem; bottom:1.1rem; padding:1rem; background:var(--cream); color:var(--hops); font-size:1.55rem; line-height:1.05; }
        .why-copy h2 { margin:.7rem 0 1.4rem; font-size:clamp(2.7rem,5vw,4.6rem); }.why-copy ul { display:flex; flex-direction:column; gap:.9rem; margin:0 0 1.6rem; padding:0; list-style:none; }
        .why-copy li { display:flex; gap:.8rem; align-items:flex-start; }.why-copy li>span { display:grid; width:27px; height:27px; flex:0 0 27px; place-items:center; border:1px dashed var(--pretzel); border-radius:50%; color:var(--hops); }
        .why-copy li strong { font-size:.83rem; }.why-copy li p { margin:.2rem 0 0; color:var(--muted); font-size:.75rem; line-height:1.5; }
        .material-strip { display:grid; grid-column:span 2; grid-template-columns:repeat(6,1fr); border-block:1px dashed rgba(122,74,37,.4); padding-block:1.3rem; }
        .material-strip a { display:flex; align-items:center; justify-content:center; gap:.55rem; font-size:.7rem; }.material-strip i { width:25px; height:25px; border:3px solid rgba(255,255,255,.65); border-radius:50%; background:var(--material-color); box-shadow:0 0 0 1px var(--line); }
        .article-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; }.article-card__image { position:relative; overflow:hidden; aspect-ratio:4/3; border-radius:14px; background:#e9e3d6; }
        .article-card__image img { object-fit:cover; }.article-card .eyebrow { margin:1rem 0 .45rem; color:var(--pretzel); }.article-card h3 { margin:.4rem 0 .8rem; font-size:1.7rem; line-height:1.05; }
        .article-card>span { display:flex; align-items:center; gap:.5rem; font-size:.7rem; font-weight:700; }.magazine-empty { display:flex; min-height:140px; align-items:center; justify-content:center; gap:1rem; border-block:1px dashed var(--line); color:var(--hops); font-family:var(--font-display); font-size:1.25rem; }
        .magazine-empty a { font:700 .7rem var(--font-ui); text-decoration:underline; text-decoration-color:var(--gold); text-underline-offset:4px; }
        .trust-band { padding-block:2.1rem; background:#eae5d8; }.trust-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }.trust-grid>div { display:grid; grid-template-columns:32px 1fr; gap:.25rem .7rem; align-items:center; }
        .trust-grid svg { grid-row:span 2; color:var(--hops); }.trust-grid strong { font-size:.72rem; }.trust-grid span { color:var(--muted); font-size:.66rem; }
        .text-link { display:inline-flex; align-items:center; gap:.45rem; font-size:.7rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
        @media(max-width:800px) { .outfit-tile { min-height:360px; }.why-section { gap:2.5rem; }.why-image { min-height:480px; }.women-bento { grid-template-rows:200px 200px; } }
        @media(max-width:650px) {
          .outfit-grid { grid-template-columns:1fr; }.outfit-tile { min-height:420px; }.women-bento { grid-template-columns:1fr 1fr; grid-template-rows:300px 190px 190px; }
          .women-large { grid-row:span 1; grid-column:span 2; }.women-wide { grid-column:span 2; }.story-inner { grid-template-columns:1fr; gap:1rem; }
          .why-section { grid-template-columns:1fr; gap:2rem; }.why-image { min-height:450px; }.material-strip { grid-column:span 1; grid-template-columns:repeat(3,1fr); gap:1.2rem .3rem; }
          .article-grid { grid-template-columns:1fr; gap:2rem; }.trust-grid { grid-template-columns:1fr 1fr; gap:1.5rem .7rem; }.magazine-empty { align-items:flex-start; flex-direction:column; padding:1rem; }
        }

      `}</style>
    </>
  );
}

function safeShopifyImageUrl(value?: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "cdn.shopify.com" || url.hostname.endsWith(".myshopify.com"))
      ? url.toString()
      : null;
  } catch (error) {
    if (error instanceof TypeError) return null;
    throw error;
  }
}
