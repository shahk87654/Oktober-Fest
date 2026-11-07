import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getArticle } from "@/lib/shopify/blog";
import { imageUrl } from "@/lib/format";
import { journalBlogHandle } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ blogHandle: string; handle: string }> }): Promise<Metadata> {
  const { blogHandle, handle } = await params;
  if (blogHandle !== journalBlogHandle) return { title: "Story not found" };
  if (!isShopifyConfigured()) return { title: "Journal" };
  const article = await getArticle(blogHandle, handle);
  return article ? { title: article.title, description: article.excerpt, alternates: { canonical: `/blogs/${blogHandle}/${article.handle}` } } : { title: "Story not found" };
}

export default async function JournalArticlePage({ params }: { params: Promise<{ blogHandle: string; handle: string }> }) {
  const { blogHandle, handle } = await params;
  if (blogHandle !== journalBlogHandle) notFound();
  if (!isShopifyConfigured()) return <main className="store-setup"><span className="eyebrow">FROM THE JOURNAL</span><h1>A story<br /><em>in the making.</em></h1></main>;
  const article = await getArticle(blogHandle, handle);
  if (!article) notFound();
  return <main className="article-page">
    <Link href={`/blogs/${blogHandle}`} className="article-back"><ArrowLeft size={14} /> THE ALPINE JOURNAL</Link>
    <header><span className="eyebrow">{article.blog.title} · {new Date(article.publishedAt).toLocaleDateString("en", { month: "long", year: "numeric" })}</span><h1>{article.title}</h1>{article.excerpt && <p>{article.excerpt}</p>}</header>
    {article.image && <div className="article-hero-image"><Image src={imageUrl(article.image.url, 1800)} alt={article.image.altText ?? article.title} fill priority sizes="100vw" /></div>}
    <article className="article-content" dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
  </main>;
}
