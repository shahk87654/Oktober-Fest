import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStorePolicy } from "@/lib/policy";

type Props = { params: Promise<{ handle: string }> };
const titles: Record<string, string> = {
  "shipping-policy": "Shipping & delivery",
  "refund-policy": "Returns & refunds",
  "privacy-policy": "Privacy policy",
  "terms-of-service": "Terms of service",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  if (!titles[handle]) notFound();
  return { title: titles[handle], alternates: { canonical: `/policies/${handle}` } };
}

export default async function PolicyPage({ params }: Props) {
  const { handle } = await params;
  const title = titles[handle];
  if (!title) notFound();
  const policy = await getStorePolicy();
  const paragraph = handle === "shipping-policy"
    ? policy.shippingCopy
    : handle === "refund-policy"
      ? policy.returnsCopy
      : handle === "privacy-policy"
        ? "We use information you provide to fulfill orders, support your account and communicate with you when you have chosen to receive updates. Optional analytics are enabled only after your consent. Contact servus@wiesnatelier.com to ask about your personal information."
        : "By using this storefront, you agree to use it lawfully and to review the product, shipping and return details before placing an order. Prices, product availability and delivery options are confirmed at checkout.";
  return <article className="page-shell policy-page"><nav aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>{title}</span></nav><p className="eyebrow">The important details</p><h1 className="display">{title}</h1><p>{paragraph}</p><p>For help, write to <a href="mailto:servus@wiesnatelier.com">servus@wiesnatelier.com</a>. Our team will be glad to assist.</p><style>{`
    .policy-page { min-height:55vh; padding-block:1rem 6rem; }.policy-page nav { display:flex; gap:.6rem; margin-bottom:3rem; font-size:.68rem; }.policy-page nav span { color:var(--muted); }.policy-page>.eyebrow { color:var(--pretzel); }
    .policy-page h1 { max-width:850px; margin:.6rem 0 1.5rem; font-size:clamp(3rem,7vw,6rem); line-height:.96; }.policy-page>p:not(.eyebrow) { max-width:760px; color:#4e524a; font-size:.88rem; line-height:1.8; }.policy-page a:not([href="/"]) { text-decoration:underline; text-decoration-color:var(--gold); text-underline-offset:3px; }
  `}</style></article>;
}
