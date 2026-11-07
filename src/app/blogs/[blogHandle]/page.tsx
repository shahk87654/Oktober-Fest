import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ScanLine } from "lucide-react";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getArticles } from "@/lib/shopify/blog";
import { imageUrl } from "@/lib/format";
import { journalBlogHandle } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ blogHandle: string }> }): Promise<Metadata> {
  const { blogHandle } = await params;
  return blogHandle === journalBlogHandle
    ? { title: "The Alpine Journal", description: "Notes on the pieces, people and traditions that shape Alpine Atelier." }
    : { title: "Journal not found" };
}

export default async function JournalPage({ params }: { params: Promise<{ blogHandle: string }> }) {
  const { blogHandle } = await params;
  if (blogHandle !== journalBlogHandle) return <main className="search-empty"><span className="eyebrow">JOURNAL</span><h2>This journal is elsewhere.</h2></main>;
  const articles = isShopifyConfigured() ? await getArticles(blogHandle, 24) : [];
  const [featuredArticle, ...journalArticles] = articles;
  return <main className="journal-page">
    <header className="journal-masthead">
      <div className="journal-page-heading"><span className="eyebrow">NOTES FROM THE MOUNTAINS</span><h1>The Alpine<br /><em>Journal.</em></h1><p>Stories of heritage, getting dressed, and the moments in between.</p></div>
      <div className="journal-masthead-index"><span><ScanLine size={13} /> FIELD ARCHIVE</span><strong>ISSUE <i>01</i></strong><span><i /> LIVE / SHOPIFY JOURNAL</span></div>
    </header>
    {featuredArticle ? <>
      <Link className="journal-featured" href={`/blogs/${blogHandle}/${featuredArticle.handle}`}>
        <div className="journal-featured-image">
          {featuredArticle.image && <Image src={imageUrl(featuredArticle.image.url, 1600)} alt={featuredArticle.image.altText ?? featuredArticle.title} fill priority sizes="(max-width: 700px) 100vw, 68vw" />}
          <span className="journal-featured-number"><ScanLine size={13} /> STORY / 01 <i /> LATEST ENTRY</span>
          <span className="journal-featured-arrow"><ArrowUpRight size={19} /></span>
        </div>
        <div className="journal-featured-copy">
          <div className="journal-meta"><span>{featuredArticle.blog.title}</span><time dateTime={featuredArticle.publishedAt}>{new Date(featuredArticle.publishedAt).toLocaleDateString("en", { month: "long", year: "numeric" })}</time></div>
          <span className="eyebrow"><i /> TRANSMISSION / ATELIER JOURNAL</span>
          <h2>{featuredArticle.title}</h2>
          {featuredArticle.excerpt && <p>{featuredArticle.excerpt}</p>}
          <span className="journal-read">OPEN STORY FILE <ArrowRight size={14} /></span>
        </div>
      </Link>
      {journalArticles.length > 0 && <section className="journal-archive" aria-labelledby="journal-archive-title">
        <header className="journal-archive-heading"><div><span className="eyebrow">MORE FROM THE ATELIER</span><h2 id="journal-archive-title">The story <em>continues.</em></h2></div><span>{String(journalArticles.length).padStart(2, "0")} ENTRIES</span></header>
        <div className="journal-page-grid">{journalArticles.map((article, index) => <Link className="journal-page-card" href={`/blogs/${blogHandle}/${article.handle}`} key={article.handle}>
          <div className="journal-page-image">{article.image && <Image src={imageUrl(article.image.url, 900)} alt={article.image.altText ?? article.title} fill sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw" />}<span><ArrowUpRight size={17} /></span><small>{String(index + 2).padStart(2, "0")}</small></div>
          <div className="journal-meta"><span>{article.blog.title}</span><time dateTime={article.publishedAt}>{new Date(article.publishedAt).toLocaleDateString("en", { month: "long", year: "numeric" })}</time></div>
          <h3>{article.title}</h3>{article.excerpt && <p>{article.excerpt}</p>}<span className="journal-read">READ THE STORY <ArrowRight size={13} /></span>
        </Link>)}</div>
      </section>}
    </> : <div className="search-empty"><span className="eyebrow">A NOTE FROM THE ATELIER</span><h2>Stories will find<br />their way here.</h2><p>Journal stories are managed through the Shopify News blog.</p></div>}
  </main>;
}
