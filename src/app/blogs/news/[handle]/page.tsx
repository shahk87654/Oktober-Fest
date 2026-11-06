import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { getArticle } from "@/lib/shopify/storefront";
import { env, shopifyConfigured } from "@/lib/env";
import { sanitizeShopifyHtml } from "@/lib/html";

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const article = shopifyConfigured ? await getArticle("news", handle) : null;
  return {
    title: article?.title ?? handle.replaceAll("-", " "),
    description: article?.excerpt,
    alternates: { canonical: `/blogs/news/${handle}` },
    openGraph: article?.image ? { type: "article", images: [{ url: article.image.url, alt: article.image.altText ?? article.title }] } : undefined,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { handle } = await params;
  const article = shopifyConfigured ? await getArticle("news", handle) : null;
  if (shopifyConfigured && !article) notFound();
  if (!article) return <div className="page-shell article-empty"><p className="eyebrow">The journal</p><h1 className="display">Connect Shopify to read this story.</h1><Link href="/blogs/news" className="link-underline">Back to the journal</Link><style>{`.article-empty { min-height:50vh; padding-block:4rem; }.article-empty h1 { max-width:800px; font-size:clamp(3rem,7vw,6rem); }`}</style></div>;
  const url = `${env.NEXT_PUBLIC_SITE_URL}/blogs/news/${article.handle}`;
  const words = article.contentHtml.replace(/<[^>]+>/g, "").trim().split(/\s+/).filter(Boolean).length;
  const schema = {
    "@context": "https://schema.org", "@type": "Article",
    headline: article.title, description: article.excerpt, datePublished: article.publishedAt,
    author: { "@type": "Person", name: article.author.name },
    image: article.image?.url, mainEntityOfPage: url, publisher: { "@type": "Organization", name: "Wiesn Atelier" },
  };
  return (
    <article className="article-page">
      <JsonLd data={schema} />
      <header className="page-shell article-header"><nav aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/blogs/news">The Journal</Link><span>/</span><span>{article.title}</span></nav><p className="eyebrow">{article.blog.title} · {Math.max(1, Math.ceil(words / 220))} min read</p><h1 className="display">{article.title}</h1><p className="article-excerpt">{article.excerpt}</p><p className="article-byline">Words by {article.author.name} · {new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date(article.publishedAt))}</p></header>
      {article.image && <div className="article-cover"><Image src={article.image.url} alt={article.image.altText ?? article.title} fill priority sizes="100vw" /></div>}
      <div className="article-body content-body" dangerouslySetInnerHTML={{ __html: sanitizeShopifyHtml(article.contentHtml) }} />
      <footer className="page-shell article-footer"><Link href="/blogs/news" className="button-secondary">More from the journal</Link></footer>
      <style>{`
        .article-header { padding-block:2rem 3rem; }.article-header nav { display:flex; gap:.55rem; margin-bottom:3rem; font-size:.66rem; }.article-header nav span { color:var(--muted); }.article-header>.eyebrow { color:var(--pretzel); }
        .article-header h1 { max-width:950px; margin:.6rem 0 1rem; font-size:clamp(3rem,8vw,7rem); line-height:.94; }.article-excerpt { max-width:700px; margin:0; color:var(--hops); font-family:var(--font-display); font-size:clamp(1.2rem,2.4vw,1.8rem); line-height:1.4; }.article-byline { margin:1.2rem 0 0; color:var(--muted); font-size:.7rem; }
        .article-cover { position:relative; height:min(62vw,700px); min-height:340px; }.article-cover img { object-fit:cover; }.article-body { max-width:760px; margin:4rem auto; padding-inline:24px; color:#454940; font-size:.9rem; line-height:1.9; }.article-body h2 { margin-top:2.5rem; color:var(--forest); font-family:var(--font-display); font-size:2.4rem; }.article-body img { max-width:100%; height:auto; }.article-footer { padding-bottom:5rem; }
      `}</style>
    </article>
  );
}
