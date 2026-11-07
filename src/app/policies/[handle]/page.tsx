import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getShopContent, type ShopifyPolicy } from "@/lib/shopify/content";

const policyLinks = [
  { handle: "shipping-policy", label: "Shipping" },
  { handle: "refund-policy", label: "Returns" },
  { handle: "privacy-policy", label: "Privacy" },
  { handle: "terms-of-service", label: "Terms" },
];

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
  const activePolicy = policyLinks.find((policy) => policy.handle === handle);
  if (!activePolicy || !policyFields[handle]) notFound();
  const policyIndex = policyLinks.indexOf(activePolicy);
  if (!isShopifyConfigured()) {
    return (
      <main className="policy-page">
        <div className="policy-breadcrumb"><Link href="/">HOME</Link><span>/</span><span>CUSTOMER CARE</span></div>
        <header className="policy-hero">
          <span className="eyebrow">CUSTOMER CARE / {String(policyIndex + 1).padStart(2, "0")}—04</span>
          <h1>{activePolicy.label}</h1>
          <p>Helpful details, kept together in one place.</p>
        </header>
        <div className="policy-layout">
          <PolicyNavigation activeHandle={handle} />
          <article className="policy-article">
            <p>Store policies are published and maintained through Shopify Admin. Connect the storefront to view the current policy details.</p>
          </article>
        </div>
      </main>
    );
  }
  const policy = (await getShopContent())[policyFields[handle]] as ShopifyPolicy | null;
  if (!policy) notFound();
  return (
    <main className="policy-page">
      <div className="policy-breadcrumb"><Link href="/">HOME</Link><span>/</span><span>CUSTOMER CARE</span></div>
      <header className="policy-hero">
        <span className="eyebrow">CUSTOMER CARE / {String(policyIndex + 1).padStart(2, "0")}—04</span>
        <h1>{policy.title}</h1>
        <p>Helpful details, kept together in one place.</p>
      </header>
      <div className="policy-layout">
        <PolicyNavigation activeHandle={handle} />
        <article className="policy-article" dangerouslySetInnerHTML={{ __html: policy.body }} />
      </div>
    </main>
  );
}

function PolicyNavigation({ activeHandle }: { activeHandle: string }) {
  return (
    <nav className="policy-navigation" aria-label="Customer care policies">
      <span className="policy-navigation-label">POLICY INDEX</span>
      {policyLinks.map((policy, index) => (
        <Link
          href={`/policies/${policy.handle}`}
          key={policy.handle}
          aria-current={activeHandle === policy.handle ? "page" : undefined}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          {policy.label}
        </Link>
      ))}
      <div className="policy-navigation-note">
        <span>NEED A HAND?</span>
        <Link href="/pages/contact">Get in touch <span aria-hidden="true">↗</span></Link>
      </div>
    </nav>
  );
}
