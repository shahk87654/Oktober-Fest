import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Sparkles } from "lucide-react";
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
  if (blogHandle !== journalBlogHandle) {
    return (
      <main className="search-empty text-center py-20">
        <span className="eyebrow">
          <i /> JOURNAL
        </span>
        <h2 className="font-serif text-3xl font-medium mt-3">This journal is elsewhere.</h2>
      </main>
    );
  }

  const articles = isShopifyConfigured() ? await getArticles(blogHandle, 24) : [];
  const [featuredArticle, ...journalArticles] = articles;

  return (
    <main className="journal-page">
      <header className="journal-masthead">
        <div className="journal-page-heading">
          <span className="eyebrow">
            <i /> NOTES FROM THE BAVARIAN ALPS
          </span>
          <h1>
            The Alpine <em>Journal.</em>
          </h1>
          <p className="text-slate-600 text-base max-w-lg mt-2">
            Stories of craftsmanship, festive culture, and the art of dressing for memorable occasions.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
            ATELIER FIELD ARCHIVE
          </span>
          <span className="text-emerald-700 font-bold text-xs">VOLUME 2026</span>
        </div>
      </header>

      {featuredArticle ? (
        <>
          <Link className="journal-featured group" href={`/blogs/${blogHandle}/${featuredArticle.handle}`}>
            <div className="journal-featured-image">
              {featuredArticle.image ? (
                <Image
                  src={imageUrl(featuredArticle.image.url, 1600)}
                  alt={featuredArticle.image.altText ?? featuredArticle.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 60vw"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                  <BookOpen size={48} />
                </div>
              )}
            </div>
            <div className="journal-featured-copy">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800 tracking-wider mb-2">
                <span>{featuredArticle.blog.title}</span>
                <time dateTime={featuredArticle.publishedAt} className="text-slate-400 font-medium">
                  {new Date(featuredArticle.publishedAt).toLocaleDateString("en", {
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              </div>
              <span className="eyebrow text-[10px]">
                <i /> FEATURED ARTICLE
              </span>
              <h2>{featuredArticle.title}</h2>
              {featuredArticle.excerpt && <p>{featuredArticle.excerpt}</p>}
              <span className="button button-dark self-start text-xs inline-flex items-center gap-2">
                <span>READ STORY</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </Link>

          {journalArticles.length > 0 && (
            <section className="journal-archive pt-12" aria-labelledby="journal-archive-title">
              <header className="flex items-end justify-between mb-8 pb-4 border-b border-slate-200">
                <div>
                  <span className="eyebrow">
                    <i /> MORE STORIES
                  </span>
                  <h2 id="journal-archive-title" className="font-serif text-3xl font-medium mt-1 mb-0">
                    The chronicle <em>continues.</em>
                  </h2>
                </div>
                <span className="text-xs text-slate-500 font-bold tracking-wider">
                  {journalArticles.length} STORIES
                </span>
              </header>

              <div className="journal-page-grid">
                {journalArticles.map((article) => (
                  <Link
                    className="journal-page-card"
                    href={`/blogs/${blogHandle}/${article.handle}`}
                    key={article.handle}
                  >
                    <div className="journal-page-image">
                      {article.image ? (
                        <Image
                          src={imageUrl(article.image.url, 900)}
                          alt={article.image.altText ?? article.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                          <BookOpen size={24} />
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between text-xs text-slate-400 font-medium mb-2">
                        <span>{article.blog.title}</span>
                        <time dateTime={article.publishedAt}>
                          {new Date(article.publishedAt).toLocaleDateString("en", {
                            month: "short",
                            year: "numeric",
                          })}
                        </time>
                      </div>
                      <h3 className="font-serif text-xl font-medium text-slate-900 mb-2 leading-snug">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                          {article.excerpt}
                        </p>
                      )}
                      <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 tracking-wider">
                        <span>READ ARTICLE</span>
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="search-empty text-center py-20 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Sparkles size={28} />
          </div>
          <span className="eyebrow">
            <i /> JOURNAL ARCHIVE
          </span>
          <h2 className="font-serif text-3xl font-medium mt-2 mb-2">Stories are in preparation.</h2>
          <p className="text-slate-500 text-sm">
            Journal articles will appear here once published in your Shopify store.
          </p>
        </div>
      )}
    </main>
  );
}
