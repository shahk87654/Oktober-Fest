import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getShopContent, type ShopifyPolicy } from "@/lib/shopify/content";

const policyFields: Record<string, keyof Pick<Awaited<ReturnType<typeof getShopContent>>, "privacyPolicy" | "termsOfService" | "refundPolicy" | "shippingPolicy">> = {
  "privacy-policy": "privacyPolicy",
  "terms-of-service": "termsOfService",
  "refund-policy": "refundPolicy",
  "shipping-policy": "shippingPolicy",
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  if (!isShopifyConfigured() || !policyFields[handle]) return { title: "Customer care" };
  const policy = (await getShopContent())[policyFields[handle]] as ShopifyPolicy | null;
  return policy ? { title: policy.title, alternates: { canonical: `/policies/${handle}` } } : { title: "Customer care" };
}

export default async function PolicyPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  if (!policyFields[handle]) notFound();
  if (!isShopifyConfigured()) return <main className="store-setup"><span className="eyebrow">CUSTOMER CARE</span><h1>Details,<br /><em>from the atelier.</em></h1><p>Store policies are published and maintained through Shopify Admin.</p></main>;
  const policy = (await getShopContent())[policyFields[handle]] as ShopifyPolicy | null;
  if (!policy) notFound();
  return <main className="policy-page"><span className="eyebrow">CUSTOMER CARE / {handle.replaceAll("-", " ").toUpperCase()}</span><h1>{policy.title}</h1><article dangerouslySetInnerHTML={{ __html: policy.body }} /></main>;
}
