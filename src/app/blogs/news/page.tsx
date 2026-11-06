import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getArticles } from "@/lib/shopify/storefront";
import { shopifyConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "The Wiesn Journal",
  description: "Bavarian stories, useful style notes and a few good reasons to get together.",
  alternates: { canonical: "/blogs/news" },
};

export default async function NewsIndexPage() {
  const articles = shopifyConfigured ? await getArticles("news", 24) : [];
  return (
    <section className="page-shell journal">
      <p className="eyebrow">From around the table</p><h1 className="display">The Wiesn journal.</h1><p className="journal-intro">Bavarian stories, a little guidance and the details that make a gathering feel like yours.</p>
      {articles.length ? <div className="journal-grid">{articles.map((article, index) => <Link className={`journal-card${index === 0 ? " journal-featured" : ""}`} href={`/blogs/news/${article.handle}`} key={article.id}><div className="journal-image">{article.image && <Image src={article.image.url} alt={article.image.altText ?? article.title} fill sizes="(max-width:700px) 90vw, 45vw" />}</div><p className="eyebrow">{new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date(article.publishedAt))} · {Math.max(1, Math.ceil(article.contentHtml.replace(/<[^>]+>/g, "").split(/\s+/).length / 220))} min read</p><h2 className="display">{article.title}</h2><p>{article.excerpt}</p><span>Read story ↗</span></Link>)}</div> : <div className="journal-empty lozenge"><h2 className="display">Stories are being gathered.</h2><p>{shopifyConfigured ? "Our latest notes will be here soon." : "Connect the Storefront API to publish Shopify articles here."}</p><Link className="link-underline" href="/">Back to the atelier</Link></div>}
      <style>{`
        .journal { padding-block:5rem 7rem; }.journal>.eyebrow { color:var(--pretzel); }.journal h1 { margin:.5rem 0 1rem; font-size:clamp(3.2rem,8vw,7rem); }.journal-intro { max-width:540px; margin:0 0 2.5rem; color:var(--muted); font-family:var(--font-display); font-size:1.35rem; line-height:1.4; }
        .journal-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:3rem 1rem; }.journal-card { display:block; }.journal-featured { grid-column:span 2; }.journal-image { position:relative; overflow:hidden; aspect-ratio:4/3; border-radius:14px; background:#e9e3d6; }.journal-featured .journal-image { aspect-ratio:2.1/1; }.journal-image img { object-fit:cover; transition:transform .4s; }.journal-card:hover .journal-image img { transform:scale(1.025); }
        .journal-card>.eyebrow { margin:1rem 0 .45rem; color:var(--pretzel); }.journal-card h2 { margin:.4rem 0; font-size:clamp(1.6rem,3vw,2.8rem); }.journal-card>p:not(.eyebrow) { color:var(--muted); font-size:.78rem; line-height:1.6; }.journal-card>span { font-size:.68rem; font-weight:700; }
        .journal-empty { display:grid; min-height:300px; place-content:center; gap:.3rem; border-radius:14px; text-align:center; }.journal-empty h2 { margin:0; }.journal-empty p { color:var(--muted); }.journal-empty a { justify-self:center; font-size:.75rem; }
        @media(max-width:650px) { .journal-grid { grid-template-columns:1fr; gap:2rem; }.journal-featured { grid-column:span 1; }.journal-featured .journal-image { aspect-ratio:4/3; } }
      `}</style>
    </section>
  );
}
