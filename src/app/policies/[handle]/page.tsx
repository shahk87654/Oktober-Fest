import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, ShieldCheck } from "lucide-react";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getShopContent, type ShopifyPolicy } from "@/lib/shopify/content";

const policyLinks = [
  { handle: "shipping-policy", label: "Shipping Policy" },
  { handle: "refund-policy", label: "Returns & Exchanges" },
  { handle: "privacy-policy", label: "Privacy Policy" },
  { handle: "terms-of-service", label: "Terms of Service" },
];

const policyFields: Record<
  string,
  keyof Pick<
    Awaited<ReturnType<typeof getShopContent>>,
    "privacyPolicy" | "termsOfService" | "refundPolicy" | "shippingPolicy"
  >
> = {
  "privacy-policy": "privacyPolicy",
  "terms-of-service": "termsOfService",
  "refund-policy": "refundPolicy",
  "shipping-policy": "shippingPolicy",
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  if (!isShopifyConfigured() || !policyFields[handle]) return { title: "Customer Care" };
  const policy = (await getShopContent())[policyFields[handle]] as ShopifyPolicy | null;
  return policy
    ? { title: policy.title, alternates: { canonical: `/policies/${handle}` } }
    : { title: "Customer Care" };
}

export default async function PolicyPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const activePolicy = policyLinks.find((policy) => policy.handle === handle);
  if (!activePolicy || !policyFields[handle]) notFound();

  if (!isShopifyConfigured()) {
    return (
      <main className="policy-page">
        <div className="cart-breadcrumb mb-6">
          <Link href="/" className="hover:text-emerald-800">Home</Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">{activePolicy.label}</span>
        </div>
        <header className="policy-hero mb-8">
          <span className="eyebrow">
            <i /> CLIENT ASSURANCE
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium mt-2 mb-3 text-slate-900">
            {activePolicy.label}
          </h1>
          <p className="text-slate-500 text-sm">Clear guidelines and assurances for our global clientele.</p>
        </header>
        <div className="policy-layout">
          <PolicyNavigation activeHandle={handle} />
          <article className="policy-article">
            <p>
              Store policies are maintained securely through your Shopify store admin. Once connected, the official policy language will render directly here.
            </p>
          </article>
        </div>
      </main>
    );
  }

  const policy = (await getShopContent())[policyFields[handle]] as ShopifyPolicy | null;
  if (!policy) notFound();

  return (
    <main className="policy-page">
      <div className="cart-breadcrumb mb-6">
        <Link href="/" className="hover:text-emerald-800">Home</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">{policy.title}</span>
      </div>
      <header className="policy-hero mb-8">
        <span className="eyebrow">
          <i /> CLIENT ASSURANCE
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-medium mt-2 mb-3 text-slate-900">
          {policy.title}
        </h1>
        <p className="text-slate-500 text-sm">Clear guidelines and assurances for our global clientele.</p>
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
      <span className="policy-navigation-label">LEGAL &amp; POLICIES</span>
      {policyLinks.map((policy) => (
        <Link
          href={`/policies/${policy.handle}`}
          key={policy.handle}
          aria-current={activeHandle === policy.handle ? "page" : undefined}
        >
          {policy.label}
        </Link>
      ))}
      <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
          NEED ASSISTANCE?
        </span>
        <Link
          href="/pages/contact"
          className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
        >
          <span>Contact Concierge</span>
          <ArrowUpRight size={13} />
        </Link>
      </div>
    </nav>
  );
}
