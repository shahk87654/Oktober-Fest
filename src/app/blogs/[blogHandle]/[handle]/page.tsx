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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ blogHandle: string; handle: string }>;
}): Promise<Metadata> {
  const { blogHandle, handle } = await params;
  if (!isShopifyConfigured()) return { title: "Journal" };
  
  const article = await getArticle(blogHandle, handle);
  if (!article) return { title: "Story not found" };

  return {
    title: article.title,
    description: article.excerpt || undefined,
    alternates: { canonical: `/blogs/${blogHandle}/${article.handle}` },
    openGraph: {
      title: article.title,
      description: article.excerpt || undefined,
      images: article.image ? [article.image.url] : undefined,
    },
  };
}

export default async function JournalArticlePage({
  params,
}: {
  params: Promise<{ blogHandle: string; handle: string }>;
}) {
  const { blogHandle, handle } = await params;

  if (!isShopifyConfigured()) {
    return (
      <main className="store-setup flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <span className="eyebrow">
          <i /> ATELIER JOURNAL
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium mt-3 text-slate-900">
          A story <em>in the making.</em>
        </h1>
      </main>
    );
  }

  const article = await getArticle(blogHandle, handle);
  if (!article) notFound();

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <Link
        href={`/blogs/${blogHandle}`}
        className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-emerald-800 hover:text-emerald-950 uppercase mb-8 transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to Alpine Journal</span>
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          <span>{article.blog.title}</span>
          <span>•</span>
          <time dateTime={article.publishedAt}>
            {new Date(article.publishedAt).toLocaleDateString("en", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-medium text-slate-900 leading-[1.1] mb-6">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed border-l-2 border-emerald-700 pl-4">
            {article.excerpt}
          </p>
        )}
      </header>

      {article.image && (
        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-lg mb-10 bg-slate-100">
          <Image
            src={imageUrl(article.image.url, 1800)}
            alt={article.image.altText ?? article.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover"
          />
        </div>
      )}

      <article
        className="prose prose-slate prose-lg max-w-none leading-relaxed text-slate-700"
        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
      />

      <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center">
        <Link
          href={`/blogs/${blogHandle}`}
          className="button button-outline text-xs inline-flex items-center gap-2"
        >
          <ArrowLeft size={14} />
          <span>MORE JOURNAL STORIES</span>
        </Link>
        <Link
          href="/collections"
          className="button button-dark text-xs inline-flex items-center gap-2"
        >
          <span>EXPLORE COLLECTIONS</span>
        </Link>
      </div>
    </main>
  );
}
