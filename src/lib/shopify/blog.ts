import { shopifyFetch } from "./client";
import { BLOG_ARTICLE_QUERY, BLOG_ARTICLES_QUERY } from "./queries";
import type { ShopifyArticle } from "./types";

interface BlogResult {
  blog: { articles: { nodes: ShopifyArticle[] } } | null;
}

export async function getArticles(handle = "news", first = 3): Promise<ShopifyArticle[]> {
  const { blog } = await shopifyFetch<BlogResult>(BLOG_ARTICLES_QUERY, { handle, first });
  return blog?.articles.nodes ?? [];
}

export async function getArticle(blogHandle: string, articleHandle: string): Promise<ShopifyArticle | null> {
  const { blog } = await shopifyFetch<{
    blog: { articleByHandle: ShopifyArticle | null } | null;
  }>(BLOG_ARTICLE_QUERY, { blogHandle, articleHandle });
  return blog?.articleByHandle ?? null;
}
