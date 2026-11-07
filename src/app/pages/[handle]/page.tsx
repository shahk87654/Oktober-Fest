import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getShopPage } from "@/lib/shopify/content";
import { ContactForm } from "@/components/contact-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  if (handle === "contact") return { title: "Contact the atelier" };
  if (!isShopifyConfigured()) return { title: "Information" };
  const page = await getShopPage(handle);
  return page ? { title: page.seo.title || page.title, description: page.seo.description || undefined } : { title: "Page not found" };
}

export default async function ShopifyPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  if (handle === "contact") return <main className="content-page contact-page"><span className="eyebrow">WE’RE HERE TO HELP</span><h1>A note to<br /><em>the atelier.</em></h1><p>For questions about an order or a piece, send us a note and the team will be in touch.</p><ContactForm shopDomain={process.env.SHOPIFY_STORE_DOMAIN ?? ""} /></main>;
  if (!isShopifyConfigured()) return <main className="store-setup"><span className="eyebrow">FROM THE ATELIER</span><h1>Useful details,<br /><em>beautifully clear.</em></h1><p>Pages are managed directly through Shopify Admin.</p></main>;
  const page = await getShopPage(handle);
  if (!page) notFound();
  return <main className="content-page policy-page"><span className="eyebrow">ALPINE ATELIER / INFORMATION</span><h1>{page.title}</h1><article dangerouslySetInnerHTML={{ __html: page.body }} /></main>;
}
